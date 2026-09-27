/**
 * Arcana Schema - Raw In-Memory JSON Schemas (Draft 2020-12)
 * Bundles the hardened 2.0.0 schemas and shared definitions for browser runtime and Node execution.
 */

export const layoutDefsSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/layout.defs.json",
  "title": "LayoutCoordinatesDefinition",
  "description": "Normalized visual placement coordinates and rotation for positioning cards in a visual board canvas.",
  "type": "object",
  "minProperties": 1,
  "unevaluatedProperties": false,
  "required": ["x", "y"],
  "properties": {
    "x": {
      "title": "Horizontal Coordinate (X)",
      "description": "Normalized horizontal center coordinate of the card slot relative to the spread layout canvas.",
      "$comment": "Normalized 0.0..1.0 when coordinateSystem is 'normalized'. Not pixels. (0.0 = left edge, 1.0 = right edge).",
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "examples": [0.2, 0.5, 0.8]
    },
    "y": {
      "title": "Vertical Coordinate (Y)",
      "description": "Normalized vertical center coordinate of the card slot relative to the spread layout canvas.",
      "$comment": "Normalized 0.0..1.0 when coordinateSystem is 'normalized'. Not pixels. (0.0 = top edge, 1.0 = bottom edge).",
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "examples": [0.2, 0.5, 0.8]
    },
    "rotation": {
      "title": "Rotation Angle",
      "description": "Clockwise rotation angle in degrees for rendering card orientation (e.g., 90 degrees for crossed cards).",
      "type": "number",
      "default": 0,
      "examples": [0, 45, 90, 180, 270]
    },
    "zIndex": {
      "title": "Z-Index Stacking Order",
      "description": "Relative vertical stacking layer index for overlapping or superimposed cards.",
      "type": "integer",
      "default": 0,
      "examples": [0, 1, 2]
    }
  }
};

export const deckContractDefsSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/deck-contract.defs.json",
  "title": "DeckContractDefinition",
  "description": "Rules specifying the minimum physical or virtual tarot deck composition needed to deal the spread.",
  "type": "object",
  "minProperties": 1,
  "unevaluatedProperties": false,
  "required": ["minCards"],
  "properties": {
    "minCards": {
      "title": "Minimum Cards Required",
      "description": "Minimum count of distinct physical or digital cards needed in the deck to deal the spread.",
      "type": "integer",
      "minimum": 1,
      "examples": [1, 3, 5, 10, 78]
    },
    "maxCards": {
      "title": "Maximum Cards Allowed",
      "description": "Upper bound on drawn cards if optional clarifiers or expansion draws are allowed.",
      "type": "integer",
      "minimum": 1,
      "examples": [3, 10, 15, 78]
    },
    "deckType": {
      "title": "Compatible Deck Type",
      "description": "Deck structure standard or category suitable for executing the spread.",
      "type": "string",
      "enum": [
        "full_78",
        "major_arcana_only",
        "minor_arcana_only",
        "court_only",
        "lenormand_36",
        "oracle_any"
      ],
      "default": "full_78",
      "examples": [
        "full_78",
        "major_arcana_only",
        "minor_arcana_only",
        "court_only",
        "lenormand_36",
        "oracle_any"
      ]
    },
    "allowReversals": {
      "title": "Allow Inverted Orientations",
      "description": "Whether inverted or reversed card orientations are recognized and assigned distinct meanings.",
      "type": "boolean",
      "default": true,
      "examples": [true, false]
    },
    "requiresSignificator": {
      "title": "Requires Significator",
      "description": "Whether an intentional significator card must be isolated prior to shuffling and drawing.",
      "type": "boolean",
      "default": false,
      "examples": [false, true]
    }
  }
};

export const filterDefsSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/filter.defs.json",
  "title": "CardFilterConstraintDefinition",
  "description": "Subdeck filtering rules restricting which cards are eligible to be dealt into a slot.",
  "type": "object",
  "minProperties": 1,
  "unevaluatedProperties": false,
  "properties": {
    "allowedArcana": {
      "title": "Allowed Arcana Category",
      "description": "Subdivision of the deck permissible for placement in this slot.",
      "type": "string",
      "enum": ["any", "major_only", "minor_only", "court_only"],
      "default": "any",
      "examples": ["any", "major_only", "minor_only", "court_only"]
    },
    "allowedSuits": {
      "title": "Allowed Suits",
      "description": "Specific elemental suits permitted to occupy this slot.",
      "type": "array",
      "items": {
        "title": "Suit",
        "description": "One of the four traditional tarot suits.",
        "type": "string",
        "enum": ["wands", "cups", "swords", "pentacles"],
        "examples": ["wands", "cups", "swords", "pentacles"]
      },
      "examples": [
        ["cups", "swords"],
        ["wands", "pentacles"]
      ]
    },
    "fixedCard": {
      "title": "Fixed Required Card",
      "description": "Specific canonical card identifier required to occupy this slot (e.g. 'major-00-the-fool').",
      "type": "string",
      "examples": ["major-00-the-fool", "court-queen-cups"]
    }
  }
};

