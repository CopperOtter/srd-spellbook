<script lang="ts">
	import { getProfileStore, addPreparedSpell } from '$lib/stores.svelte';
	import type { Spell, CasterClass } from '$lib/types';

	interface Props {
		spell: Spell;
		open: boolean;
		onClose: () => void;
	}

	let { spell, open, onClose }: Props = $props();

	const profileStore = getProfileStore();

	// Form state
	let selectedClass = $state<CasterClass | null>(null);
	let selectedLevel = $state(0);
	let selectedPoolId = $state('regular');

	// Get available classes from the spell
	const availableClasses = $derived(
		Object.keys(spell.levels.byClass) as CasterClass[]
	);

	// Get available domains from the spell
	const availableDomains = $derived(
		spell.levels.byDomain ? Object.keys(spell.levels.byDomain) : []
	);

	// Check if domain pool exists in profile
	const hasDomainPool = $derived(
		profileStore.slotPools.some(p => p.id === 'domain')
	);

	// Check if the selected class is actually a domain
	const isDomainSelected = $derived(
		selectedPoolId === 'domain'
	);

	// Get minimum level for the selected class/domain
	const minLevel = $derived.by(() => {
		if (selectedPoolId === 'domain' && spell.levels.byDomain) {
			// For domain spells, find the first matching domain
			const domainLevels = Object.values(spell.levels.byDomain);
			return domainLevels.length > 0 ? Math.min(...domainLevels) : 0;
		}
		if (selectedClass) {
			const classLevel = spell.levels.byClass[selectedClass];
			if (classLevel !== undefined) {
				return classLevel;
			}
		}
		// Default to lowest level from any class
		const levels = Object.values(spell.levels.byClass).filter((l): l is number => l !== undefined);
		return levels.length > 0 ? Math.min(...levels) : 0;
	});

	// Get available levels (from min level to 9)
	const availableLevels = $derived(
		Array.from({ length: 10 - minLevel }, (_, i) => minLevel + i)
	);

	// Initialize form when dialog opens
	$effect(() => {
		if (open) {
			// Auto-select the profile's caster class if it's available for this spell
			const profileClass = profileStore.profile.casterClass;
			if (availableClasses.includes(profileClass)) {
				selectedClass = profileClass;
			} else if (availableClasses.length > 0) {
				selectedClass = availableClasses[0];
			} else {
				selectedClass = null;
			}

			// Default to regular pool
			selectedPoolId = 'regular';

			// Set initial level
			if (selectedClass) {
				const classLevel = spell.levels.byClass[selectedClass];
				if (classLevel !== undefined) {
					selectedLevel = classLevel;
				} else {
					const levels = Object.values(spell.levels.byClass).filter((l): l is number => l !== undefined);
					selectedLevel = levels.length > 0 ? Math.min(...levels) : 0;
				}
			} else {
				const levels = Object.values(spell.levels.byClass).filter((l): l is number => l !== undefined);
				selectedLevel = levels.length > 0 ? Math.min(...levels) : 0;
			}
		}
	});

	// Update selected level when class changes
	$effect(() => {
		if (selectedClass) {
			const classLevel = spell.levels.byClass[selectedClass];
			if (classLevel !== undefined && selectedLevel < classLevel) {
				selectedLevel = classLevel;
			}
		}
	});

	// Update selected level when pool changes to domain
	$effect(() => {
		if (selectedPoolId === 'domain' && spell.levels.byDomain) {
			const domainLevels = Object.values(spell.levels.byDomain);
			if (domainLevels.length > 0) {
				const domainMinLevel = Math.min(...domainLevels);
				if (selectedLevel < domainMinLevel) {
					selectedLevel = domainMinLevel;
				}
			}
		}
	});

	function handleAdd() {
		addPreparedSpell(spell.id, selectedLevel, selectedPoolId);
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

{#if open}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="button"
		tabindex="-1"
	>
		<!-- Dialog -->
		<div
			class="w-full max-w-md mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			tabindex="-1"
			onkeydown={handleKeydown}
		>
			<!-- Header -->
			<div class="p-4 border-b border-[var(--color-border)]">
				<h2 id="dialog-title" class="text-lg font-semibold text-[var(--color-text)]">
					Add to Tracker
				</h2>
				<p class="text-sm text-[var(--color-text-muted)] mt-1">
					{spell.name}
				</p>
			</div>

			<!-- Content -->
			<div class="p-4 space-y-4">
				<!-- Class Selection -->
				{#if availableClasses.length > 0}
					<div>
						<label for="class-select" class="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
							Class
						</label>
						<select
							id="class-select"
							bind:value={selectedClass}
							class="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)]
								rounded-lg text-[var(--color-text)]
								focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
						>
							{#each availableClasses as cls}
								<option value={cls}>
									{cls} (Level {spell.levels.byClass[cls]})
								</option>
							{/each}
						</select>
					</div>
				{:else}
					<p class="text-sm text-[var(--color-text-muted)]">
						This spell is not available to any class.
					</p>
				{/if}

				<!-- Pool Selection (Regular vs Domain) -->
				{#if hasDomainPool && availableDomains.length > 0}
					<div>
						<span class="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
							Spell Type
						</span>
						<div class="flex gap-2">
							<button
								type="button"
								onclick={() => selectedPoolId = 'regular'}
								class="flex-1 px-4 py-2 rounded-lg border transition-colors
									{selectedPoolId === 'regular' 
										? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' 
										: 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'}"
							>
								Regular
							</button>
							<button
								type="button"
								onclick={() => selectedPoolId = 'domain'}
								class="flex-1 px-4 py-2 rounded-lg border transition-colors
									{selectedPoolId === 'domain' 
										? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]' 
										: 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'}"
							>
								Domain
								<span class="text-xs opacity-70 block">
									{#each availableDomains.slice(0, 2) as domain, i}
										{domain}{i < Math.min(availableDomains.length, 2) - 1 ? ', ' : ''}{/each}{#if availableDomains.length > 2}...{/if}
								</span>
							</button>
						</div>
					</div>
				{:else if !hasDomainPool && availableDomains.length > 0}
					<p class="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg)] p-2 rounded-lg">
						💡 This spell is also available as a domain spell. Enable domain slots in the Tracker to use it.
					</p>
				{/if}

				<!-- Level Selection -->
				<div>
					<label for="level-select" class="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
						Slot Level
					</label>
					<select
						id="level-select"
						bind:value={selectedLevel}
						class="w-full px-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)]
							rounded-lg text-[var(--color-text)]
							focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
					>
						{#each availableLevels as level}
							<option value={level}>
								Level {level}
								{#if level === minLevel}(base){/if}
								{#if level > minLevel}(upcast +{level - minLevel}){/if}
							</option>
						{/each}
					</select>
				</div>

				<!-- Info about current slots -->
				{#if profileStore.slotPools.find(p => p.id === selectedPoolId)}
					{@const pool = profileStore.slotPools.find(p => p.id === selectedPoolId)}
					{#if pool}
						<div class="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg)] p-2 rounded-lg">
							Current {pool.label} Level {selectedLevel} slots: 
							<span class="font-medium text-[var(--color-text)]">
								{pool.levels[selectedLevel]?.remaining ?? 0} / {pool.levels[selectedLevel]?.max ?? 0}
							</span>
						</div>
					{/if}
				{/if}
			</div>

			<!-- Footer -->
			<div class="p-4 border-t border-[var(--color-border)] flex gap-3 justify-end">
				<button
					type="button"
					onclick={onClose}
					class="px-4 py-2 rounded-lg border border-[var(--color-border)]
						text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={handleAdd}
					disabled={!selectedClass && selectedPoolId !== 'domain'}
					class="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white
						hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Add to Prepared
				</button>
			</div>
		</div>
	</div>
{/if}
