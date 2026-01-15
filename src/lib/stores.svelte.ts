import { browser } from "$app/environment";
import type {
  Spell,
  SpellDataset,
  CharacterProfile,
  SlotPool,
  PreparedEntry,
  CasterClass,
} from "./types";
import { asset } from "$app/paths";

// Spell data store
let spells = $state<Spell[]>([]);
let spellsLoaded = $state(false);
let spellsError = $state<string | null>(null);

// Indexes for fast filtering
let spellsByClass = $state<Record<string, string[]>>({});
let spellsByLevel = $state<Record<number, string[]>>({});
let spellsBySchool = $state<Record<string, string[]>>({});
let spellsById = $state<Record<string, Spell>>({});

export function getSpellStore() {
  return {
    get spells() {
      return spells;
    },
    get loaded() {
      return spellsLoaded;
    },
    get error() {
      return spellsError;
    },
    get byClass() {
      return spellsByClass;
    },
    get byLevel() {
      return spellsByLevel;
    },
    get bySchool() {
      return spellsBySchool;
    },
    get byId() {
      return spellsById;
    },
  };
}

export async function loadSpells(): Promise<void> {
  if (spellsLoaded) return;

  try {
    const response = await fetch(asset("/spells.json"));
    if (!response.ok) {
      throw new Error(`Failed to load spells: ${response.statusText}`);
    }

    const data: SpellDataset = await response.json();
    spells = data.spells;

    // Build indexes
    const byClass: Record<string, string[]> = {};
    const byLevel: Record<number, string[]> = {};
    const bySchool: Record<string, string[]> = {};
    const byId: Record<string, Spell> = {};

    for (const spell of spells) {
      byId[spell.id] = spell;

      // Index by school
      if (!bySchool[spell.school]) bySchool[spell.school] = [];
      bySchool[spell.school].push(spell.id);

      // Index by class and level
      for (const [cls, level] of Object.entries(spell.levels.byClass)) {
        if (!byClass[cls]) byClass[cls] = [];
        if (!byClass[cls].includes(spell.id)) byClass[cls].push(spell.id);

        if (level !== undefined) {
          if (!byLevel[level]) byLevel[level] = [];
          if (!byLevel[level].includes(spell.id)) byLevel[level].push(spell.id);
        }
      }

      // Also index domain spells by level
      if (spell.levels.byDomain) {
        for (const level of Object.values(spell.levels.byDomain)) {
          if (!byLevel[level]) byLevel[level] = [];
          if (!byLevel[level].includes(spell.id)) byLevel[level].push(spell.id);
        }
      }
    }

    spellsByClass = byClass;
    spellsByLevel = byLevel;
    spellsBySchool = bySchool;
    spellsById = byId;
    spellsLoaded = true;
  } catch (e) {
    spellsError =
      e instanceof Error ? e.message : "Unknown error loading spells";
    console.error("Failed to load spells:", e);
  }
}

// Character profile store with localStorage persistence
const PROFILE_STORAGE_KEY = "srd-spellbook-profile";

function createDefaultProfile(): CharacterProfile {
  return {
    id: crypto.randomUUID(),
    name: "My Character",
    casterType: "prepared",
    casterClass: "Wizard",
    domains: [],
    slotPools: [
      {
        id: "regular",
        label: "Regular",
        levels: Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [i, { max: 0, remaining: 0 }])
        ),
      },
    ],
    prepared: [],
  };
}

function loadProfileFromStorage(): CharacterProfile {
  if (!browser) return createDefaultProfile();

  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load profile from localStorage:", e);
  }

  return createDefaultProfile();
}

let profile = $state<CharacterProfile>(loadProfileFromStorage());

function saveProfile() {
  if (!browser) return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile to localStorage:", e);
  }
}

export function getProfileStore() {
  return {
    get profile() {
      return profile;
    },
    get slotPools() {
      return profile.slotPools;
    },
    get prepared() {
      return profile.prepared;
    },
  };
}

