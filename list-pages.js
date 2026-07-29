require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: brands } = await supabase.from('brands').select('*');
  
  // also fetch products to extract categories/brands not in tables
  const { data: products } = await supabase.from('products').select('*');
  
  const allCategories = new Set();
  const allBrands = new Set();
  
  if (categories) categories.forEach(c => c.handle && allCategories.add(c.handle));
  if (brands) brands.forEach(b => b.handle && allBrands.add(b.handle));
  
  if (products) {
    products.forEach(p => {
      if (p.productType) {
        const h = p.productType.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
        if (h) allCategories.add(h);
      }
      if (p.vendor) {
        const h = p.vendor.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
        if (h) allBrands.add(h);
      }
    });
  }

  console.log("=== CATEGORY PAGES ===");
  Array.from(allCategories).sort().forEach(h => console.log(`/category/${h}`));
  
  console.log("\n=== BRAND PAGES ===");
  Array.from(allBrands).sort().forEach(h => console.log(`/brand/${h}`));
}

main().catch(console.error);
