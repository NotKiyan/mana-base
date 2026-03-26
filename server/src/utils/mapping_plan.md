# Data Mapping Plan: Scryfall to Mana Base

This document outlines how the `default-cards.json` dataset maps to our normalized PostgreSQL database.

## Strategy: Correct Normalization & Deduplication
To avoid the previous "bloat" issue, we will use the following strategy:
- **Card Table**: Deduplicated using `oracle_id`. This table stores the "Abstract Card" (e.g., *Black Lotus* exists once here).
- **Edition Table**: Represents the "Printed Card" (e.g., *Black Lotus* from *Alpha*, *Beta*, and *Unlimited* each have their own row here).
- **JSON Source**: `default-cards.json` (English-only versions of every printing).

---

## 1. Core Tables

### Card Table (Unique entities)
| DB Column | JSON Field | Logic |
| :--- | :--- | :--- |
| `card_id` (PK) | `oracle_id` | **CRITICAL**: Use Oracle ID as PK for deduplication. |
| `oracle_id` | `oracle_id` | Stored as UUID. |
| `name` | `name` | Full card name. |
| `layout` | `layout` | e.g., "normal", "transform". |
| `reserved_list` | `reserved` | Boolean. |

### Set Table
| DB Column | JSON Field | Logic |
| :--- | :--- | :--- |
| `set_code` (PK) | `set` | 3-5 character code. |
| `set_name` | `set_name` | Full name of the set. |
| `release_date` | `released_at` | YYYY-MM-DD. |
| `set_type` | `set_type` | e.g., "expansion", "core". |

### Edition Table (Printings)
| DB Column | JSON Field | Logic |
| :--- | :--- | :--- |
| `edition_id` (PK) | `id` | Scryfall's unique printing ID. |
| `card_id` (FK) | `oracle_id` | Links to the unique card. |
| `set_code` (FK) | `set` | Links to the set. |
| `rarity` | `rarity` | e.g., "common", "mythic". |
| `artist` | `artist` | Artist name. |
| `collector_number`| `collector_number`| String (handles 1, 2a, b, etc). |
| `image_url_normal`| `image_uris.normal`| CDN URL. |
| `image_url_small` | `image_uris.small` | CDN URL. |
| `frame_version` | `frame` | e.g., "2003", "2015". |
| `is_promo` | `promo` | Boolean. |

---

## 2. Multi-Face & Metadata

### CardFace Table
- **If `card_faces` array exists**: One row per element in the array.
- **If not**: One row using top-level card fields.
| DB Column | JSON Field |
| :--- | :--- |
| `name` | `face.name` or `card.name` |
| `mana_cost` | `face.mana_cost` or `card.mana_cost` |
| `cmc` | `face.cmc` or `card.cmc` |
| `oracle_text` | `face.oracle_text` or `card.oracle_text` |
| `flavor_text` | `face.flavor_text` or `card.flavor_text` |
| `power / toughness`| `face.power / face.toughness` |

### Metadata (Many-to-Many)
- **Types/Subtypes**: Parsed from `type_line` (e.g., "Creature — Elf Warrior" split at " — ").
- **Keywords**: From `keywords` array.
- **Color Identity**: From `color_identity` array.
- **Legalities**: Iterates through `legalities` object (Keys = Format, Values = Status).

---

## 3. Seeding Phases (Reset Plan)
1. **Truncate All Data**: ✅ Done. (A clean slate for the English-only deduplicated run).
2. **Phase 1: Sets**: Populate all sets first.
3. **Phase 2: Cards**: Populate unique cards using `oracle_id`.
4. **Phase 3: Editions**: Link printings to cards/sets and record daily prices.
5. **Phase 4: Details**: Populate Legalities, Faces, and associate Types/Meta.
