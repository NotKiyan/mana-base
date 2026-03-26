import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chain from 'stream-chain';
import StreamJson from 'stream-json';
const { parser } = StreamJson;
import StreamArray from 'stream-json/streamers/StreamArray.js';
import sequelize from '../models/index.js';
import {
    Card, Set as MTGSet, Edition, CardFace, PricePoint, CardColorIdentity,
    Type, Subtype, Keyword, Format, LegalityStatus,
    FaceType, FaceSubtype, FaceKeyword, CardLegalityPivot
} from '../models/mtg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_PATH = path.join(__dirname, '../../../imports/default-cards.json');

// Caches to avoid redundant queries (Global, but used primarily in Details stage)
const typeCache = new Map<string, number>();
const subtypeCache = new Map<string, number>();
const keywordCache = new Map<string, number>();
const statusCache = new Map<string, number>();

// --- Helper Functions ---

async function getOrCreateModel(model: any, cache: Map<string, number>, nameField: string, nameValue: string, idField: string) {
    if (!nameValue) return null;
    if (cache.has(nameValue)) return cache.get(nameValue)!;

    const [instance]: any = await model.findOrCreate({
        where: { [nameField]: nameValue }
    });

    const id = instance[idField];
    cache.set(nameValue, id);
    return id;
}

async function initializeCaches() {
    console.log("Initializing caches...");
    const statuses = await LegalityStatus.findAll();
    statuses.forEach((s: any) => statusCache.set(s.status_name, s.status_id));

    const types = await Type.findAll();
    types.forEach((t: any) => typeCache.set(t.type_name, t.type_id));

    const subtypes = await Subtype.findAll();
    subtypes.forEach((s: any) => subtypeCache.set(s.subtype_name, s.subtype_id));

    const keywords = await Keyword.findAll();
    keywords.forEach((k: any) => keywordCache.set(k.keyword_name, k.keyword_id));
    console.log(`Caches loaded. Statuses: ${statuses.length}, Types: ${types.length}, Subtypes: ${subtypes.length}, Keywords: ${keywords.length}`);
}

// --- Stage Processors ---

async function processStageSets(rawCard: any) {
    if (rawCard.set && rawCard.set_name) {
        await MTGSet.upsert({
            set_code: rawCard.set,
            set_name: rawCard.set_name,
            release_date: rawCard.released_at,
            set_type: rawCard.set_type
        });
    }
}

async function processStageCards(rawCard: any) {
    if (!rawCard.oracle_id) return; // Skip tokens/art cards without oracle_id

    await Card.upsert({
        card_id: rawCard.oracle_id, // Use oracle_id for deduplication
        oracle_id: rawCard.oracle_id,
        name: rawCard.name,
        layout: rawCard.layout,
        reserved_list: rawCard.reserved || false
    });

    // Color Identity is core to the card, so we do it here
    if (rawCard.color_identity && Array.isArray(rawCard.color_identity)) {
        for (const color of rawCard.color_identity) {
            await CardColorIdentity.upsert({
                card_id: rawCard.oracle_id, // Link to unique card
                color_id: color
            });
        }
    }
}

const BATCH_SIZE = 1000;

// Batch Containers
let editionBatch: any[] = [];
let priceBatch: any[] = [];

async function flushEditions() {
    if (editionBatch.length > 0) {
        try {
            await Edition.bulkCreate(editionBatch, {
                updateOnDuplicate: [
                    'set_code', 'rarity', 'artist', 'collector_number',
                    'frame_version', 'frame_effect', 'finishes', 'is_promo',
                    'image_url_normal', 'image_url_small'
                ]
            });
        } catch (err: any) {
            console.error(`Batch insert error (Editions): ${err.message}`);
        }
        editionBatch = [];
    }

    if (priceBatch.length > 0) {
        try {
            await PricePoint.bulkCreate(priceBatch);
        } catch (err: any) {
            console.error(`Batch insert error (Prices): ${err.message}`);
        }
        priceBatch = [];
    }
}

