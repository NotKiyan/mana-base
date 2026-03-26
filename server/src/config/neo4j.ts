import neo4j, { Driver } from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

let driver: Driver | null = null;

export const initNeo4j = () => {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';

    try {
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
        console.log('Neo4j Driver initialized');
    } catch (error) {
        console.error('Neo4j Driver failed to initialize', error);
    }
};

export const getNeo4jSession = () => {
    if (!driver) {
        initNeo4j();
    }
    return driver!.session();
};

export const closeNeo4j = async () => {
    if (driver) {
        await driver.close();
        console.log('Neo4j Driver closed');
    }
};

export default {
    initNeo4j,
    getNeo4jSession,
    closeNeo4j
};
