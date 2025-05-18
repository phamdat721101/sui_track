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
      {
        protocol: "https",
        hostname: "api.movepump.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bridge-assets.sui.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.agora.finance",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cro-ag.pages.dev",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pntvpw2m7uxvx7j4roojxy3sb2lrc57jqzwo66kafwdjaj5v3oea.arweave.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
