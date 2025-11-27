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
  // Mark ably as external to prevent SSR bundling issues
  // Ably's Node.js bundle has dependencies (got, keyv, cacheable-request) 
  // that don't work in browser/SSR environments
  serverExternalPackages: ['ably'],
  // Webpack config for backward compatibility
  webpack: (config, { isServer, webpack }) => {
    // Add externals for WebSocket optional dependencies
    // These are optional deps of 'ws' module used by Ably
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

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
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^cloudinary\/lib\/utils\/analytics\/getSDKVersions$/,
        })
      );
    }
    return config;
  },
  // Turbopack config for Next.js 16+
  // Turbopack handles Node.js built-ins automatically, but we add this to silence the warning
  // Setting root explicitly to prevent Turbopack from traversing to parent directories
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
