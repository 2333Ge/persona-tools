/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === 'production' ? '/persona-tools-h5' : '',
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
