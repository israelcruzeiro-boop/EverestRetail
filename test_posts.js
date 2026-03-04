import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Fetching posts...");
    const { data, error } = await supabase
        .from('posts')
        .select('id, title, boosted_until')
        .order('boosted_until', { ascending: false });

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Total posts:", data.length);
        console.log("Posts with boosted_until:", data.filter(p => p.boosted_until));
        const now = new Date();
        console.log("Now:", now.toISOString());
        console.log("Active boosted posts:", data.filter(p => p.boosted_until && new Date(p.boosted_until) > now));
    }
}
run();
