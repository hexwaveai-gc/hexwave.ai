import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Skip TypeScript errors during build - run type checking separately in CI
  // This prevents OOM issues during build while still catching errors in development
  typescript: {
    ignoreBuildErrors: true,
  },
  // Security: Only allow images from trusted domains
  images: {
    remotePatterns: [
      // Cloudinary CDN
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.cloudinary.com' },
      // UploadThing CDN
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: '*.uploadthing.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      // Unsplash (for sample/placeholder images)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.unsplash.com' },
      // Clerk (user avatars)
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: '*.clerk.com' },
      // AI Model providers (for generated content)
      { protocol: 'https', hostname: '*.replicate.delivery' },
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: '*.fal.ai' },
      { protocol: 'https', hostname: 'fal.ai' },
      { protocol: 'https', hostname: '*.runwayml.com' },
      // HeyGen (avatar templates)
      { protocol: 'https', hostname: '*.heygen.ai' },
      { protocol: 'https', hostname: 'files2.heygen.ai' },
      { protocol: 'https', hostname: 'resource2.heygen.ai' },
      // Common CDNs
      { protocol: 'https', hostname: '*.githubusercontent.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },
  // Mark packages as external to prevent SSR bundling issues
  // - ably: Node.js bundle has dependencies that don't work in browser/SSR
  // - pino, pino-pretty, thread-stream: Worker thread packages that conflict with Next.js serverless bundling
  serverExternalPackages: ['ably', 'pino', 'pino-pretty', 'thread-stream'],
  // Webpack config for backward compatibility
  webpack: (config, { isServer, webpack }) => {
    // Add externals for WebSocket optional dependencies
    // These are optional deps of 'ws' module used by Ably
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    // Ignore why-is-node-running module (used only in test files)
    // This prevents build errors from thread-stream test files
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^why-is-node-running$/,
      }),
      // Ignore all test files in node_modules
      new webpack.IgnorePlugin({
        checkResource(resource) {
          // Ignore test files, benchmark files, and other non-production files
          if (resource.includes('node_modules')) {
            if (
              resource.includes('/test/') ||
              resource.includes('/tests/') ||
              resource.includes('/__tests__/') ||
              resource.includes('/bench') ||
              resource.match(/\.test\.(js|ts|mjs)$/) ||
              resource.match(/\.spec\.(js|ts|mjs)$/)
            ) {
              return true;
            }
          }
          return false;
        },
      })
    );

    // Exclude Node.js built-in modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        os: false,
        net: false,
        tls: false,
        child_process: false,
        util: false,
        buffer: false,
        url: false,
        querystring: false,
        http: false,
        https: false,
        zlib: false,
      };
      
      // Ignore cloudinary's analytics module that uses fs
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^cloudinary\/lib\/utils\/analytics\/getSDKVersions$/,
        })
      );
    }
    return config;
  },
  // Add empty turbopack config to silence warning when using webpack
  // We use webpack for both dev and build to ensure consistent behavior
  turbopack: {},
};

export default nextConfig;
