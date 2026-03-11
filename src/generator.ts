import { ERC721Metadata, ERC721Attribute } from "./types";

interface SpeciesTemplate {
  description: string;
  elements: string[];
  rarities: string[];
  abilities: string[];
  personalities: string[];
}

const SPECIES_TEMPLATES: Record<string, SpeciesTemplate> = {
  Dragon: {
    description: "A fierce dragon from the QFC universe",
    elements: ["Fire", "Ice", "Lightning", "Shadow", "Earth"],
    rarities: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
    abilities: ["Flame Breath", "Wing Shield", "Tail Whip", "Sky Dive", "Dragon Roar"],
    personalities: ["Fierce", "Wise", "Playful", "Mysterious", "Noble"],
  },
  Phoenix: {
    description: "A radiant phoenix reborn from the QFC ashes",
    elements: ["Fire", "Light", "Solar", "Cosmic", "Plasma"],
    rarities: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
    abilities: ["Rebirth", "Flame Wing", "Sunbeam", "Ash Veil", "Eternal Glow"],
    personalities: ["Radiant", "Resilient", "Graceful", "Eternal", "Proud"],
  },
  Wolf: {
    description: "A cunning wolf prowling the QFC wilds",
    elements: ["Ice", "Shadow", "Wind", "Earth", "Moon"],
    rarities: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
    abilities: ["Pack Call", "Shadow Stalk", "Frost Bite", "Howl", "Swift Strike"],
    personalities: ["Loyal", "Cunning", "Fierce", "Stoic", "Wild"],
  },
  Cat: {
    description: "A mystical cat from the QFC realm",
    elements: ["Shadow", "Moon", "Spirit", "Wind", "Arcane"],
    rarities: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
    abilities: ["Shadow Step", "Nine Lives", "Purr Shield", "Claw Swipe", "Night Vision"],
    personalities: ["Curious", "Aloof", "Mischievous", "Elegant", "Sly"],
  },
  Rabbit: {
    description: "A swift rabbit bounding through the QFC meadows",
    elements: ["Earth", "Wind", "Light", "Nature", "Spring"],
    rarities: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
    abilities: ["Burrow", "Quick Dash", "Lucky Foot", "Carrot Bomb", "Moon Jump"],
    personalities: ["Cheerful", "Timid", "Adventurous", "Lucky", "Gentle"],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let counter = 0;

export function generateMetadata(
  species: string,
  requestedTraits?: string[],
  name?: string
): ERC721Metadata {
  const template = SPECIES_TEMPLATES[species];
  if (!template) {
    const validSpecies = Object.keys(SPECIES_TEMPLATES).join(", ");
    throw new Error(`Unknown species: ${species}. Valid: ${validSpecies}`);
  }

  counter++;
  const tokenName = name || `QFC ${species} #${counter}`;

  const attributes: ERC721Attribute[] = [
    { trait_type: "Species", value: species },
    { trait_type: "Element", value: pickRandom(template.elements) },
    { trait_type: "Rarity", value: pickRandom(template.rarities) },
    { trait_type: "Ability", value: pickRandom(template.abilities) },
    { trait_type: "Personality", value: pickRandom(template.personalities) },
  ];

  if (requestedTraits && requestedTraits.length > 0) {
    for (const trait of requestedTraits) {
      if (!attributes.some((a) => a.value === trait)) {
        attributes.push({ trait_type: "Bonus Trait", value: trait });
      }
    }
  }

  return {
    name: tokenName,
    description: template.description,
    image: "",
    attributes,
  };
}

export function getValidSpecies(): string[] {
  return Object.keys(SPECIES_TEMPLATES);
}
