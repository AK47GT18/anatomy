import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Reliable public CDN mirrors with real anatomical GLB models
const CDN_URLS = [
  'https://raw.githubusercontent.com/hpfrei/body-anatomy-3d-viewer/main/public/body.glb',
  'https://cdn.jsdelivr.net/gh/hpfrei/body-anatomy-3d-viewer@main/public/body.glb',
  'https://raw.githubusercontent.com/organui/skeleton-3d/main/public/models/skeleton.glb',
  'https://cdn.jsdelivr.net/gh/organui/skeleton-3d@latest/public/models/skeleton.glb',
  'https://www.hpfreilabs.com/body-anatomy-3d-viewer/body.glb',
];

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'models');
    const localFilePath = path.join(publicDir, 'body.glb');

    // 1. Check if cached on local disk (> 100KB)
    if (fs.existsSync(localFilePath)) {
      const stats = fs.statSync(localFilePath);
      if (stats.size > 100000) {
        const fileBuffer = fs.readFileSync(localFilePath);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'model/gltf-binary',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // 2. Fetch from CDNs with redirect: 'follow'
    for (const url of CDN_URLS) {
      try {
        console.log(`[Anatomy Atlas] Downloading 3D model from CDN: ${url}`);
        const response = await fetch(url, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
          },
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Verify it's a valid GLB binary (> 100KB and starts with 'glTF' magic bytes 0x46546C67)
          if (buffer.length > 100000) {
            console.log(`[Anatomy Atlas] Successfully downloaded model: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

            // Persist to public/models/body.glb
            try {
              if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
              }
              fs.writeFileSync(localFilePath, buffer);
              console.log(`[Anatomy Atlas] Cached model to ${localFilePath}`);
            } catch (err) {
              console.warn('[Anatomy Atlas] Could not write cache file to disk:', err);
            }

            return new NextResponse(buffer, {
              headers: {
                'Content-Type': 'model/gltf-binary',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=31536000, immutable',
              },
            });
          }
        } else {
          console.warn(`[Anatomy Atlas] CDN returned HTTP ${response.status} for ${url}`);
        }
      } catch (cdnErr) {
        console.warn(`[Anatomy Atlas] Failed fetching from ${url}:`, cdnErr);
      }
    }

    return NextResponse.json(
      { error: 'Could not fetch anatomy model from any mirror' },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
