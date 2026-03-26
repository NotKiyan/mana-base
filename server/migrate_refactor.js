import sequelize from './src/models/index.js';
async function refactorSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
        console.log('Applying refactor to Player table...');
        await sequelize.query(`
            ALTER TABLE "player" 
            ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
            ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
        `);
        console.log('Applying refactor to Decklist table...');
        await sequelize.query(`
            ALTER TABLE "decklist" 
            ADD COLUMN IF NOT EXISTS user_id INT REFERENCES "player"(player_id),
            ADD COLUMN IF NOT EXISTS deck_name VARCHAR(255) DEFAULT 'New Deck',
            ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
            
            ALTER TABLE "decklist" 
            ALTER COLUMN tournament_id DROP NOT NULL;
        `);
        console.log('Schema refactor complete!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error applying refactor:', error);
        process.exit(1);
    }
}
refactorSchema();
//# sourceMappingURL=migrate_refactor.js.map