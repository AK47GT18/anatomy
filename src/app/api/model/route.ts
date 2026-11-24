import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Anatomy atlas 3D assets are served statically from /models/*.glb',
  });
}
