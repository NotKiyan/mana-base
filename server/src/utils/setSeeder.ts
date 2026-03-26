import sequelize from '../models/index.js';
import { Set as MTGSet } from '../models/mtg.js';

/**
 * Fetches ALL sets from the Scryfall /sets API and upserts them into our DB.
 * Run this BEFORE the fullSeeder stages to ensure all sets exist.
 *
 * Usage: npx tsx src/utils/setSeeder.ts
 */

interface ScryfallSet {
    id: string;
    code: string;
    name: string;
    set_type: string;
    released_at?: string;
    parent_set_code?: string;
    icon_svg_uri?: string;
    digital?: boolean;
    card_count?: number;
    block?: string;
    block_code?: string;
    nonfoil_only?: boolean;
    foil_only?: boolean;
}

async function seedSets() {
    console.log('\n=== Seeding Sets from Scryfall /sets API ===\n');

    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Sync the Set table (alter: true adds new columns without dropping)
        await MTGSet.sync({ alter: true });
        console.log('Set table synced.');

        // Fetch all sets from Scryfall
        console.log('Fetching sets from Scryfall...');
        const resp = await fetch('https://api.scryfall.com/sets');
        if (!resp.ok) {
            throw new Error(`Scryfall API error: ${resp.status} ${resp.statusText}`);
        }
        const json = await resp.json();
        const sets: ScryfallSet[] = json.data;

        console.log(`Received ${sets.length} sets from Scryfall.`);

        // We need to upsert in two passes:
        //   1. First pass: upsert all sets WITHOUT parent_set_code (avoids FK constraint issues)
        //   2. Second pass: update parent_set_code for sets that have one

        // Pass 1: Upsert all sets
        let upserted = 0;
        let errors = 0;

        for (const s of sets) {
            try {
                await MTGSet.upsert({
                    set_code: s.code,
                    set_name: s.name,
                    release_date: s.released_at || null,
                    set_type: s.set_type,
                    icon_svg_uri: s.icon_svg_uri || null,
                    scryfall_id: s.id,
                    digital: s.digital || false,
                    card_count: s.card_count || 0,
                    block_name: s.block || null,
                    block_code: s.block_code || null,
                    nonfoil_only: s.nonfoil_only || false,
                    foil_only: s.foil_only || false,
                    // parent_set_code set in pass 2
                });
                upserted++;
            } catch (err: any) {
                errors++;
                if (errors <= 10) {
                    console.error(`Error upserting set ${s.code}: ${err.message}`);
                }
            }
        }

        console.log(`Pass 1 complete: ${upserted} sets upserted, ${errors} errors.`);

        // Pass 2: Update parent_set_code (now all sets exist in DB)
        let parentsUpdated = 0;
        for (const s of sets) {
            if (s.parent_set_code) {
                try {
                    await MTGSet.update(
                        { parent_set_code: s.parent_set_code },
                        { where: { set_code: s.code } }
                    );
                    parentsUpdated++;
                } catch (err: any) {
                    console.warn(`Could not set parent for ${s.code} -> ${s.parent_set_code}: ${err.message}`);
                }
            }
        }

        console.log(`Pass 2 complete: ${parentsUpdated} parent relationships set.`);
        console.log(`\n=== Set Seeding Complete ===`);
        console.log(`Total sets in Scryfall: ${sets.length}`);
        console.log(`Successfully upserted: ${upserted}`);
        process.exit(0);

    } catch (error) {
        console.error('Set seeding failed:', error);
        process.exit(1);
    }
}

seedSets();
