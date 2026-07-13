const fallbackSiteUrl = "https://greenflowengineers.vercel.app";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, "");
