import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chain from 'stream-chain';
import StreamJson from 'stream-json';
const { parser } = StreamJson;
import StreamArray from 'stream-json/streamers/StreamArray.js';
import sequelize from '../models/index.js';
import { Card, Set, Edition, CardFace, PricePoint, CardColorIdentity } from '../models/mtg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_PATH = path.join(__dirname, '../../../imports/all-cards-20260127102028.json');
const LIMIT = 3000;

async function seed() {
    console.log('Starting seeder...');

    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        const pipeline = chain([
            fs.createReadStream(JSON_PATH) as any,
            parser() as any,
            StreamArray.streamArray() as any
        ]);

        let count = 0;

        pipeline.on('data', async (data: { value: any }) => {
            if (count >= LIMIT) {
                pipeline.destroy();
                return;
            }

            const rawCard = data.value;
            count++;

            try {
                // 1. Handle Set
                await Set.upsert({
                    set_code: rawCard.set,
                    set_name: rawCard.set_name,
                    release_date: rawCard.released_at,
                    set_type: rawCard.set_type,
                });

                // 2. Handle Card (Parent - the concept)
                // Use oracle_id as the primary key for Card concept
                await Card.upsert({
                    card_id: rawCard.oracle_id,
                    oracle_id: rawCard.oracle_id,
                    name: rawCard.name,
                    layout: rawCard.layout,
                    reserved_list: rawCard.reserved,
                });

                // 3. Handle Edition (Child - the physical printing)
                // Scryfall 'id' is unique per printing
                await Edition.upsert({
                    edition_id: rawCard.id,
                    card_id: rawCard.oracle_id,
                    set_code: rawCard.set,
                    rarity: rawCard.rarity,
                    artist: rawCard.artist,
                    collector_number: rawCard.collector_number,
                    image_url_normal: rawCard.image_uris?.normal,
                    image_url_small: rawCard.image_uris?.small,
                    frame_version: rawCard.frame,
                    frame_effect: rawCard.frame_effects?.join(','),
                    finishes: rawCard.finishes?.join(','),
                    is_promo: rawCard.promo,
                });

                // 4. Handle Faces (Linked to Card concept)
                if (rawCard.card_faces) {
                    for (let i = 0; i < rawCard.card_faces.length; i++) {
                        const face = rawCard.card_faces[i];
                        await CardFace.findOrCreate({
                            where: { card_id: rawCard.oracle_id, face_index: i },
                            defaults: {
                                name: face.name,
                                mana_cost: face.mana_cost,
                                cmc: face.cmc,
                                oracle_text: face.oracle_text,
                                flavor_text: face.flavor_text,
                                power: face.power,
                                toughness: face.toughness,
                            }
                        });
                    }
                } else {
                    // Single face card
                    await CardFace.findOrCreate({
                        where: { card_id: rawCard.oracle_id, face_index: 0 },
                        defaults: {
                            name: rawCard.name,
                            mana_cost: rawCard.mana_cost,
                            cmc: rawCard.cmc,
                            oracle_text: rawCard.oracle_text,
                            flavor_text: rawCard.flavor_text,
                            power: rawCard.power,
                            toughness: rawCard.toughness,
                        }
                    });
                }

                // 6. Handle Color Identity
                if (rawCard.color_identity && rawCard.color_identity.length > 0) {
                    for (const colorId of rawCard.color_identity) {
                        await CardColorIdentity.findOrCreate({
                            where: { card_id: rawCard.oracle_id, color_id: colorId },
                            defaults: {}
                        });
                    }
                }

                // 7. Handle Prices
                if (rawCard.prices) {
                    await PricePoint.create({
                        edition_id: rawCard.id,
                        date_recorded: new Date(),
                        market_price_usd: rawCard.prices.usd ? parseFloat(rawCard.prices.usd) : null,
                        foil_price_usd: rawCard.prices.usd_foil ? parseFloat(rawCard.prices.usd_foil) : null,
                    });
                }

                if (count % 100 === 0) {
                    console.log(`Imported ${count} cards...`);
                }

            } catch (err: any) {
                console.error(`Error importing card ${rawCard.name}:`, err);
            }
        });

        pipeline.on('end', () => {
            console.log(`Seeding complete. Total imported: ${count}`);
            process.exit(0);
        });

        pipeline.on('error', (err: any) => {
            console.error('Pipeline error:', err);
            process.exit(1);
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

seed();