export const relationDefsSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/relation.defs.json",
  "title": "SlotRelationDefinition",
  "description": "Directed or symmetrical semantic relationship edge connecting two card positions in a spread graph.",
  "type": "object",
  "minProperties": 1,
  "unevaluatedProperties": false,
  "required": ["source", "target", "type"],
  "properties": {
    "source": {
      "title": "Source Slot Identifier",
      "description": "Slot ID identifying the origin node in the relation edge.",
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "examples": ["past", "situation", "root"]
    },
    "target": {
      "title": "Target Slot Identifier",
      "description": "Slot ID identifying the destination node in the relation edge.",
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "examples": ["present", "challenge", "outcome"]
    },
    "type": {
      "title": "Relationship Type",
      "description": "Semantic modality describing how the source card affects or interacts with the target card.",
      "type": "string",
      "enum": [
        "leads_to",
        "crosses",
        "grounds",
        "crowns",
        "mirrors",
        "opposes",
        "clarifies",
        "culminates_in",
        "adjacent_to"
      ],
      "examples": [
        "leads_to",
        "crosses",
        "grounds",
        "crowns",
        "mirrors",
        "opposes",
        "clarifies",
        "culminates_in",
        "adjacent_to"
      ]
    },
    "label": {
      "title": "Relationship Label",
      "description": "Optional human-readable label or description explaining the dynamic between the slots.",
      "type": "string",
      "examples": ["Underlying tension", "Catalyst for transformation", "Direct obstruction"]
    },
    "weight": {
      "title": "Relationship Significance Weight",
      "description": "Normalized scalar indicating relative analytical weight in synthesis (1.0 = standard significance).",
      "type": "number",
      "minimum": 0.0,
      "maximum": 1.0,
      "default": 1.0,
      "examples": [0.5, 0.8, 1.0]
    }
  }
};

export const slotDefsSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/slot.defs.json",
  "title": "SlotDefinition",
  "description": "Definition of an individual card position within a spread, including its order, interpretive role, spatial layout, and deck constraints.",
  "type": "object",
  "minProperties": 1,
  "unevaluatedProperties": false,
  "required": ["id", "order", "role"],
  "properties": {
    "id": {
      "title": "Slot Identifier",
      "description": "Unique URL-safe kebab-case identifier for this position within the spread.",
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "examples": ["past", "present", "future", "subconscious", "external-influences"]
    },
    "order": {
      "title": "Draw and Placement Order",
      "description": "1-indexed continuous sequence indicating the order in which this card is drawn and laid out.",
      "type": "integer",
      "minimum": 1,
      "examples": [1, 2, 3, 10]
    },
    "role": {
      "title": "Positional Role Title",
      "description": "Concise interpretive label designating the query facet represented by this card.",
      "type": "string",
      "minLength": 1,
      "examples": ["Past Foundations", "Immediate Obstacle", "Subconscious Roots", "Likely Outcome"]
    },
    "description": {
      "title": "Role Description",
      "description": "Detailed explanation of what this card slot represents in the context of the query and synthesis.",
      "type": "string",
      "examples": [
        "Events, emotional baggage, or ingrained beliefs that shaped the current situation.",
        "The primary challenge or unexpected hurdle confronting the querent."
      ]
    },
    "keywords": {
      "title": "Thematic Keywords",
      "description": "Quick associative keywords characterizing the energy of this slot.",
      "type": "array",
      "items": { "type": "string" },
      "examples": [
        ["origins", "karma", "history"],
        ["conflict", "catalyst", "friction"]
      ]
    },
    "layout": {
      "title": "Slot Layout Coordinates",
      "description": "Visual canvas coordinates and rotation angle for rendering this slot.",
      "$ref": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/layout.defs.json"
    },
    "cardConstraint": {
      "title": "Slot Card Filtering Constraints",
      "description": "Subdeck filtering rules restricting which cards are eligible to be dealt into this slot.",
      "$ref": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/filter.defs.json"
    }
  }
};

