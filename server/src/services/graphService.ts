import neo4j from 'neo4j-driver';
import { getNeo4jSession } from '../config/neo4j.js';

export interface GraphNode {
    id: string;
    labels: string[];
    properties: any;
}

export interface GraphRelationship {
    startNodeId: string;
    endNodeId: string;
    type: string;
    properties: any;
}

export const getCardGraphDetails = async (cardId: string) => {
    const session = getNeo4jSession();
    try {
        const result = await session.run(`
            MATCH (c:Card {id: $cardId})
            OPTIONAL MATCH (c)-[r:MELDS_WITH|MELDS_INTO|TRANSFORMS_INTO]-(partner:Card)
            OPTIONAL MATCH (c)-[:PRINTED_IN]->(s:Set)
            OPTIONAL MATCH (c)-[:CREATED_BY]->(a:Artist)
            RETURN c, 
                   collect(distinct {partner: partner, relationship: type(r)}) as relationships,
                   collect(distinct s) as sets,
                   collect(distinct a) as artists
        `, { cardId });

        if (result.records.length === 0) return null;

        const record = result.records[0];
        if (!record) return null;
        
        const relationships = (record.get('relationships') || []).filter((r: any) => r && r.partner).map((r: any) => ({
            relationship: r.relationship,
            partner: {
                id: r.partner.properties.id || r.partner.elementId || r.partner.identity?.toString(),
                name: r.partner.properties.name || 'Unknown Card'
            }
        }));

        const cardNode = record.get('c');
        if (!cardNode) return null;

        return {
            card: cardNode.properties,
            relationships,
            sets: (record.get('sets') || []).map((s: any) => s?.properties || {}),
            artists: (record.get('artists') || []).map((a: any) => a?.properties || {})
        };
    } finally {
        await session.close();
    }
};

export const getArtistRecommendations = async (artistName: string, limit: number = 5) => {
    const session = getNeo4jSession();
    try {
        const result = await session.run(`
            MATCH (a:Artist {name: $artistName})<-[:CREATED_BY]-(c:Card)
            RETURN c
            LIMIT $limit
        `, { artistName, limit: neo4j.int(limit) });

        return result.records.map(record => record.get('c').properties);
    } finally {
        await session.close();
    }
};

export const getSynergies = async (cardId: string, limit: number = 6) => {
    // Basic synergy based on shared types/sets (could be expanded)
    const session = getNeo4jSession();
    try {
        const result = await session.run(`
            MATCH (c:Card {id: $cardId})-[:PRINTED_IN]->(s:Set)<-[:PRINTED_IN]-(other:Card)
            WHERE c <> other
            WITH other, count(s) as commonSets
            RETURN other
            ORDER BY commonSets DESC
            LIMIT $limit
        `, { cardId, limit: neo4j.int(limit) });

        return result.records.map(record => record.get('other').properties);
    } finally {
        await session.close();
    }
};

export default {
    getCardGraphDetails,
    getArtistRecommendations,
    getSynergies
};
