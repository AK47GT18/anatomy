/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],

  // Serve static assets (GLBs, DRACO wasm) with long-lived cache headers
  // so returning users never re-download unchanged models.
  async headers() {
    return [
      {
        // GLB models — content-addressed, safe to cache for 1 year
        source: '/models/:file*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Content-Encoding', value: 'identity' },
        ],
      },
      {
        // DRACO decoder — also versioned, cache for 1 year
        source: '/draco/:file*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
