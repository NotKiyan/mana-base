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

// Associations
Card.hasMany(Edition, { foreignKey: 'card_id' });
Edition.belongsTo(Card, { foreignKey: 'card_id' });

Set.hasMany(Edition, { foreignKey: 'set_code' });
Edition.belongsTo(Set, { foreignKey: 'set_code' });

Edition.hasMany(PricePoint, { foreignKey: 'edition_id' });
PricePoint.belongsTo(Edition, { foreignKey: 'edition_id' });

Card.hasMany(CardFace, { foreignKey: 'card_id' });
CardFace.belongsTo(Card, { foreignKey: 'card_id' });

Card.hasMany(CardColorIdentity, { foreignKey: 'card_id' });
CardColorIdentity.belongsTo(Card, { foreignKey: 'card_id' });
