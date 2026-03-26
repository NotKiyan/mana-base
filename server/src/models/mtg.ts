import { DataTypes, Model } from 'sequelize';
import sequelize from './index.js';

export class Card extends Model { }
Card.init({
    card_id: { type: DataTypes.UUID, primaryKey: true },
    oracle_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    layout: { type: DataTypes.STRING },
    reserved_list: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'card' });

export class Set extends Model { }
Set.init({
    set_code: { type: DataTypes.STRING(10), primaryKey: true },
    set_name: { type: DataTypes.STRING, allowNull: false },
    release_date: { type: DataTypes.DATEONLY },
    set_type: { type: DataTypes.STRING(50) },
    parent_set_code: { type: DataTypes.STRING(10), allowNull: true },
    icon_svg_uri: { type: DataTypes.TEXT, allowNull: true },
    scryfall_id: { type: DataTypes.UUID, allowNull: true },
    digital: { type: DataTypes.BOOLEAN, defaultValue: false },
    card_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    block_name: { type: DataTypes.STRING(100), allowNull: true },
    block_code: { type: DataTypes.STRING(10), allowNull: true },
    nonfoil_only: { type: DataTypes.BOOLEAN, defaultValue: false },
    foil_only: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'set' });

export class Edition extends Model { }
Edition.init({
    edition_id: { type: DataTypes.UUID, primaryKey: true },
    card_id: { type: DataTypes.UUID, allowNull: false },
    set_code: { type: DataTypes.STRING(10), allowNull: false },
    rarity: { type: DataTypes.STRING(20) },
    artist: { type: DataTypes.STRING },
    collector_number: { type: DataTypes.STRING(20) },
    image_url_normal: { type: DataTypes.TEXT },
    image_url_small: { type: DataTypes.TEXT },
    frame_version: { type: DataTypes.STRING(10) },
    frame_effect: { type: DataTypes.STRING(50) },
    finishes: { type: DataTypes.STRING(50) },
    is_promo: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'edition' });

export class CardFace extends Model { }
CardFace.init({
    face_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    card_id: { type: DataTypes.UUID, allowNull: false },
    face_index: { type: DataTypes.INTEGER, defaultValue: 0 },
    name: { type: DataTypes.STRING, allowNull: false },
    mana_cost: { type: DataTypes.STRING(100) },
    cmc: { type: DataTypes.DECIMAL(4, 1) },
    oracle_text: { type: DataTypes.TEXT },
    flavor_text: { type: DataTypes.TEXT },
    power: { type: DataTypes.STRING(10) },
    toughness: { type: DataTypes.STRING(10) },
}, { sequelize, tableName: 'card_face' });

export class PricePoint extends Model { }
PricePoint.init({
    price_point_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    edition_id: { type: DataTypes.UUID, allowNull: false },
    date_recorded: { type: DataTypes.DATEONLY, allowNull: false },
    market_price_usd: { type: DataTypes.DECIMAL(10, 2) },
    foil_price_usd: { type: DataTypes.DECIMAL(10, 2) },
}, { sequelize, tableName: 'price_point' });

export class CardColorIdentity extends Model { }
CardColorIdentity.init({
    card_id: { type: DataTypes.UUID, primaryKey: true },
    color_id: { type: DataTypes.CHAR(1), primaryKey: true },
}, { sequelize, tableName: 'card_coloridentity' });

export class Type extends Model { }
Type.init({
    type_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type_name: { type: DataTypes.STRING(50), unique: true, allowNull: false }
}, { sequelize, tableName: 'type' });

export class Subtype extends Model { }
Subtype.init({
    subtype_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    subtype_name: { type: DataTypes.STRING(50), unique: true, allowNull: false }
}, { sequelize, tableName: 'subtype' });

export class Keyword extends Model { }
Keyword.init({
    keyword_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    keyword_name: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    keyword_type: { type: DataTypes.STRING(20) }
}, { sequelize, tableName: 'keyword' });

