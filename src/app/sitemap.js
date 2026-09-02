import { getShopPageData } from '../lib/catalog';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aurumbites.co.in';
  
  // Make sure baseUrl doesn't end with a slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/shop',
    '/brands',
    '/collections',
    '/login',
    '/register',
    '/quick-shipping',
  ].map((route) => ({
    url: `${cleanBaseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Fallback static list
  const fallbackBrands = [
    'Amul', 'crme-italia', 'dairy-craft', 'modern-dairy', 'pasta-zara', 
    'mccain', 'prestige', 'jacks-cheese', 'gran-mantovano', 'vega-gourmet', 
    'fortune', 'chevre', 'fiorella', 'arla', 'hungritos', 'kanaki', 
    'richs', 'ybarra', 'president', 'cremeitalia', 'dlecta', 'gowardhan', 'emborg', 'philadelphia'
  ];

  const fallbackCategories = [
    'butter', 'cheese--slice', 'cream', 'fresh-cheese', 'fries', 
    'oil', 'imported-cheese'
  ];

  let brandHandles = new Set(fallbackBrands.map(b => b.toLowerCase().replace(/\s+/g, '-')));
  let collectionHandles = new Set(fallbackCategories.map(c => c.toLowerCase().replace(/\s+/g, '-')));

  try {
    const catalogData = await getShopPageData();
    if (catalogData?.brands?.length) {
      catalogData.brands.forEach((b) => {
        if (b.handle && b.handle !== 'all') {
          brandHandles.add(b.handle);
        }
      });
    }
    if (catalogData?.collections?.length) {
      catalogData.collections.forEach((c) => {
        if (c.handle && c.handle !== 'all') {
          collectionHandles.add(c.handle);
        }
      });
    }
  } catch (err) {
    console.warn("Error fetching catalog for sitemap:", err);
  }

  const brandRoutes = Array.from(brandHandles).map((slug) => ({
    url: `${cleanBaseUrl}/brand/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const collectionRoutes = Array.from(collectionHandles).map((slug) => ({
    url: `${cleanBaseUrl}/collection/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes = Array.from(collectionHandles).map((slug) => ({
    url: `${cleanBaseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const cities = [
    'delhi', 'delhi-ncr', 'west-delhi', 'north-delhi'
  ];

  const cityRoutes = cities.map((slug) => ({
    url: `${cleanBaseUrl}/city/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...brandRoutes,
    ...collectionRoutes,
    ...categoryRoutes,
    ...cityRoutes,
  ];
}
