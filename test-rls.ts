import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fqlanybxjrpxskkqmedu.supabase.co';
const supabaseKey = 'sb_publishable_TOR4vR2QBNboGfaQvWRFeQ_-knwBk0Z';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('profiles').select('*').eq('username', 'mxmatheus');
    console.log("Result:", data, error);
}

test();