async function processStageEditions(rawCard: any) {
    if (!rawCard.oracle_id) return;

    const editionData: any = {
        edition_id: rawCard.id,
        card_id: rawCard.oracle_id,
        set_code: rawCard.set,
        rarity: rawCard.rarity,
        artist: rawCard.artist,
        collector_number: rawCard.collector_number,
        frame_version: rawCard.frame,
        frame_effect: rawCard.frame_effects ? rawCard.frame_effects.join(', ') : null,
        finishes: rawCard.finishes ? rawCard.finishes.join(', ') : null,
        is_promo: rawCard.promo || false
    };

    if (rawCard.image_uris) {
        editionData.image_url_normal = rawCard.image_uris.normal;
        editionData.image_url_small = rawCard.image_uris.small;
    }

    editionBatch.push(editionData);

    if (rawCard.prices) {
        const today = new Date().toISOString().split('T')[0];
        priceBatch.push({
            edition_id: rawCard.id,
            date_recorded: today,
            market_price_usd: rawCard.prices.usd ? parseFloat(rawCard.prices.usd) : null,
            foil_price_usd: rawCard.prices.usd_foil ? parseFloat(rawCard.prices.usd_foil) : null
        });
    }

    if (editionBatch.length >= BATCH_SIZE) {
        await flushEditions();
    }
}

async function processStageDetails(rawCard: any) {
    if (!rawCard.oracle_id) return;

    const promises: Promise<any>[] = [];

    // 1. Legalities (Pivoted Table)
    if (rawCard.legalities) {
        const pivotData: any = { card_id: rawCard.oracle_id };
        for (const [format, status] of Object.entries(rawCard.legalities)) {
            // Clean format name for columns (some might have hyphens but scryfall uses underscores or vice versa)
            // The table has columns like 'standardbrawl', 'paupercommander'
            // Object.entries on scryfall legalities gives keys like 'standard', 'paupercommander'
            const column = format.replace(/-/g, '').toLowerCase();
            const statusId = statusCache.get(status as string);
            if (statusId) {
                pivotData[column] = statusId;
            }
        }
        promises.push(CardLegalityPivot.upsert(pivotData));
    }

    // 2. Card Faces & Metadata
    const faces = rawCard.card_faces ? rawCard.card_faces : [rawCard];

    for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        promises.push((async () => {
            try {
                const [faceInstance]: any = await CardFace.findOrCreate({
                    where: {
                        card_id: rawCard.oracle_id,
                        face_index: i
                    },
                    defaults: {
                        name: face.name || rawCard.name,
                        mana_cost: face.mana_cost,
                        cmc: face.cmc !== undefined ? face.cmc : rawCard.cmc,
                        oracle_text: face.oracle_text,
                        flavor_text: face.flavor_text,
                        power: face.power,
                        toughness: face.toughness
                    }
                });

                const faceId = faceInstance.face_id;
                const facePromises: Promise<any>[] = [];

                const typeLine = face.type_line || rawCard.type_line;
                if (typeLine) {
                    const [typesPart, subtypesPart] = typeLine.split(' — ');
                    const types = typesPart ? typesPart.split(' ') : [];
                    for (const typeName of types) {
                        facePromises.push((async () => {
                            let typeId = typeCache.get(typeName);
                            if (!typeId) typeId = await getOrCreateModel(Type, typeCache, 'type_name', typeName, 'type_id');
                            if (typeId) await FaceType.upsert({ face_id: faceId, type_id: typeId });
                        })());
                    }

                    const subtypes = subtypesPart ? subtypesPart.split(' ') : [];
                    for (const subtypeName of subtypes) {
                        facePromises.push((async () => {
                            let subtypeId = subtypeCache.get(subtypeName);
                            if (!subtypeId) subtypeId = await getOrCreateModel(Subtype, subtypeCache, 'subtype_name', subtypeName, 'subtype_id');
                            if (subtypeId) await FaceSubtype.upsert({ face_id: faceId, subtype_id: subtypeId });
                        })());
                    }
                }

                const keywords = face.keywords || (i === 0 ? rawCard.keywords : []);
                if (keywords && Array.isArray(keywords)) {
                    for (const keywordName of keywords) {
                        facePromises.push((async () => {
                            let keywordId = keywordCache.get(keywordName);
                            if (!keywordId) keywordId = await getOrCreateModel(Keyword, keywordCache, 'keyword_name', keywordName, 'keyword_id');
                            if (keywordId) await FaceKeyword.upsert({ face_id: faceId, keyword_id: keywordId });
                        })());
                    }
                }

                await Promise.all(facePromises);
            } catch (err: any) {
                // Ignore Gleemax overflow, log others
                if (!err.message.includes('numeric field overflow')) {
                    console.warn(`Details error for ${rawCard.name} (Face ${i}): ${err.message}`);
                }
            }
        })());
    }

    await Promise.all(promises);
}

