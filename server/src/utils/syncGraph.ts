import pkg from 'pg';
const { Pool } = pkg;
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pgPool = new Pool({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

const neoDriver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'password')
);

async function sync() {
    console.log('Starting Neo4j Sync...');
    const session = neoDriver.session();

    try {
        // Create indexes for performance
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (c:Card) REQUIRE c.id IS UNIQUE');
        await session.run('CREATE INDEX IF NOT EXISTS FOR (c:Card) ON (c.name)');
        await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (s:Set) REQUIRE s.code IS UNIQUE');

        // 1. Sync Sets
        console.log('Syncing Sets...');
        const setsRes = await pgPool.query('SELECT set_code, set_name, release_date FROM set');
        for (const s of setsRes.rows) {
            await session.run(
                'MERGE (s:Set {code: $code}) SET s.name = $name, s.release_date = $release_date',
                { code: s.set_code, name: s.set_name, release_date: s.release_date?.toString() || null }
            );
        }

        // 2. Sync Cards first
        console.log('Syncing all Cards...');
        const cardsMetaRes = await pgPool.query('SELECT card_id, name FROM card');
        for (const c of cardsMetaRes.rows) {
            await session.run(
                'MERGE (card:Card {id: $id}) SET card.name = $name',
                { id: c.card_id, name: c.name }
            );
        }

        // 3. Sync CardFaces (Properties and Melds)
        console.log('Syncing CardFaces and Relationships...');
        const facesRes = await pgPool.query('SELECT card_id, name, mana_cost, cmc, oracle_text FROM card_face');
        for (const f of facesRes.rows) {
            await session.run(
                'MATCH (c:Card {id: $id}) SET c.mana_cost = $mana_cost, c.cmc = $cmc',
                { id: f.card_id, mana_cost: f.mana_cost || '', cmc: parseFloat(f.cmc) || 0 }
            );

            // Extract Meld/Transform Relationships
            const text = (f.oracle_text || '').toLowerCase();
            if (text.includes('meld') || text.includes('transform')) {
                // "Meld with [Card Name]"
                const meldWithMatch = text.match(/meld with ([^,.]+)/i);
                if (meldWithMatch) {
                    await session.run(
                        'MATCH (c1:Card {id: $id}) MERGE (c2:Card {name: $partnerName}) MERGE (c1)-[:MELDS_WITH]->(c2)',
                        { id: f.card_id, partnerName: meldWithMatch[1].trim() }
                    );
                }

                // "meld them into [Card Name]" or "transforms into [Card Name]"
                const transformMatch = text.match(/(?:meld them into|transforms into) ([^,.]+)/i);
                if (transformMatch) {
                    await session.run(
                        'MATCH (c1:Card {id: $id}) MERGE (c2:Card {name: $targetName}) MERGE (c1)-[:TRANSFORMS_INTO]->(c2)',
                        { id: f.card_id, targetName: transformMatch[1].trim() }
                    );
                }
            }
        }

        // 4. Sync Editions (Printings and Artists)
        console.log('Syncing Editions and Artist relationships...');
        const editionsRes = await pgPool.query('SELECT card_id, set_code, artist FROM edition');
        for (const e of editionsRes.rows) {
            // Printing
            await session.run(
                'MATCH (card:Card {id: $id}), (s:Set {code: $code}) MERGE (card)-[:PRINTED_IN]->(s)',
                { id: e.card_id, code: e.set_code }
            );

            // Artist
            if (e.artist) {
                await session.run(
                    'MERGE (a:Artist {name: $name}) WITH a MATCH (card:Card {id: $id}) MERGE (card)-[:CREATED_BY]->(a)',
                    { name: e.artist, id: e.card_id }
                );
            }
        }

        console.log('Sync completed successfully!');
    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await session.close();
        await neoDriver.close();
        await pgPool.end();
    }
}

sync();
