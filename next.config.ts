import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 coerces any quality not listed here to the closest allowed value,
    // so 100 has to be opted into for the sign-in wordmark to stay crisp.
    qualities: [75, 100],
  },
};

export default nextConfig;
