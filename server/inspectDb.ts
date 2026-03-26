import sequelize from './src/models/index.js';

async function inspectDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        const tables = [
            'color', 'set', 'type', 'subtype', 'keyword', 'platform', 'format',
            'legality_status', 'player', 'card', 'card_face', 'related_card',
            'card_coloridentity', 'card_produces', 'face_type', 'face_subtype',
            'face_keyword', 'edition', 'ruling', 'planeswalker', 'loyalty_ability',
            'card_platform', 'card_legality', 'price_point', 'tournament',
            'deck_archetype', 'decklist', 'deck_entry'
        ];

        console.log('\nTable Row Counts:');
        console.log('-----------------');

        for (const table of tables) {
            try {
                const [result]: any = await sequelize.query(`SELECT COUNT(*) FROM "${table}"`);
                console.log(`${table.padEnd(20)}: ${result[0].count}`);
            } catch (err: any) {
                if (err.name === 'SequelizeDatabaseError' && err.parent.code === '42P01') {
                    console.log(`${table.padEnd(20)}: table does not exist`);
                } else {
                    console.log(`${table.padEnd(20)}: error reading table (${err.message})`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}

inspectDatabase();
