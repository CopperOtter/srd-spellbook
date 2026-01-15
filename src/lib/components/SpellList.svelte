<script lang="ts">
	import type { Spell, SpellFilters, School, CasterClass } from '$lib/types';
	import SpellRow from './SpellRow.svelte';

	interface Props {
		spells: Spell[];
		filters: SpellFilters;
	}

	let { spells, filters }: Props = $props();

	const filteredSpells = $derived.by(() => {
		let result = spells;

		// Search filter
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

		// Sort by name
		return result.sort((a, b) => a.name.localeCompare(b.name));
	});
</script>

<!-- Only render if there are spells after filtering -->
{#if filteredSpells.length > 0}
	<div class="space-y-2">
		<p class="text-sm text-[var(--color-text-muted)] mb-3">
			{filteredSpells.length} spell{filteredSpells.length !== 1 ? 's' : ''}
		</p>
		{#each filteredSpells as spell (spell.id)}
			<SpellRow {spell} {filters} />
		{/each}
	</div>
{/if}