export function updateProfile(updates: Partial<CharacterProfile>) {
  profile = { ...profile, ...updates };
  saveProfile();
}

export function setSlotMax(poolId: string, level: number, max: number) {
  const pool = profile.slotPools.find((p) => p.id === poolId);
  if (pool) {
    pool.levels[level] = { ...pool.levels[level], max };
    profile = { ...profile };
    saveProfile();
  }
}

export function setSlotRemaining(
  poolId: string,
  level: number,
  remaining: number
) {
  const pool = profile.slotPools.find((p) => p.id === poolId);
  if (pool) {
    pool.levels[level] = {
      ...pool.levels[level],
      remaining: Math.max(0, remaining),
    };
    profile = { ...profile };
    saveProfile();
  }
}

export function adjustSlotRemaining(
  poolId: string,
  level: number,
  delta: number
) {
  const pool = profile.slotPools.find((p) => p.id === poolId);
  if (pool && pool.levels[level]) {
    const current = pool.levels[level].remaining;
    pool.levels[level] = {
      ...pool.levels[level],
      remaining: Math.max(0, current + delta),
    };
    profile = { ...profile };
    saveProfile();
  }
}

export function resetDay() {
  // Reset all remaining to max
  for (const pool of profile.slotPools) {
    for (const level of Object.keys(pool.levels)) {
      const lvl = parseInt(level);
      pool.levels[lvl].remaining = pool.levels[lvl].max;
    }
  }
  // Reset all prepared spells to unused
  for (const entry of profile.prepared) {
    entry.used = false;
  }
  profile = { ...profile };
  saveProfile();
}

export function addDomainPool() {
  if (!profile.slotPools.find((p) => p.id === "domain")) {
    profile.slotPools.push({
      id: "domain",
      label: "Domain",
      levels: Object.fromEntries(
        Array.from({ length: 10 }, (_, i) => [i, { max: 0, remaining: 0 }])
      ),
    });
    profile = { ...profile };
    saveProfile();
  }
}

export function removeDomainPool() {
  profile.slotPools = profile.slotPools.filter((p) => p.id !== "domain");
  // Also remove any prepared spells using domain pool
  profile.prepared = profile.prepared.filter((p) => p.poolId !== "domain");
  profile = { ...profile };
  saveProfile();
}

export function addPreparedSpell(
  spellId: string,
  preparedLevel: number,
  poolId: string
) {
  const entry: PreparedEntry = {
    id: crypto.randomUUID(),
    spellId,
    preparedLevel,
    poolId,
    used: false,
  };
  profile.prepared = [...profile.prepared, entry];
  saveProfile();
}

export function removePreparedSpell(entryId: string) {
  profile.prepared = profile.prepared.filter((p) => p.id !== entryId);
  saveProfile();
}

export function castPreparedSpell(entryId: string) {
  const entry = profile.prepared.find((p) => p.id === entryId);
  if (entry && !entry.used) {
    entry.used = true;
    adjustSlotRemaining(entry.poolId, entry.preparedLevel, -1);
    profile = { ...profile };
    saveProfile();
  }
}

export function uncastPreparedSpell(entryId: string) {
  const entry = profile.prepared.find((p) => p.id === entryId);
  if (entry && entry.used) {
    entry.used = false;
    adjustSlotRemaining(entry.poolId, entry.preparedLevel, 1);
    profile = { ...profile };
    saveProfile();
  }
}

export function exportProfile(): string {
  return JSON.stringify(profile, null, 2);
}

export function importProfile(json: string): boolean {
  try {
    const imported = JSON.parse(json);
    // Basic validation
    if (
      !imported.id ||
      !imported.name ||
      !imported.casterType ||
      !imported.slotPools
    ) {
      throw new Error("Invalid profile format");
    }
    profile = imported;
    saveProfile();
    return true;
  } catch (e) {
    console.error("Failed to import profile:", e);
    return false;
  }
}

export function resetProfile() {
  profile = createDefaultProfile();
  saveProfile();
}
