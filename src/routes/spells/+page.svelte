<script lang="ts">
	import { onMount } from 'svelte';
	import { loadSpells, getSpellStore } from '$lib/stores.svelte';
	import type { BrowseTab, SpellFilters, School, CasterClass, Spell } from '$lib/types';
	import BrowseTabs from '$lib/components/BrowseTabs.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import SpellList from '$lib/components/SpellList.svelte';
	import SpellRow from '$lib/components/SpellRow.svelte';

	const spellStore = getSpellStore();

	let activeTab = $state<BrowseTab>('level');
	let filters = $state<SpellFilters>({
		search: '',
		classes: [],
		levels: [],
		schools: []
	});

	// Grouped views
	const spellsByLevelGrouped = $derived.by(() => {
		const groups: Record<number, Spell[]> = {};
		for (let i = 0; i <= 9; i++) groups[i] = [];

		for (const spell of spellStore.spells) {
			const levels = new Set<number>();
			for (const level of Object.values(spell.levels.byClass)) {
				if (level !== undefined) levels.add(level);
			}
			if (spell.levels.byDomain) {
				for (const level of Object.values(spell.levels.byDomain)) {
					levels.add(level);
				}
			}
			for (const level of levels) {
				if (groups[level]) groups[level].push(spell);
			}
		}

		// Sort each group by name
		for (const level in groups) {
			groups[level].sort((a, b) => a.name.localeCompare(b.name));
		}

		return groups;
	});

	const spellsByClassGrouped = $derived.by(() => {
		const groups: Record<string, Spell[]> = {};
		const classes: CasterClass[] = ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'];

		for (const cls of classes) {
			groups[cls] = [];
		}

		for (const spell of spellStore.spells) {
			for (const cls of classes) {
				if (spell.levels.byClass[cls] !== undefined) {
					groups[cls].push(spell);
				}
			}
		}

		for (const cls in groups) {
			groups[cls].sort((a, b) => a.name.localeCompare(b.name));
		}

		return groups;
	});

	const spellsBySchoolGrouped = $derived.by(() => {
		const groups: Record<string, Spell[]> = {};
		const schools: School[] = [
			'Abjuration',
			'Conjuration',
			'Divination',
			'Enchantment',
			'Evocation',
			'Illusion',
			'Necromancy',
			'Transmutation',
			'Universal'
		];

		for (const school of schools) {
			groups[school] = [];
		}

		for (const spell of spellStore.spells) {
			if (groups[spell.school]) {
				groups[spell.school].push(spell);
			}
		}

		for (const school in groups) {
			groups[school].sort((a, b) => a.name.localeCompare(b.name));
		}

		return groups;
	});

	// Helper to filter spells based on current filters (same logic as SpellList)
	function filterSpells(spells: Spell[]): Spell[] {
		let result = spells;

		if (filters.search.trim()) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(s) =>
					s.name.toLowerCase().includes(searchLower) ||
					s.brief.toLowerCase().includes(searchLower) ||
					s.description.toLowerCase().includes(searchLower)
			);
		}

		// Filter logic: AND between categories, OR within categories
		// (Class A OR Class B) AND (Level X OR Level Y) AND (School 1 OR School 2)
		const hasClassFilter = filters.classes.length > 0;
		const hasLevelFilter = filters.levels.length > 0;
		const hasSchoolFilter = filters.schools.length > 0;

		result = result.filter((s) => {
			// Check class filter (OR within classes)
			if (hasClassFilter) {
				const matchesClass = filters.classes.some((cls) => s.levels.byClass[cls] !== undefined);
				if (!matchesClass) return false;
			}

			// Check level filter - must match level for a selected class (if class filter active)
			if (hasLevelFilter) {
				let matchesLevel = false;
				if (hasClassFilter) {
					// Level must match for one of the selected classes
					for (const cls of filters.classes) {
						const classLevel = s.levels.byClass[cls];
						if (classLevel !== undefined && filters.levels.includes(classLevel)) {
							matchesLevel = true;
							break;
						}
					}
				} else {
					// No class filter, just check if spell has any of the selected levels
					const spellLevels = new Set<number>();
					for (const level of Object.values(s.levels.byClass)) {
						if (level !== undefined) spellLevels.add(level);
					}
					if (s.levels.byDomain) {
						for (const level of Object.values(s.levels.byDomain)) {
							spellLevels.add(level);
						}
					}
					matchesLevel = filters.levels.some((l) => spellLevels.has(l));
				}
				if (!matchesLevel) return false;
			}

			// Check school filter (OR within schools)
			if (hasSchoolFilter) {
				if (!filters.schools.includes(s.school)) return false;
			}

			return true;
		});

		return result;
	}

	// Check if any section has results after filtering
	const hasAnyResults = $derived.by(() => {
		if (activeTab === 'level') {
			for (let i = 0; i <= 9; i++) {
				const shouldShowSection = filters.levels.length === 0 || filters.levels.includes(i);
				if (shouldShowSection && filterSpells(spellsByLevelGrouped[i] || []).length > 0) return true;
			}
		} else if (activeTab === 'class') {
			for (const cls of ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'] as CasterClass[]) {
				const shouldShowSection = filters.classes.length === 0 || filters.classes.includes(cls);
				if (shouldShowSection && filterSpells(spellsByClassGrouped[cls] || []).length > 0) return true;
			}
		} else if (activeTab === 'school') {
			for (const school of ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation', 'Universal'] as School[]) {
				const shouldShowSection = filters.schools.length === 0 || filters.schools.includes(school);
				if (shouldShowSection && filterSpells(spellsBySchoolGrouped[school] || []).length > 0) return true;
			}
		}
		return false;
	});

	function handleTabChange(tab: BrowseTab) {
		activeTab = tab;
	}

	function handleFiltersChange(newFilters: SpellFilters) {
		filters = newFilters;
	}

	onMount(() => {
		loadSpells();
	});
