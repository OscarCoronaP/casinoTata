/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/football/**",
      },
      {
        protocol: "https",
        hostname: "v3.football.api-sports.io",
      },
    ],
  },
};

export default nextConfig;
