/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:5000/api/:path*',
                },
            ];
        }
        return [];
    },
};

export default nextConfig;
