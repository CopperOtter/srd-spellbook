// Spell types based on spells.schema.json

export type School =
  | "Abjuration"
  | "Conjuration"
  | "Divination"
  | "Enchantment"
  | "Evocation"
  | "Illusion"
  | "Necromancy"
  | "Transmutation"
  | "Universal";

export type ComponentType = "V" | "S" | "M" | "F" | "DF" | "XP";

export type CasterClass =
  | "Bard"
  | "Cleric"
  | "Druid"
  | "Paladin"
  | "Ranger"
  | "Sorcerer"
  | "Wizard";

export interface Spell {
  id: string;
  name: string;
  srdUrl?: string;
  school: School;
  subschool?: string;
  descriptors?: string[];
  levels: {
    byClass: Partial<Record<CasterClass, number>>;
    byDomain?: Record<string, number>;
  };
  components: ComponentType[];
  componentDetails?: {
    material?: string;
    focus?: string;
    xp?: string;
  };
  castingTime: string;
  range: string;
  target?: string;
  targets?: string;
  area?: string;
  effect?: string;
  duration: string;
  savingThrow: string;
  spellResistance: string;
  brief: string;
  description: string;
  briefByList?: Record<string, string>;
  search?: {
    normalizedName?: string;
    aliases?: string[];
    tokens?: string[];
  };
}

export interface SpellDataset {
  meta: {
    version: string;
    generatedAt: string;
    sources: Array<{
      name: string;
      baseUrl: string;
      licenseNote?: string;
    }>;
    notes?: string;
  };
  spells: Spell[];
}

// Character profile types

export type CasterType = "prepared" | "spontaneous";

export interface SlotLevel {
  max: number;
  remaining: number;
}

export interface SlotPool {
  id: string;
  label: string;
  levels: Record<number, SlotLevel>;
}

export interface PreparedEntry {
  id: string;
  spellId: string;
  preparedLevel: number;
  poolId: string;
  notes?: string;
  used: boolean;
}

export interface CharacterProfile {
  id: string;
  name: string;
  casterType: CasterType;
  casterClass: CasterClass;
  domains?: string[];
  slotPools: SlotPool[];
  prepared: PreparedEntry[];
}

// Filter state

export interface SpellFilters {
  search: string;
  classes: CasterClass[];
  levels: number[];
  schools: School[];
}

export type BrowseTab = "level" | "class" | "school";
