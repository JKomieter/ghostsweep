import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    globalNotFound: true,
  },
  reactStrictMode: true,
  // turbopack: {
  //   rules: {
  //     '*.svg': {
  //       loaders: [
  //         {
  //           loader: '@svgr/webpack',
  //           options: {
  //             icon: true,
  //           },
  //         },
  //       ],
  //       as: '*.js',
  //     },
  //   }
  // }
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    })

    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'znlaksqttxokoeavwqjf.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: "https",
        hostname: "ghostsweep.t3.storage.dev",
        port: '',
      },
      {
        protocol: "https",
        hostname: "img.logo.dev",
        port: '',
        pathname: "/**"
      }
    ],
  },
};

export default nextConfig;
