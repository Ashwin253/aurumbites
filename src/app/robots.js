export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aurumbites.co.in';
  
  // Ensure the base URL doesn't have a trailing slash for consistent formatting
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return {
    rules: [
      {
        userAgent: "Googlebot",
          allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
      },
      {
        userAgent: ["Mediapartners-Google", "Google-Display-Ads-Bot"],
          allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
    },
      {
        userAgent: "FacebookExternalHit",
      allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
      },
      {
        userAgent:["GPTBot", "MetaBot", "MetaAdsBot", "MetaBusinessBot","OAI-SearchBot","ChatGPT-User"],
      allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
      },
      {
        userAgent: "DuckDuckGoBot",    
      allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
      },
      {
        userAgent: "YandexMobileBot",
      allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
      },
      {
        userAgent: "Baiduspider",
      allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
      },
      {
        userAgent: [
          "Applebot",
          "Bingbot",
          "Slurp",
          "AhrefsBot",
          "AhrefsSiteAudit",
          "BingPreview",
          "SiteAuditBot",
        ],
      allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
      },
      {
        userAgent: "*",
      allow: '/',
      disallow: [
        '/api/','/data/'       // Disallow crawling of internal API routes
      ],
      },
    ],
    
    sitemap: `${cleanBaseUrl}/sitemap.xml`,
  };
}
