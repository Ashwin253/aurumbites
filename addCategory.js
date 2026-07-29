require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Let's hope this has insert permissions, else we ask the user for SQL.

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const title = "Imported Cheese";
  const handle = "imported-cheese";

  // Check if it exists
  const { data: existing } = await supabase.from('categories').select('id').eq('handle', handle).maybeSingle();
  
  if (existing) {
    console.log(`Category "${title}" already exists.`);
    return;
  }

  const { data, error } = await supabase.from('categories').insert([{
    title: title,
    handle: handle,
    image_url: null
  }]);

  if (error) {
    console.error("Error inserting category:", error.message);
  } else {
    console.log(`Successfully added category "${title}"!`);
  }
}

main();
