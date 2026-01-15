<script lang="ts">
	import type { SpellFilters, School, CasterClass } from '$lib/types';

	interface Props {
		filters: SpellFilters;
		onFiltersChange: (filters: SpellFilters) => void;
	}

	let { filters, onFiltersChange }: Props = $props();

	const allClasses: CasterClass[] = ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'];
	const allSchools: School[] = [
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
	const allLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

	let showFilters = $state(false);

	function updateSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		onFiltersChange({ ...filters, search: target.value });
	}

	function toggleClass(cls: CasterClass) {
		const newClasses = filters.classes.includes(cls)
			? filters.classes.filter((c) => c !== cls)
			: [...filters.classes, cls];
		onFiltersChange({ ...filters, classes: newClasses });
	}

	function toggleSchool(school: School) {
		const newSchools = filters.schools.includes(school)
			? filters.schools.filter((s) => s !== school)
			: [...filters.schools, school];
		onFiltersChange({ ...filters, schools: newSchools });
	}

	function toggleLevel(level: number) {
		const newLevels = filters.levels.includes(level)
			? filters.levels.filter((l) => l !== level)
			: [...filters.levels, level];
		onFiltersChange({ ...filters, levels: newLevels });
	}

	function clearFilters() {
		onFiltersChange({ search: '', classes: [], levels: [], schools: [] });
	}

	const hasActiveFilters = $derived(
		filters.search.trim() !== '' ||
			filters.classes.length > 0 ||
			filters.levels.length > 0 ||
			filters.schools.length > 0
	);
</script>

<div class="space-y-3">
	<!-- Search and toggle -->
	<div class="flex gap-2">
		<div class="flex-1 relative">
			<input
				type="text"
				placeholder="Search spells..."
				value={filters.search}
				oninput={updateSearch}
				class="w-full px-4 py-2 pl-10 bg-[var(--color-surface)] border border-[var(--color-border)]
					rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)]
					focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
			/>
			<span class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">🔍</span>
		</div>
		<button
			type="button"
			onclick={() => (showFilters = !showFilters)}
			class="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg
				text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]
				transition-colors flex items-center gap-2"
		>
			<span>⚙️</span>
			<span>Filters</span>
			{#if hasActiveFilters}
				<span class="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
			{/if}
		</button>
		{#if hasActiveFilters}
			<button
				type="button"
				onclick={clearFilters}
				title="Clear all filters"
				class="px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg
					text-red-400 hover:bg-red-900/20 hover:border-red-500/50
					transition-colors flex items-center gap-1.5"
			>
				<span>✕</span>
				<span class="text-sm">Clear</span>
			</button>
		{/if}
	</div>

	<!-- Filter panels -->
	{#if showFilters}
		<div class="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg space-y-4">
			<!-- Classes -->
			<div>
				<h4 class="text-sm font-medium text-[var(--color-text-muted)] mb-2">Classes</h4>
				<div class="flex flex-wrap gap-2">
					{#each allClasses as cls}
						<button
							type="button"
							onclick={() => toggleClass(cls)}
							class="px-3 py-1 text-sm rounded-lg border transition-colors
								{filters.classes.includes(cls)
									? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
									: 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}"
						>
							{cls}
						</button>
					{/each}
				</div>
			</div>

			<!-- Levels -->
			<div>
				<h4 class="text-sm font-medium text-[var(--color-text-muted)] mb-2">Levels</h4>
				<div class="flex flex-wrap gap-2">
					{#each allLevels as level}
						<button
							type="button"
							onclick={() => toggleLevel(level)}
							class="w-8 h-8 text-sm rounded-lg border transition-colors
								{filters.levels.includes(level)
									? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
									: 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}"
						>
							{level}
						</button>
					{/each}
				</div>
			</div>

			<!-- Schools -->
			<div>
				<h4 class="text-sm font-medium text-[var(--color-text-muted)] mb-2">Schools</h4>
				<div class="flex flex-wrap gap-2">
					{#each allSchools as school}
						<button
							type="button"
							onclick={() => toggleSchool(school)}
							class="px-3 py-1 text-sm rounded-lg border transition-colors school-{school.toLowerCase()}
								{filters.schools.includes(school)
									? 'text-white'
									: 'bg-transparent border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}"
							style={filters.schools.includes(school)
								? 'background-color: var(--school-color); border-color: var(--school-color);'
								: ''}
						>
							{school}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
