/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a production build run in its own folder while `next dev` is running (NEXT_DIST_DIR=.next-build).
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
