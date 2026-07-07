import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin ichida Node-ga xos ("native") qismlar bor, shuning uchun
  // Next.js uni bundle qilishga urinmasligi kerak — aks holda serverda
  // "Failed to load external module firebase-admin" xatosi chiqadi.
  serverExternalPackages: ['firebase-admin'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
