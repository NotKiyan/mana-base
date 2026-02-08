-- ==========================================
-- MTG DBMS: Scryfall-Level Implementation
-- ==========================================

-- 1. Reference Tables (Independent)
CREATE TABLE Color (
    color_id CHAR(1) PRIMARY KEY, -- W, U, B, R, G, C
    color_name VARCHAR(20) NOT NULL
);

CREATE TABLE Set (
    set_code VARCHAR(10) PRIMARY KEY,
    set_name VARCHAR(255) NOT NULL,
    release_date DATE,
    set_type VARCHAR(50)
);

CREATE TABLE Type (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Subtype (
    subtype_id SERIAL PRIMARY KEY,
    subtype_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Keyword (
    keyword_id SERIAL PRIMARY KEY,
    keyword_name VARCHAR(100) UNIQUE NOT NULL,
    keyword_type VARCHAR(20) -- 'Ability' or 'Action'
);

CREATE TABLE Platform (
    platform_id SERIAL PRIMARY KEY,
    platform_name VARCHAR(20) UNIQUE NOT NULL -- Paper, Arena, MTGO
);

CREATE TABLE Format (
    format_id SERIAL PRIMARY KEY,
    format_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Legality_Status (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(20) UNIQUE NOT NULL -- Legal, Banned, Restricted
);

CREATE TABLE Player (
    player_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100)
);

-- 2. Core Card Tables
CREATE TABLE Card (
    card_id UUID PRIMARY KEY,
    oracle_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    layout VARCHAR(50),
    reserved_list BOOLEAN DEFAULT FALSE
);

CREATE TABLE Card_Face (
    face_id SERIAL PRIMARY KEY,
    card_id UUID NOT NULL,
    face_index INT DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    mana_cost VARCHAR(100),
    cmc DECIMAL(4,1),
    oracle_text TEXT,
    flavor_text TEXT,
    power VARCHAR(10),
    toughness VARCHAR(10),
    FOREIGN KEY (card_id) REFERENCES Card(card_id) ON DELETE CASCADE
);

-- 3. Relationships & Meta-Data
CREATE TABLE Related_Card (
    source_card_id UUID,
    target_card_id UUID,
    relationship_type VARCHAR(50),
    PRIMARY KEY (source_card_id, target_card_id),
    FOREIGN KEY (source_card_id) REFERENCES Card(card_id),
    FOREIGN KEY (target_card_id) REFERENCES Card(card_id)
);

CREATE TABLE Card_ColorIdentity (
    card_id UUID,
    color_id CHAR(1),
    PRIMARY KEY (card_id, color_id),
    FOREIGN KEY (card_id) REFERENCES Card(card_id),
    FOREIGN KEY (color_id) REFERENCES Color(color_id)
);

CREATE TABLE Card_Produces (
    card_id UUID,
    color_id CHAR(1),
    PRIMARY KEY (card_id, color_id),
    FOREIGN KEY (card_id) REFERENCES Card(card_id),
    FOREIGN KEY (color_id) REFERENCES Color(color_id)
);

-- 4. Face-Specific Attributes
CREATE TABLE Face_Type (
    face_id INT,
    type_id INT,
    PRIMARY KEY (face_id, type_id),
    FOREIGN KEY (face_id) REFERENCES Card_Face(face_id),
    FOREIGN KEY (type_id) REFERENCES Type(type_id)
);

CREATE TABLE Face_Subtype (
    face_id INT,
    subtype_id INT,
    PRIMARY KEY (face_id, subtype_id),
    FOREIGN KEY (face_id) REFERENCES Card_Face(face_id),
    FOREIGN KEY (subtype_id) REFERENCES Subtype(subtype_id)
);

CREATE TABLE Face_Keyword (
    face_id INT,
    keyword_id INT,
    PRIMARY KEY (face_id, keyword_id),
    FOREIGN KEY (face_id) REFERENCES Card_Face(face_id),
    FOREIGN KEY (keyword_id) REFERENCES Keyword(keyword_id)
);

-- 5. Physical Printings & Rules
CREATE TABLE Edition (
    edition_id UUID PRIMARY KEY,
    card_id UUID NOT NULL,
    set_code VARCHAR(10) NOT NULL,
    rarity VARCHAR(20),
    artist VARCHAR(255),
    collector_number VARCHAR(20),
    image_url_normal TEXT,
    image_url_small TEXT,
    frame_version VARCHAR(10),
    frame_effect VARCHAR(50),
    finishes VARCHAR(50),
    is_promo BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (card_id) REFERENCES Card(card_id),
    FOREIGN KEY (set_code) REFERENCES Set(set_code)
);

CREATE TABLE Ruling (
    ruling_id SERIAL PRIMARY KEY,
    oracle_id UUID NOT NULL, -- Links to all versions of the card
    published_at DATE,
    comment TEXT
);

-- 6. Specialized Card Data
CREATE TABLE Planeswalker (
    card_id UUID PRIMARY KEY,
    starting_loyalty VARCHAR(10),
    FOREIGN KEY (card_id) REFERENCES Card(card_id)
);

CREATE TABLE Loyalty_Ability (
    ability_id SERIAL PRIMARY KEY,
    card_id UUID NOT NULL,
    loyalty_cost VARCHAR(10),
    effect_text TEXT,
    is_ultimate BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (card_id) REFERENCES Card(card_id)
);

-- 7. Legality & Platform
CREATE TABLE Card_Platform (
    card_id UUID,
    platform_id INT,
    PRIMARY KEY (card_id, platform_id),
    FOREIGN KEY (card_id) REFERENCES Card(card_id),
    FOREIGN KEY (platform_id) REFERENCES Platform(platform_id)
);

CREATE TABLE Card_Legality (
    legality_id SERIAL PRIMARY KEY,
    card_id UUID NOT NULL,
    format_id INT NOT NULL,
    status_id INT NOT NULL,
    FOREIGN KEY (card_id) REFERENCES Card(card_id),
    FOREIGN KEY (format_id) REFERENCES Format(format_id),
    FOREIGN KEY (status_id) REFERENCES Legality_Status(status_id)
);

-- 8. Economics & Metagame
CREATE TABLE Price_Point (
    price_point_id SERIAL PRIMARY KEY,
    edition_id UUID NOT NULL,
    date_recorded DATE NOT NULL,
    market_price_usd DECIMAL(10,2),
    foil_price_usd DECIMAL(10,2),
    FOREIGN KEY (edition_id) REFERENCES Edition(edition_id)
);

CREATE TABLE Tournament (
    tournament_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date_held DATE,
    format_id INT,
    attendance INT,
    FOREIGN KEY (format_id) REFERENCES Format(format_id)
);

CREATE TABLE Deck_Archetype (
    archetype_id SERIAL PRIMARY KEY,
    archetype_name VARCHAR(100) NOT NULL,
    format_id INT,
    FOREIGN KEY (format_id) REFERENCES Format(format_id)
);

CREATE TABLE Decklist (
    decklist_id SERIAL PRIMARY KEY,
    player_id INT,
    tournament_id INT,
    archetype_id INT,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    final_rank INT,
    FOREIGN KEY (player_id) REFERENCES Player(player_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id),
    FOREIGN KEY (archetype_id) REFERENCES Deck_Archetype(archetype_id)
);

CREATE TABLE Deck_Entry (
    entry_id SERIAL PRIMARY KEY,
    decklist_id INT NOT NULL,
    card_id UUID NOT NULL,
    quantity INT DEFAULT 1,
    is_sideboard BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (decklist_id) REFERENCES Decklist(decklist_id),
    FOREIGN KEY (card_id) REFERENCES Card(card_id)
);