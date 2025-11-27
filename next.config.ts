import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Skip TypeScript errors during build - run type checking separately in CI
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**', 
      },
    ],
  },
  // Mark packages as external to prevent SSR bundling issues
  // - ably: Node.js bundle has dependencies that don't work in browser/SSR
  // - thread-stream: Contains test files that Turbopack tries to bundle
  serverExternalPackages: ['ably', 'thread-stream'],
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
};

export default nextConfig;
