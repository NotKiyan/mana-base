import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chain from 'stream-chain';
import StreamJson from 'stream-json';
const { parser } = StreamJson;
import StreamArray from 'stream-json/streamers/StreamArray.js';
import sequelize from '../models/index.js';
import { Card, CardColorIdentity } from '../models/mtg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_PATH = path.join(__dirname, '../../../imports/all-cards-20260127102028.json');

async function backfill() {
    console.log('Starting color identity backfill...');

    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        const pipeline = chain([
            fs.createReadStream(JSON_PATH) as any,
            parser() as any,
            StreamArray.streamArray() as any
        ]);

        let processedCount = 0;
        let identityCount = 0;
        let cardMatchCount = 0;

        pipeline.on('data', async (data: { value: any }) => {
            const rawCard = data.value;

            // We only care about cards that have a color identity
            if (rawCard.color_identity && Array.isArray(rawCard.color_identity)) {
                try {
                    // Check if this card exists in our database
                    // Remember: we used oracle_id as the primary key card_id
                    const card = await Card.findByPk(rawCard.oracle_id);

                    if (card) {
                        cardMatchCount++;
                        for (const color of rawCard.color_identity) {
                            try {
                                await CardColorIdentity.upsert({
                                    card_id: rawCard.oracle_id,
                                    color_id: color
                                });
                                identityCount++;
                            } catch (upsertErr) {
                                console.error(`Error upserting color ${color} for card ${rawCard.name}:`, upsertErr);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`Error processing colors for ${rawCard.name}:`, err);
                }
            }

            processedCount++;
            if (processedCount % 1000 === 0) {
                console.log(`Processed ${processedCount} cards from JSON... matched ${cardMatchCount} cards, added ${identityCount} identity records...`);
            }
        });

        pipeline.on('end', () => {
            console.log('Finished reading JSON.');
            console.log(`Total processed from JSON: ${processedCount}`);
            console.log(`Total active cards matched: ${cardMatchCount}`);
            console.log(`Total color identity records added/updated: ${identityCount}`);
            // Wait a bit for pending database operations
            console.log('Finalizing database operations (waiting 10s)...');
            setTimeout(() => {
                console.log('Done.');
                process.exit(0);
            }, 10000);
        });

        pipeline.on('error', (err: any) => {
            console.error('Pipeline error:', err);
            process.exit(1);
        });

    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}

backfill();
