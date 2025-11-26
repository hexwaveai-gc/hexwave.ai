import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
  // Webpack config for backward compatibility
  webpack: (config, { isServer, webpack }) => {
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
