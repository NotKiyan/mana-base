-- ==========================================
-- MTG DBMS: Procedures and Triggers Enhancements
-- ==========================================
-- 0. Schema Adjustments
ALTER TABLE "set"
ADD COLUMN IF NOT EXISTS card_count INT DEFAULT 0;
-- 1. Triggers for Data Integrity and Automation
-- A. Audit Table for Price Changes
CREATE TABLE IF NOT EXISTS Price_History (
    history_id SERIAL PRIMARY KEY,
    edition_id UUID NOT NULL,
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2),
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (edition_id) REFERENCES Edition(edition_id)
);
CREATE OR REPLACE FUNCTION log_price_change() RETURNS TRIGGER AS $$ BEGIN IF (
        OLD.market_price_usd IS DISTINCT
        FROM NEW.market_price_usd
    ) THEN
INSERT INTO Price_History (edition_id, old_price, new_price)
VALUES (
        NEW.edition_id,
        OLD.market_price_usd,
        NEW.market_price_usd
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_price_change
AFTER
UPDATE ON Price_Point FOR EACH ROW EXECUTE FUNCTION log_price_change();
-- B. Maintain Set Card Count Automatically
CREATE OR REPLACE FUNCTION update_set_card_count() RETURNS TRIGGER AS $$ BEGIN IF (TG_OP = 'INSERT') THEN
UPDATE
Set
SET card_count = card_count + 1
WHERE set_code = NEW.set_code;
ELSIF (TG_OP = 'DELETE') THEN
UPDATE
Set
SET card_count = card_count - 1
WHERE set_code = OLD.set_code;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_set_card_count
AFTER
INSERT
    OR DELETE ON Edition FOR EACH ROW EXECUTE FUNCTION update_set_card_count();
-- 2. Stored Procedures for Complex Operations
-- A. Simplify Card and Face Insertion
CREATE OR REPLACE PROCEDURE Add_Basic_Card(
        p_card_id UUID,
        p_oracle_id UUID,
        p_name VARCHAR,
        p_layout VARCHAR,
        p_mana_cost VARCHAR,
        p_cmc DECIMAL,
        p_oracle_text TEXT
    ) LANGUAGE plpgsql AS $$ BEGIN -- Insert into Card
INSERT INTO Card (card_id, oracle_id, name, layout)
VALUES (p_card_id, p_oracle_id, p_name, p_layout);
-- Insert into Card_Face (assuming single face for basic cards)
INSERT INTO Card_Face (card_id, name, mana_cost, cmc, oracle_text)
VALUES (
        p_card_id,
        p_name,
        p_mana_cost,
        p_cmc,
        p_oracle_text
    );
END;
$$;
-- B. Validate Decklist Quantity
-- Ensures no more than 4 copies of a non-basic land card in a deck
CREATE OR REPLACE FUNCTION validate_deck_limits(p_decklist_id INT) RETURNS BOOLEAN AS $$
DECLARE v_invalid_count INT;
BEGIN
SELECT COUNT(*) INTO v_invalid_count
FROM Deck_Entry de
    JOIN Card c ON de.card_id = c.card_id
WHERE de.decklist_id = p_decklist_id
    AND de.quantity > 4
    AND c.name NOT IN (
        'Plains',
        'Island',
        'Swamp',
        'Mountain',
        'Forest',
        'Wastes',
        'Snow-Covered Plains',
        'Snow-Covered Island',
        'Snow-Covered Swamp',
        'Snow-Covered Mountain',
        'Snow-Covered Forest'
    );
RETURN v_invalid_count = 0;
END;
$$ LANGUAGE plpgsql;
-- C. Calculate Total Set Value
CREATE OR REPLACE FUNCTION Get_Set_Market_Value(p_set_code VARCHAR) RETURNS DECIMAL(14, 2) AS $$
DECLARE v_total_value DECIMAL(14, 2);
BEGIN
SELECT SUM(pp.market_price_usd) INTO v_total_value
FROM Edition e
    JOIN Price_Point pp ON e.edition_id = pp.edition_id
WHERE e.set_code = p_set_code
    AND pp.date_recorded = (
        SELECT MAX(date_recorded)
        FROM Price_Point
        WHERE edition_id = e.edition_id
    );
RETURN COALESCE(v_total_value, 0.00);
END;
$$ LANGUAGE plpgsql;