export const spreadDefinitionSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/tarot-spread-definition-2.0.0.schema.json",
  "title": "TarotSpreadDefinition",
  "description": "Formal specification for a reusable tarot spread template, defining positions, visual layout coordinates, deck constraints, and positional relationships.",
  "type": "object",
  "minProperties": 1,
  "unevaluatedProperties": false,
  "required": [
    "schemaVersion",
    "id",
    "name",
    "deckContract",
    "slots",
    "relations"
  ],
  "properties": {
    "@context": {
      "title": "JSON-LD Context URL",
      "description": "Optional JSON-LD context URL for Schema.org semantic interoperability and graph expansion.",
      "type": "string",
      "format": "uri",
      "enum": [
        "https://schema.org",
        "https://arcanaschema.org/contexts/tarot.jsonld"
      ],
      "examples": [
        "https://schema.org",
        "https://arcanaschema.org/contexts/tarot.jsonld"
      ]
    },
    "@type": {
      "title": "Schema.org Type",
      "description": "Schema.org entity classification corresponding to an authoritative spread template.",
      "type": "string",
      "enum": ["DefinedTermSet"],
      "examples": ["DefinedTermSet"]
    },
    "schemaVersion": {
      "title": "Specification Version",
      "description": "Semantic specification version of the TarotSpreadDefinition schema.",
      "type": "string",
      "const": "2.0.0",
      "examples": ["2.0.0"]
    },
    "id": {
      "title": "Spread Identifier",
      "description": "Unique URL-safe kebab-case identifier for this spread template.",
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "examples": ["past-present-future", "celtic-cross", "decision-fork"]
    },
    "name": {
      "title": "Spread Name",
      "description": "Human-readable display name of the spread.",
      "type": "string",
      "minLength": 1,
      "examples": ["Past, Present, Future", "Celtic Cross", "Two-Path Decision"]
    },
    "summary": {
      "title": "Spread Summary",
      "description": "Concise single-sentence summary of the spread's purpose, inquiry scope, and general application.",
      "type": "string",
      "examples": ["Classic 3-card linear temporal progression mapping development over time."]
    },
    "layoutType": {
      "title": "Geometric Layout Type",
      "description": "Spatial geometric layout arrangement of the card positions on a board.",
      "type": "string",
      "enum": ["linear", "cross", "circular", "symbolic", "triangular", "custom"],
      "examples": [
        "linear",
        "cross",
        "circular",
        "symbolic",
        "triangular",
        "custom"
      ]
    },
    "difficulty": {
      "title": "Difficulty Level",
      "description": "Recommended practitioner experience level necessary to synthesize this spread.",
      "type": "string",
      "enum": ["beginner", "easy", "intermediate", "advanced", "expert"],
      "examples": [
        "beginner",
        "easy",
        "intermediate",
        "advanced",
        "expert"
      ]
    },
    "author": {
      "title": "Creator or Tradition",
      "description": "Author, originator, or traditional historical lineage of this spread design.",
      "type": "string",
      "examples": ["Arthur Edward Waite", "Traditional 18th Century", "Papus (Gérard Encausse)"]
    },
    "license": {
      "title": "Documentation License",
      "description": "Open content license governing the spread layout text and position descriptions.",
      "type": "string",
      "default": "CC-BY-4.0",
      "examples": ["CC-BY-4.0", "CC0-1.0", "MIT"]
    },
    "tags": {
      "title": "Topical Tags",
      "description": "Searchable categorical tags characterizing this spread's application domains.",
      "type": "array",
      "items": { "type": "string" },
      "examples": [
        ["general", "daily", "temporal"],
        ["decision", "career", "choice"]
      ]
    },
    "instructions": {
      "title": "Practitioner Instructions",
      "description": "Step-by-step guidance covering preparation, shuffling, drawing, and interpretive synthesis.",
      "$ref": "#/$defs/instructions"
    },
    "deckContract": {
      "title": "Deck Contract Constraints",
      "description": "Rules specifying the minimum tarot deck composition and reversal support needed for this spread.",
      "$ref": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/deck-contract.defs.json"
    },
    "readingVariants": {
      "title": "Alternative Reading Variants",
      "description": "Alternative thematic lenses or role remappings that can be applied to this physical layout.",
      "type": "array",
      "items": { "$ref": "#/$defs/readingVariant" },
      "examples": [
        [
          {
            "id": "mind-body-spirit",
            "name": "Mind, Body, Spirit",
            "description": "Holistic wellbeing lens.",
            "slotOverrides": [
              { "slotId": "past", "role": "Mental State", "description": "Current cognitive focus." },
              { "slotId": "present", "role": "Physical Health", "description": "Somatic energy." },
              { "slotId": "future", "role": "Spiritual Growth", "description": "Intuitive path." }
            ]
          }
        ]
      ]
    },
    "slots": {
      "title": "Spread Slots",
      "description": "Ordered sequence of card positions composing the spread.",
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/slot.defs.json"
      }
    },
    "hasDefinedTerm": {
      "title": "Schema.org Defined Terms (Slots)",
      "description": "Schema.org DefinedTermSet mapping equivalent to slots for semantic consumers.",
      "type": "array",
      "items": {
        "$ref": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/slot.defs.json"
      }
    },
    "relations": {
      "title": "Card Relationships",
      "description": "Directed semantic relationships connecting pairs of card positions.",
      "type": "array",
      "items": {
        "$ref": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/_shared/relation.defs.json"
      }
    },
    "elementalDignity": {
      "title": "Elemental Dignity Configuration",
      "description": "Local rules governing elemental compatibility calculations across adjacent slots.",
      "$ref": "#/$defs/elementalDignityRule"
    }
  },
  "$defs": {
    "instructions": {
      "title": "SpreadInstructions",
      "description": "Procedural ritual and analytical instructions for performing the spread.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "properties": {
        "preparation": {
          "title": "Preparation",
          "description": "Pre-shuffle centering, query refinement, and intention formulation guidance.",
          "type": "string",
          "examples": ["Sit quietly and center your thoughts on the specific question."]
        },
        "shuffle": {
          "title": "Shuffling",
          "description": "Card shuffling protocol and selection procedure.",
          "type": "string",
          "examples": ["Shuffle three times while holding the query in mind, then cut the deck into three piles."]
        },
        "drawing": {
          "title": "Drawing Procedure",
          "description": "Order and spatial placement instructions for laying out cards.",
          "type": "string",
          "examples": ["Draw from left to right, placing cards face down in slots 1, 2, and 3 before revealing."]
        },
        "synthesis": {
          "title": "Interpretive Synthesis",
          "description": "Instructions for weaving the individual slot meanings into an integrated holistic narrative.",
          "type": "string",
          "examples": ["Examine the trajectory from past roots to present circumstances before analyzing the outcome."]
        }
      }
    },
    "readingVariant": {
      "title": "ReadingVariantDefinition",
      "description": "Alternative interpretive framing overriding slot roles for an existing spatial layout.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "required": ["id", "name", "slotOverrides"],
      "properties": {
        "id": {
          "title": "Variant Identifier",
          "description": "Unique URL-safe kebab-case identifier for this variant.",
          "type": "string",
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
          "examples": ["mind-body-spirit", "situation-action-outcome"]
        },
        "name": {
          "title": "Variant Name",
          "description": "Display name of the reading variant.",
          "type": "string",
          "minLength": 1,
          "examples": ["Mind, Body, Spirit", "Situation, Action, Outcome"]
        },
        "description": {
          "title": "Variant Description",
          "description": "Detailed explanation of this variant's inquiry paradigm.",
          "type": "string",
          "examples": ["Reinterprets the three linear slots as holistic personal dimensions."]
        },
        "slotOverrides": {
          "title": "Slot Overrides",
          "description": "Collection of slot redefinitions overriding default roles.",
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "minProperties": 1,
            "unevaluatedProperties": false,
            "required": ["slotId", "role"],
            "properties": {
              "slotId": {
                "title": "Target Slot Identifier",
                "description": "ID of the slot being overridden.",
                "type": "string",
                "examples": ["past", "present", "future"]
              },
              "role": {
                "title": "Overridden Role Title",
                "description": "New interpretive role assigned to this slot under this variant.",
                "type": "string",
                "examples": ["Mind (Intellect)", "Body (Physical Realm)", "Spirit (Aspiration)"]
              },
              "description": {
                "title": "Overridden Role Description",
                "description": "Specific meaning of the slot under this variant.",
                "type": "string",
                "examples": ["Cognitive clarity and conscious thought patterns."]
              }
            }
          }
        }
      }
    },
    "elementalDignityRule": {
      "title": "ElementalDignityRuleDefinition",
      "description": "Rules for calculating elemental affinities between cards in adjacent spread slots.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "properties": {
        "enabled": {
          "title": "Enable Elemental Dignities",
          "description": "Whether elemental dignity calculations should be performed.",
          "type": "boolean",
          "default": false,
          "examples": [true, false]
        },
        "mode": {
          "title": "Dignity Calculation Mode",
          "description": "Esoteric calculation standard to apply.",
          "type": "string",
          "enum": ["golden_dawn", "triplicity", "neutral"],
          "default": "golden_dawn",
          "examples": ["golden_dawn", "triplicity", "neutral"]
        },
        "notes": {
          "title": "Notes",
          "description": "Special considerations for elemental weighting.",
          "type": "string",
          "examples": ["Fire and Water weaken each other; Fire and Air strengthen each other."]
        }
      }
    }
  }
};

