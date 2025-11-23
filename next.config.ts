import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "framerusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tjzk.replicate.delivery",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.civitai.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "leonardo.ai",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "files.readme.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blog.galaxy.ai",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "x.ai",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
