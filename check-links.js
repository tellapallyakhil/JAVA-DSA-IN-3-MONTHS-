
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkLinks() {
    try {
        const patterns = JSON.parse(fs.readFileSync('src/data/patterns.json', 'utf8'));
        const { data: dbProblems, error } = await supabase.from('problems').select('id');
        if (error) throw error;

        const dbIds = new Set(dbProblems.map(p => String(p.id)));

        let totalLinked = 0;
        let missingFromDb = 0;

        patterns.forEach(pat => {
            pat.problemIds.forEach(id => {
                totalLinked++;
                if (!dbIds.has(String(id))) {
                    missingFromDb++;
                }
            });
        });

        console.log("Total problem links in patterns.json:", totalLinked);
        console.log("Links pointing to non-existent DB items:", missingFromDb);
        console.log("Total unique problems in DB:", dbIds.size);

    } catch (err) {
        console.error(err);
    }
}
checkLinks();