</script>

<svelte:head>
	<title>Spells - SRD Spellbook (3.5)</title>
</svelte:head>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">Spell Browser</h1>

	{#if !spellStore.loaded}
		{#if spellStore.error}
			<div class="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
				<p class="font-medium">Error loading spells</p>
				<p class="text-sm">{spellStore.error}</p>
			</div>
		{:else}
			<div class="flex items-center justify-center py-12">
				<div class="text-center">
					<div class="animate-spin text-4xl mb-4">⏳</div>
					<p class="text-[var(--color-text-muted)]">Loading spells...</p>
				</div>
			</div>
		{/if}
	{:else}
		<BrowseTabs {activeTab} onTabChange={handleTabChange} />
		<FilterBar {filters} onFiltersChange={handleFiltersChange} />

		<!-- Global "No spells found" message when all sections are empty -->
		{#if !hasAnyResults}
			<div class="text-center py-12 text-[var(--color-text-muted)]">
				<p class="text-lg mb-2">No spells found</p>
				<p class="text-sm">Try adjusting your filters</p>
			</div>
		{:else}
			<!-- Grouped views with filtering -->
			{#if activeTab === 'level'}
				{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as level}
					{@const levelSpells = spellsByLevelGrouped[level] || []}
					{@const filteredLevelSpells = filterSpells(levelSpells)}
					{@const shouldShowSection = filters.levels.length === 0 || filters.levels.includes(level)}
					{#if shouldShowSection && filteredLevelSpells.length > 0}
						<div class="space-y-3">
							<h2 class="text-lg font-semibold text-[var(--color-text)] sticky top-0 bg-[var(--color-bg)] py-2 z-10 border-b border-[var(--color-border)]">
								{level === 0 ? 'Cantrips (Level 0)' : `Level ${level}`}
							</h2>
							<SpellList spells={levelSpells} {filters} />
						</div>
					{/if}
				{/each}
			{:else if activeTab === 'class'}
				{#each ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'] as cls (cls)}
					{@const classSpells = spellsByClassGrouped[cls] || []}
					{@const filteredClassSpells = filterSpells(classSpells)}
					{@const shouldShowSection = filters.classes.length === 0 || filters.classes.includes(cls as CasterClass)}
					{#if shouldShowSection && filteredClassSpells.length > 0}
						<div class="space-y-3">
							<h2 class="text-lg font-semibold text-[var(--color-text)] sticky top-0 bg-[var(--color-bg)] py-2 z-10 border-b border-[var(--color-border)]">
								{cls}
							</h2>
							<SpellList spells={classSpells} {filters} />
						</div>
					{/if}
				{/each}
			{:else if activeTab === 'school'}
				{#each ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation', 'Universal'] as school (school)}
					{@const schoolSpells = spellsBySchoolGrouped[school] || []}
					{@const filteredSchoolSpells = filterSpells(schoolSpells)}
					{@const shouldShowSection = filters.schools.length === 0 || filters.schools.includes(school as School)}
					{#if shouldShowSection && filteredSchoolSpells.length > 0}
						<div class="space-y-3">
							<h2 class="text-lg font-semibold text-[var(--color-text)] sticky top-0 bg-[var(--color-bg)] py-2 z-10 border-b border-[var(--color-border)] school-{school.toLowerCase()}"
								style="color: var(--school-color);">
								{school}
							</h2>
							<SpellList spells={schoolSpells} {filters} />
						</div>
					{/if}
				{/each}
			{/if}
		{/if}
	{/if}
</div>
