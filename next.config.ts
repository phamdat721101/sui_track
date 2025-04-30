import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hatchy.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.bifrost.finance",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "r.turbos.finance",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "chocolate-geographical-weasel-195.mypinata.cloud",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