export class Format extends Model { }
Format.init({
    format_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    format_name: { type: DataTypes.STRING(50), unique: true, allowNull: false }
}, { sequelize, tableName: 'format' });

export class LegalityStatus extends Model { }
LegalityStatus.init({
    status_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status_name: { type: DataTypes.STRING(20), unique: true, allowNull: false }
}, { sequelize, tableName: 'legality_status' });

export class CardLegality extends Model { }
CardLegality.init({
    legality_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    card_id: { type: DataTypes.UUID, allowNull: false },
    format_id: { type: DataTypes.INTEGER, allowNull: false },
    status_id: { type: DataTypes.INTEGER, allowNull: false }
}, { sequelize, tableName: 'card_legality' });

export class CardLegalityPivot extends Model { }
CardLegalityPivot.init({
    card_id: { type: DataTypes.UUID, primaryKey: true },
    standard: { type: DataTypes.INTEGER, defaultValue: 2 },
    future: { type: DataTypes.INTEGER, defaultValue: 2 },
    historic: { type: DataTypes.INTEGER, defaultValue: 2 },
    timeless: { type: DataTypes.INTEGER, defaultValue: 2 },
    gladiator: { type: DataTypes.INTEGER, defaultValue: 2 },
    pioneer: { type: DataTypes.INTEGER, defaultValue: 2 },
    modern: { type: DataTypes.INTEGER, defaultValue: 2 },
    legacy: { type: DataTypes.INTEGER, defaultValue: 2 },
    pauper: { type: DataTypes.INTEGER, defaultValue: 2 },
    vintage: { type: DataTypes.INTEGER, defaultValue: 2 },
    penny: { type: DataTypes.INTEGER, defaultValue: 2 },
    commander: { type: DataTypes.INTEGER, defaultValue: 2 },
    oathbreaker: { type: DataTypes.INTEGER, defaultValue: 2 },
    standardbrawl: { type: DataTypes.INTEGER, defaultValue: 2 },
    brawl: { type: DataTypes.INTEGER, defaultValue: 2 },
    alchemy: { type: DataTypes.INTEGER, defaultValue: 2 },
    paupercommander: { type: DataTypes.INTEGER, defaultValue: 2 },
    duel: { type: DataTypes.INTEGER, defaultValue: 2 },
    oldschool: { type: DataTypes.INTEGER, defaultValue: 2 },
    premodern: { type: DataTypes.INTEGER, defaultValue: 2 },
    predh: { type: DataTypes.INTEGER, defaultValue: 2 },
}, { sequelize, tableName: 'card_legality_pivot', timestamps: false });

// Association Tables (Many-to-Many)
export class FaceType extends Model { }
FaceType.init({
    face_id: { type: DataTypes.INTEGER, primaryKey: true },
    type_id: { type: DataTypes.INTEGER, primaryKey: true }
}, { sequelize, tableName: 'face_type' });

export class FaceSubtype extends Model { }
FaceSubtype.init({
    face_id: { type: DataTypes.INTEGER, primaryKey: true },
    subtype_id: { type: DataTypes.INTEGER, primaryKey: true }
}, { sequelize, tableName: 'face_subtype' });

export class FaceKeyword extends Model { }
FaceKeyword.init({
    face_id: { type: DataTypes.INTEGER, primaryKey: true },
    keyword_id: { type: DataTypes.INTEGER, primaryKey: true }
}, { sequelize, tableName: 'face_keyword' });

// Associations
Card.hasMany(Edition, { foreignKey: 'card_id' });
Edition.belongsTo(Card, { foreignKey: 'card_id' });

Set.hasMany(Edition, { foreignKey: 'set_code' });
Edition.belongsTo(Set, { foreignKey: 'set_code' });

// Set parent/child hierarchy
Set.belongsTo(Set, { foreignKey: 'parent_set_code', as: 'ParentSet' });
Set.hasMany(Set, { foreignKey: 'parent_set_code', as: 'ChildSets' });

