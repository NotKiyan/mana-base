import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const neoDriver = neo4j.driver(process.env.NEO4J_URI || 'bolt://localhost:7687', neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'password'));
async function verify() {
    const session = neoDriver.session();
    try {
        const res = await session.run('MATCH (n) RETURN labels(n) as label, count(n) as count');
        console.log('NODE COUNTS:');
        res.records.forEach(r => console.log(`${r.get('label')}: ${r.get('count')}`));
        const rels = await session.run('MATCH ()-[r]->() RETURN type(r) as type, count(r) as count');
        console.log('RELATIONSHIP COUNTS:');
        rels.records.forEach(r => console.log(`${r.get('type')}: ${r.get('count')}`));
        const melds = await session.run('MATCH (c1)-[r:MELDS_WITH]->(c2) RETURN c1.name, c2.name');
        console.log('MELD SAMPLES:');
        melds.records.forEach(r => console.log(`${r.get('c1.name')} MELDS_WITH ${r.get('c2.name')}`));
    }
    finally {
        await session.close();
        await neoDriver.close();
    }
}
verify();
//# sourceMappingURL=verify_neo4j.js.map