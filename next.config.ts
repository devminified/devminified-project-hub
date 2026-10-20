import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 coerces any quality not listed here to the closest allowed value,
    // so 100 has to be opted into for the sign-in wordmark to stay crisp.
    qualities: [75, 100],
  },
  experimental: {
    serverActions: {
      // Uploaded docs (inline text such as .sql dumps, and PDF / Word files up
      // to 15 MB) travel through Server Actions, whose default cap is 1 MB.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