Edition.hasMany(PricePoint, { foreignKey: 'edition_id' });
PricePoint.belongsTo(Edition, { foreignKey: 'edition_id' });

Card.hasMany(CardFace, { foreignKey: 'card_id' });
CardFace.belongsTo(Card, { foreignKey: 'card_id' });

Card.hasMany(CardColorIdentity, { foreignKey: 'card_id' });
CardColorIdentity.belongsTo(Card, { foreignKey: 'card_id' });

// Meta Data Associations
CardFace.belongsToMany(Type, { through: FaceType, foreignKey: 'face_id' });
Type.belongsToMany(CardFace, { through: FaceType, foreignKey: 'type_id' });

CardFace.belongsToMany(Subtype, { through: FaceSubtype, foreignKey: 'face_id' });
Subtype.belongsToMany(CardFace, { through: FaceSubtype, foreignKey: 'subtype_id' });

CardFace.belongsToMany(Keyword, { through: FaceKeyword, foreignKey: 'face_id' });
Keyword.belongsToMany(CardFace, { through: FaceKeyword, foreignKey: 'keyword_id' });

Card.hasMany(CardLegality, { foreignKey: 'card_id' });
CardLegality.belongsTo(Card, { foreignKey: 'card_id' });
CardLegality.belongsTo(Format, { foreignKey: 'format_id' });
CardLegality.belongsTo(LegalityStatus, { foreignKey: 'status_id' });

Card.hasOne(CardLegalityPivot, { foreignKey: 'card_id', as: 'legalities' });
CardLegalityPivot.belongsTo(Card, { foreignKey: 'card_id', as: 'Card' });

export class Player extends Model {
    declare player_id: number;
    declare name: string;
    declare country: string | null;
    declare username: string | null;
    declare email: string | null;
    declare password_hash: string | null;
    declare role: string;
}
Player.init({
    player_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING(100) },
    username: { type: DataTypes.STRING(50), unique: true },
    email: { type: DataTypes.STRING(255), unique: true },
    password_hash: { type: DataTypes.STRING(255) },
    role: { type: DataTypes.STRING(20), defaultValue: 'user' },
}, { sequelize, tableName: 'player' });

export class Decklist extends Model {
    declare decklist_id: number;
    declare user_id: string | null;
    declare tournament_id: number | null;
    declare archetype_id: number | null;
    declare deck_name: string;
    declare is_public: boolean;
    declare wins: number;
    declare losses: number;
    declare final_rank: number | null;
}
Decklist.init({
    decklist_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.STRING(24), allowNull: true },
    tournament_id: { type: DataTypes.INTEGER, allowNull: true },
    archetype_id: { type: DataTypes.INTEGER, allowNull: true },
    deck_name: { type: DataTypes.STRING(255), defaultValue: 'New Deck' },
    is_public: { type: DataTypes.BOOLEAN, defaultValue: false },
    wins: { type: DataTypes.INTEGER, defaultValue: 0 },
    losses: { type: DataTypes.INTEGER, defaultValue: 0 },
    final_rank: { type: DataTypes.INTEGER },
}, { sequelize, tableName: 'decklist' });

export class DeckEntry extends Model {
    declare entry_id: number;
    declare decklist_id: number;
    declare card_id: string;
    declare quantity: number;
    declare is_sideboard: boolean;
}
DeckEntry.init({
    entry_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    decklist_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Decklist, key: 'decklist_id' } },
    card_id: { type: DataTypes.UUID, allowNull: false, references: { model: Card, key: 'card_id' } },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    is_sideboard: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'deck_entry' });

// Note: user_id in Decklist is now a MongoDB ObjectId string — no FK to Player table.

Decklist.hasMany(DeckEntry, { foreignKey: 'decklist_id', as: 'entries' });
DeckEntry.belongsTo(Decklist, { foreignKey: 'decklist_id' });

DeckEntry.belongsTo(Card, { foreignKey: 'card_id' });
Card.hasMany(DeckEntry, { foreignKey: 'card_id' });
