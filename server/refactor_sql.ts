import sequelize from './src/models/index.js';

async function refactor() {
    try {
        console.log('Refactoring decklist table...');
        // 1. Remove foreign key if it exists
        await sequelize.query('ALTER TABLE decklist DROP CONSTRAINT IF EXISTS decklist_user_id_fkey');
        // 2. Change type to VARCHAR(24)
        await sequelize.query('ALTER TABLE decklist ALTER COLUMN user_id TYPE VARCHAR(24)');
        console.log('Success!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

refactor();
