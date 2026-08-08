import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
	// Allow the local network host for HMR/dev resources when developing
	allowedDevOrigins: ["10.138.114.154", "10.224.44.154"],
};

export default withNextIntl(nextConfig);