// --- Main Execution ---

const DETAILS_CONCURRENCY = 100;
let detailsBuffer: Promise<any>[] = [];
const processedOracleIds = new Set<string>();

async function startSeeding() {
    const args = process.argv.slice(2);
    const stageArg = args.find(arg => arg.startsWith('--stage='));

    if (!stageArg) {
        console.error('Error: Please specify a stage. Example: npx tsx src/utils/fullSeeder.ts --stage=sets');
        process.exit(1);
    }

    const stage = stageArg.split('=')[1];
    if (!stage) {
        console.error('Error: Stage value is empty.');
        process.exit(1);
    }
    console.log(`\n=== Starting Seeding Stage: ${stage.toUpperCase()} ===\n`);

    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        if (stage === 'details') {
            await initializeCaches();
        }

        const pipeline = chain([
            fs.createReadStream(JSON_PATH) as any,
            parser() as any,
            StreamArray.streamArray() as any
        ]);

        let total = 0;
        let processed = 0;
        let errors = 0;

        for await (const data of pipeline) {
            total++;
            const rawCard = (data as any).value;

            try {
                if (stage === 'sets') {
                    await processStageSets(rawCard);
                } else if (stage === 'cards') {
                    await processStageCards(rawCard);
                } else if (stage === 'editions') {
                    await processStageEditions(rawCard);
                } else if (stage === 'details') {
                    if (!rawCard.oracle_id) continue;

                    if (processedOracleIds.has(rawCard.oracle_id)) {
                        continue;
                    }
                    processedOracleIds.add(rawCard.oracle_id);

                    const p = processStageDetails(rawCard).then(() => {
                        processed++;
                    }).catch(err => {
                        errors++;
                        if (errors <= 10 || total % 1000 === 0) {
                            console.error(`Error processing ${rawCard.name}: ${err.message}`);
                        }
                    });

                    detailsBuffer.push(p);

                    if (detailsBuffer.length >= DETAILS_CONCURRENCY) {
                        await Promise.all(detailsBuffer);
                        detailsBuffer = [];
                    }
                    continue;

                } else {
                    throw new Error(`Unknown stage: ${stage}`);
                }

                processed++;
            } catch (err: any) {
                errors++;
                if (errors <= 10 || total % 1000 === 0) {
                    console.error(`Error processing ${rawCard.name}: ${err.message}`);
                }
            }

            if (total % 2500 === 0) {
                console.log(`Progress (${stage}): Scanned ${total}, Processed/Upserted ${processed}, Errors ${errors}`);
            }
        }

        if (stage === 'editions') {
            await flushEditions();
        }

        if (stage === 'details' && detailsBuffer.length > 0) {
            await Promise.all(detailsBuffer);
        }

        console.log(`\n=== Stage Complete: ${stage.toUpperCase()} ===`);
        console.log(`Total Objects Scanned: ${total}`);
        console.log(`Processed: ${processed}`);
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

startSeeding();
