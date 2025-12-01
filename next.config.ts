import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Point next-intl plugin to the request config file
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.figma.com', pathname: '/**' },
      { protocol: 'https', hostname: 'figma.com', pathname: '/**' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