export const readingSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/tarot-reading-1.0.0.schema.json",
  "title": "TarotReading",
  "description": "Specification for an immutable or updated record of a performed tarot reading: links to a spread template, holds drawn cards per slot, query context, and synthesis.",
  "type": "object",
  "minProperties": 1,
  "unevaluatedProperties": false,
  "required": [
    "schemaVersion",
    "readingId",
    "spreadId",
    "drawnAt",
    "cards"
  ],
  "properties": {
    "@context": {
      "title": "JSON-LD Context URL",
      "description": "Optional JSON-LD context URL for Schema.org semantic interoperability and graph expansion.",
      "type": "string",
      "format": "uri",
      "enum": [
        "https://schema.org",
        "https://arcanaschema.org/contexts/tarot.jsonld"
      ],
      "examples": [
        "https://schema.org",
        "https://arcanaschema.org/contexts/tarot.jsonld"
      ]
    },
    "@type": {
      "title": "Schema.org Type",
      "description": "Schema.org entity type corresponding to a performed divination event or action.",
      "type": "string",
      "enum": ["Event", "Action"],
      "examples": ["Event", "Action"]
    },
    "schemaVersion": {
      "title": "Specification Version",
      "description": "Semantic version of the TarotReading schema specification.",
      "type": "string",
      "const": "1.0.0",
      "examples": ["1.0.0"]
    },
    "readingId": {
      "title": "Reading UUID Identifier",
      "description": "Unique UUID v4 identifier for this reading session.",
      "type": "string",
      "format": "uuid",
      "examples": ["7d9c6b84-48f5-442a-9e12-b9e315538e82", "550e8400-e29b-41d4-a716-446655440000"]
    },
    "spreadId": {
      "title": "Spread Template Identifier",
      "description": "Identifier of the spread definition used for this reading.",
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "examples": ["past-present-future", "celtic-cross"]
    },
    "variantId": {
      "title": "Variant Identifier",
      "description": "Optional reading variant identifier if a variant was selected.",
      "type": "string",
      "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
      "examples": ["mind-body-spirit"]
    },
    "question": {
      "title": "Inquiry Question",
      "description": "The querent's question or focal inquiry topic formulating the reading.",
      "type": "string",
      "examples": ["What energy should I cultivate for my upcoming creative venture?"]
    },
    "querent": {
      "title": "Querent Profile",
      "description": "Information about the subject seeking insight.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "properties": {
        "name": {
          "title": "Querent Name",
          "description": "Name or pseudonym of the querent.",
          "type": "string",
          "examples": ["Alice", "Seeker"]
        },
        "significator": {
          "title": "Significator Card",
          "description": "Card ID chosen as querent significator.",
          "type": "string",
          "examples": ["court-queen-swords", "major-01-the-magician"]
        }
      }
    },
    "reader": {
      "title": "Reader Profile",
      "description": "Information regarding the practitioner conducting the reading.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "properties": {
        "name": {
          "title": "Reader Name",
          "description": "Name of the tarot practitioner.",
          "type": "string",
          "examples": ["Morgan le Fay", "Hermetic Reader"]
        },
        "system": {
          "title": "Tradition System",
          "description": "Reading lineage or tradition (e.g. 'RWS', 'Thoth', 'Marseille').",
          "type": "string",
          "examples": ["RWS", "Thoth", "Marseille"]
        }
      }
    },
    "drawnAt": {
      "title": "Draw Timestamp",
      "description": "ISO 8601 UTC timestamp when cards were drawn.",
      "type": "string",
      "format": "date-time",
      "examples": ["2026-09-26T12:00:00Z"]
    },
    "startDate": {
      "title": "Schema.org Start Date",
      "description": "Schema.org Event startDate mapping for drawnAt.",
      "type": "string",
      "format": "date-time",
      "examples": ["2026-09-26T12:00:00Z"]
    },
    "deck": {
      "title": "Deck Metadata",
      "description": "Information on the physical or digital tarot deck utilized.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "properties": {
        "name": {
          "title": "Deck Name",
          "description": "Name or edition of the physical or digital deck used.",
          "type": "string",
          "examples": ["Smith-Waite Centennial Tarot Deck", "Hermetic Tarot"]
        },
        "publisher": {
          "title": "Publisher",
          "description": "Publishing house or creator.",
          "type": "string",
          "examples": ["U.S. Games Systems", "Lo Scarabeo"]
        },
        "reversals": {
          "title": "Reversals Active",
          "description": "Whether reversals were factored into this draw.",
          "type": "boolean",
          "default": false,
          "examples": [true, false]
        }
      }
    },
    "cards": {
      "title": "Drawn Cards",
      "description": "The cards drawn into the respective slots of the spread.",
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/$defs/drawnCard"
      }
    },
    "interpretation": {
      "title": "Synthesis Interpretation",
      "description": "Reader's synthesis of the overall card array.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "properties": {
        "summary": {
          "title": "Summary",
          "description": "Core thesis of the reading.",
          "type": "string",
          "examples": ["Clear path forward once initial doubt is released."]
        },
        "elementalBalance": {
          "title": "Elemental Balance",
          "description": "Count of cards belonging to each elemental domain.",
          "type": "object",
          "minProperties": 1,
          "unevaluatedProperties": false,
          "properties": {
            "fire": { "type": "integer", "examples": [1] },
            "water": { "type": "integer", "examples": [0] },
            "air": { "type": "integer", "examples": [2] },
            "earth": { "type": "integer", "examples": [0] },
            "dominant": { "type": "string", "examples": ["air"] }
          }
        },
        "synthesis": {
          "title": "Narrative Synthesis",
          "description": "Detailed multi-paragraph breakdown.",
          "type": "string",
          "examples": ["The Magician in past position provided mastery..."]
        },
        "actionableAdvice": {
          "title": "Actionable Advice",
          "description": "Concrete steps recommended for the querent.",
          "type": "string",
          "examples": ["Prioritize clear documentation over premature optimization."]
        }
      }
    },
    "notes": {
      "title": "Session Notes",
      "description": "General practitioner or querent reflection notes.",
      "type": "string",
      "examples": ["Reading conducted in morning light with breath meditation."]
    },
    "tags": {
      "title": "Classification Tags",
      "description": "Thematic tags for organizing reading archives.",
      "type": "array",
      "items": { "type": "string" },
      "examples": [["career", "transition"]]
    }
  },
  "$defs": {
    "drawnCard": {
      "title": "DrawnCardRecord",
      "description": "Record of an individual card placed into a specific spread slot.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "required": ["slotId", "cardId", "orientation"],
      "properties": {
        "slotId": {
          "title": "Slot Identifier",
          "description": "Matches the slot id in the corresponding spread definition.",
          "type": "string",
          "examples": ["past", "present", "future"]
        },
        "cardId": {
          "title": "Card Identifier",
          "description": "Standardized card identifier (e.g. 'major-00-the-fool', 'cups-03', 'swords-king').",
          "type": "string",
          "pattern": "^[a-z0-9_-]+$",
          "examples": ["major-01-the-magician", "swords-08", "wands-03"]
        },
        "orientation": {
          "title": "Orientation",
          "description": "Card orientation when revealed.",
          "type": "string",
          "enum": ["upright", "reversed"],
          "examples": ["upright", "reversed"]
        },
        "notes": {
          "title": "Card Positional Notes",
          "description": "Specific interpretation notes for this card in this position.",
          "type": "string",
          "examples": ["Foundational competence and clear focus."]
        }
      }
    }
  }
};

