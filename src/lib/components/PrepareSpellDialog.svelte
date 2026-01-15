<script lang="ts">
	import { getSpellStore, getProfileStore, addPreparedSpell } from '$lib/stores.svelte';
	import type { Spell } from '$lib/types';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open, onClose }: Props = $props();

	const spellStore = getSpellStore();
	const profileStore = getProfileStore();

	let searchQuery = $state('');
	let selectedSpell = $state<Spell | null>(null);
	let selectedPoolId = $state('regular');
	let selectedLevel = $state(0);

	const filteredSpells = $derived.by(() => {
		if (!searchQuery.trim()) return [];
		const query = searchQuery.toLowerCase();
		return spellStore.spells
			.filter(
				(s) =>
					s.name.toLowerCase().includes(query) ||
					s.brief.toLowerCase().includes(query)
			)
			.slice(0, 20);
	});

	const availableLevels = $derived.by(() => {
		if (!selectedSpell) return [];
		const levels = new Set<number>();
		for (const level of Object.values(selectedSpell.levels.byClass)) {
			if (level !== undefined) levels.add(level);
		}
		if (selectedSpell.levels.byDomain) {
			for (const level of Object.values(selectedSpell.levels.byDomain)) {
				levels.add(level);
			}
		}
		// Also allow higher levels (for upcasting)
		const minLevel = Math.min(...levels);
		for (let i = minLevel; i <= 9; i++) {
			levels.add(i);
		}
		return Array.from(levels).sort((a, b) => a - b);
	});

	function selectSpell(spell: Spell) {
		selectedSpell = spell;
		// Default to lowest available level
		const levels = availableLevels;
		if (levels.length > 0) {
			selectedLevel = levels[0];
		}
	}

	function handlePrepare() {
		if (!selectedSpell) return;
		addPreparedSpell(selectedSpell.id, selectedLevel, selectedPoolId);
		resetAndClose();
	}

	function resetAndClose() {
		searchQuery = '';
		selectedSpell = null;
		selectedPoolId = 'regular';
		selectedLevel = 0;
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			resetAndClose();
		}
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/50 z-40"
		onclick={resetAndClose}
		onkeydown={handleKeydown}
		role="button"
		tabindex="-1"
	></div>

	<!-- Dialog -->
	<div
		class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
			w-full max-w-lg max-h-[80vh] overflow-auto
			bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
	>
		<div class="p-4 border-b border-[var(--color-border)]">
			<h2 id="dialog-title" class="text-lg font-semibold text-[var(--color-text)]">
				Prepare a Spell
			</h2>
		</div>

		<div class="p-4 space-y-4">
			<!-- Search -->
			<div>
				<label for="spell-search" class="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
					Search for a spell
				</label>
				<input
					id="spell-search"
					type="text"
					placeholder="Type to search..."
					bind:value={searchQuery}
					class="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)]
						rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)]
						focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
				/>
			</div>

			<!-- Search Results -->
			{#if searchQuery.trim() && !selectedSpell}
				<div class="max-h-48 overflow-y-auto space-y-1">
					{#each filteredSpells as spell}
						<button
							type="button"
							onclick={() => selectSpell(spell)}
							class="w-full text-left p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
						>
							<div class="font-medium text-[var(--color-text)]">{spell.name}</div>
							<div class="text-xs text-[var(--color-text-muted)]">{spell.brief}</div>
						</button>
					{/each}
					{#if filteredSpells.length === 0}
						<p class="text-sm text-[var(--color-text-muted)] text-center py-4">
							No spells found
						</p>
					{/if}
				</div>
			{/if}

			<!-- Selected Spell -->
			{#if selectedSpell}
				<div class="p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
					<div class="flex items-center justify-between">
						<div>
							<div class="font-medium text-[var(--color-text)]">{selectedSpell.name}</div>
							<div class="text-xs text-[var(--color-text-muted)]">{selectedSpell.brief}</div>
						</div>
						<button
							type="button"
							onclick={() => (selectedSpell = null)}
							class="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
						>
							✕
						</button>
					</div>
				</div>

				<!-- Pool Selection -->
				<div>
					<span class="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
						Slot Pool
					</span>
					<div class="flex gap-2">
						{#each profileStore.slotPools as pool}
							<button
								type="button"
								onclick={() => (selectedPoolId = pool.id)}
								class="px-4 py-2 text-sm rounded-lg border transition-colors
									{selectedPoolId === pool.id
										? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
										: 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}"
							>
								{pool.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Level Selection -->
				<div>
					<span class="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
						Slot Level
					</span>
					<div class="flex flex-wrap gap-2">
						{#each availableLevels as level}
							<button
								type="button"
								onclick={() => (selectedLevel = level)}
								class="w-10 h-10 text-sm rounded-lg border transition-colors
									{selectedLevel === level
										? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
										: 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'}"
							>
								{level}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="p-4 border-t border-[var(--color-border)] flex justify-end gap-2">
			<button
				type="button"
				onclick={resetAndClose}
				class="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)]
					text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handlePrepare}
				disabled={!selectedSpell}
				class="px-4 py-2 text-sm rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
					text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Prepare Spell
			</button>
		</div>
	</div>
{/if}
