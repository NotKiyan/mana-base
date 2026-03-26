import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const neoDriver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'password')
);

async function findUrza() {
    const session = neoDriver.session();
    try {
        const res = await session.run('MATCH (c:Card) WHERE c.name CONTAINS "Urza, Lord Protector" RETURN c.id, c.name');
        res.records.forEach(r => console.log(`ID: ${r.get('c.id')}, NAME: ${r.get('c.name')}`));
    } finally {
        await session.close();
        await neoDriver.close();
    }
}

findUrza();
