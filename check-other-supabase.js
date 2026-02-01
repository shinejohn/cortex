import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../Code/daynews/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error('No VITE_SUPABASE_URL found');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const tables = [
        'users', 'profiles', 'communities', 'news', 'events', 'businesses',
        'reviews', 'marketplace_listings', 'marketplace_items', 'announcements',
        'legal_notices', 'coupons', 'deals', 'ads', 'comments', 'likes',
        'saved_items', 'photos', 'business_hours', 'business_categories'
    ];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`${table}: ERROR - ${error.message}`);
        } else {
            console.log(`${table}: ${count} rows`);
        }
    }
}

main();