export const catalogSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/tarot-spread-catalog-2.0.0.schema.json",
  "title": "TarotSpreadCatalog",
  "description": "Formal schema for a multi-spread collection or registry catalog, containing metadata and conforming TarotSpreadDefinition entries.",
  "type": "object",
  "minProperties": 1,
  "unevaluatedProperties": false,
  "required": ["schemaVersion", "metadata", "spreads"],
  "properties": {
    "schemaVersion": {
      "title": "Specification Version",
      "description": "Catalog specification semantic version.",
      "type": "string",
      "const": "2.0.0",
      "examples": ["2.0.0"]
    },
    "metadata": {
      "title": "Catalog Metadata",
      "description": "Descriptive metadata regarding this catalog registry, maintainers, and repository.",
      "$ref": "#/$defs/catalogMetadata"
    },
    "elementalDignityRules": {
      "title": "Elemental Dignity Matrix",
      "description": "Global elemental dignity matrix applied across catalog spreads if enabled.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "properties": {
        "active": {
          "title": "Active",
          "description": "Whether elemental dignities are active by default.",
          "type": "boolean",
          "default": true,
          "examples": [true, false]
        },
        "triplicities": {
          "title": "Triplicity Element Map",
          "description": "Mapping of signs or suits to classical elements.",
          "type": "object",
          "minProperties": 1,
          "unevaluatedProperties": false,
          "properties": {
            "fire": {
              "type": "array",
              "items": { "type": "string" },
              "examples": [["wands", "aries", "leo", "sagittarius"]]
            },
            "water": {
              "type": "array",
              "items": { "type": "string" },
              "examples": [["cups", "cancer", "scorpio", "pisces"]]
            },
            "air": {
              "type": "array",
              "items": { "type": "string" },
              "examples": [["swords", "gemini", "libra", "aquarius"]]
            },
            "earth": {
              "type": "array",
              "items": { "type": "string" },
              "examples": [["pentacles", "taurus", "virgo", "capricorn"]]
            }
          }
        },
        "friendships": {
          "title": "Elemental Affinities",
          "description": "Pairs of elements and their mutual affinity.",
          "type": "array",
          "items": {
            "type": "object",
            "minProperties": 1,
            "unevaluatedProperties": false,
            "required": ["elementA", "elementB", "affinity"],
            "properties": {
              "elementA": { "type": "string", "examples": ["fire"] },
              "elementB": { "type": "string", "examples": ["air"] },
              "affinity": {
                "type": "string",
                "enum": ["friendly", "inimical", "neutral"],
                "examples": ["friendly", "inimical", "neutral"]
              }
            }
          }
        }
      }
    },
    "spreads": {
      "title": "Catalog Spreads",
      "description": "Array of complete valid spread definitions indexed in this catalog.",
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "https://raw.githubusercontent.com/arcana-schema/schemas/main/schemas/v2/tarot-spread-definition-2.0.0.schema.json"
      }
    }
  },
  "$defs": {
    "catalogMetadata": {
      "title": "CatalogMetadataDefinition",
      "description": "Registry provenance and licensing details.",
      "type": "object",
      "minProperties": 1,
      "unevaluatedProperties": false,
      "required": ["title", "version", "updatedAt"],
      "properties": {
        "title": {
          "title": "Catalog Title",
          "description": "Name of the spread catalog.",
          "type": "string",
          "examples": ["Arcana Schema Canonical Spread Catalog"]
        },
        "description": {
          "title": "Catalog Description",
          "description": "Scope and purpose of this spread collection.",
          "type": "string",
          "examples": ["Standard canonical reference spreads for divination and decision analysis."]
        },
        "version": {
          "title": "Catalog Version",
          "description": "Version string of the catalog release.",
          "type": "string",
          "examples": ["2.0.0"]
        },
        "maintainer": {
          "title": "Maintainer",
          "description": "Individual, organization, or working group maintaining the catalog.",
          "type": "string",
          "examples": ["Arcana Schema Working Group"]
        },
        "repository": {
          "title": "Repository URL",
          "description": "URL of the source repository hosting the catalog.",
          "type": "string",
          "format": "uri",
          "examples": ["https://github.com/arcana-schema/catalog"]
        },
        "updatedAt": {
          "title": "Updated Timestamp",
          "description": "ISO 8601 UTC timestamp of the last revision.",
          "type": "string",
          "format": "date-time",
          "examples": ["2026-09-26T12:00:00Z"]
        },
        "license": {
          "title": "Catalog License",
          "description": "Open license governing the catalog dataset.",
          "type": "string",
          "examples": ["CC-BY-4.0", "MIT"]
        }
      }
    }
  }
};
