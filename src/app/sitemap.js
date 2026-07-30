export default function sitemap() {
  const baseUrl = 'https://aurumbites.co.in';
  
  // Make sure baseUrl doesn't end with a slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/shop',
    '/login',
    '/register',
    '/quick-shipping',
  ].map((route) => ({
    url: `${cleanBaseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  const brands = [
    'Amul', 'crme-italia', 'dairy-craft', 'modern-dairy', 'pasta-zara', 
    'mccain', 'prestige', 'jacks-cheese', 'gran-mantovano', 'vega-gourmet', 
    'fortune', 'chevre', 'fiorella', 'arla', 'hungritos', 'kanaki', 
    'richs', 'ybarra'
  ];

  const categories = [
    'butter', 'cheese--slice', 'cream', 'fresh-cheese', 'fries', 
    'oil', 'imported-cheese'
  ];

  const cities = [
    'Delhi', 'DElhi NCR', 'West Delhi', 'North Delhi'
  ];

  const brandRoutes = brands.map((brand) => {
    // Generate slug from brand name
    const slug = brand.toLowerCase().replace(/\s+/g, '-');
    return {
      url: `${cleanBaseUrl}/brand/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  const categoryRoutes = categories.map((category) => {
    const slug = category.toLowerCase().replace(/\s+/g, '-');
    return {
      url: `${cleanBaseUrl}/category/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  const cityRoutes = cities.map((city) => {
    const slug = city.toLowerCase().replace(/\s+/g, '-');
    return {
      url: `${cleanBaseUrl}/city/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    };
  });

  return [
    ...staticRoutes,
    ...brandRoutes,
    ...categoryRoutes,
    ...cityRoutes,
  ];
}
