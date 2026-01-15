<script lang="ts">
	import {
		getProfileStore,
		getSpellStore,
		removePreparedSpell,
		castPreparedSpell,
		uncastPreparedSpell
	} from '$lib/stores.svelte';
	import SpellTooltipCard from './SpellTooltipCard.svelte';
	import type { Spell } from '$lib/types';

	const profileStore = getProfileStore();
	const spellStore = getSpellStore();

	// Tooltip state
	let tooltipSpell = $state<Spell | null>(null);
	let showTooltip = $state(false);
	let cursorX = $state(0);
	let cursorY = $state(0);
	let hoverTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let isMouseOverTooltip = $state(false);

	const TOOLTIP_DELAY = 1000;

	function getSpellName(spellId: string): string {
		return spellStore.byId[spellId]?.name || spellId;
	}

	function getSpell(spellId: string): Spell | undefined {
		return spellStore.byId[spellId];
	}

	function getPoolLabel(poolId: string): string {
		return profileStore.slotPools.find((p) => p.id === poolId)?.label || poolId;
	}

	function clearTimers() {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
	}

	function handleMouseEnter(spell: Spell | undefined) {
		if (!spell) return;
		clearTimers();
		hoverTimeout = setTimeout(() => {
			tooltipSpell = spell;
			showTooltip = true;
		}, TOOLTIP_DELAY);
	}

	function handleMouseMove(e: MouseEvent) {
		cursorX = e.clientX;
		cursorY = e.clientY;
	}

	function handleMouseLeave() {
		clearTimers();
		setTimeout(() => {
			if (!showTooltip) return;
			if (isMouseOverTooltip) return;
			showTooltip = false;
			tooltipSpell = null;
		}, 150);
	}

	function handleTooltipMouseEnter() {
		isMouseOverTooltip = true;
	}

	function handleTooltipMouseLeave() {
		isMouseOverTooltip = false;
	}

	function closeTooltip() {
		clearTimers();
		showTooltip = false;
		tooltipSpell = null;
	}
</script>

<div class="space-y-4">
	<h2 class="text-lg font-semibold">Prepared Spells</h2>

	{#if profileStore.prepared.length === 0}
		<div class="text-center py-8 text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
			<p class="mb-2">No spells prepared</p>
			<p class="text-sm">Use the "Prepare Spell" button below to add spells</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each profileStore.prepared as entry (entry.id)}
				{@const spell = getSpell(entry.spellId)}
				<div
					role="article"
					class="flex items-center justify-between p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg
						{entry.used ? 'opacity-60' : ''}"
					onmouseenter={() => handleMouseEnter(spell)}
					onmousemove={handleMouseMove}
					onmouseleave={handleMouseLeave}
				>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<span class="font-medium text-[var(--color-text)] {entry.used ? 'line-through' : ''}">
								{getSpellName(entry.spellId)}
							</span>
							<span class="text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
								Lvl {entry.preparedLevel}
							</span>
							<span class="text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
								{getPoolLabel(entry.poolId)}
							</span>
						</div>
						{#if entry.notes}
							<p class="text-sm text-[var(--color-text-muted)] mt-1">{entry.notes}</p>
						{/if}
					</div>

					<div class="flex items-center gap-2">
						{#if entry.used}
							<button
								type="button"
								onclick={() => uncastPreparedSpell(entry.id)}
								class="px-3 py-1 text-sm rounded-lg border border-[var(--color-border)]
									text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
							>
								↩️ Restore
							</button>
						{:else}
							<button
								type="button"
								onclick={() => castPreparedSpell(entry.id)}
								class="px-3 py-1 text-sm rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
									text-white font-medium transition-colors"
							>
								⚡ Cast
							</button>
						{/if}
						<button
							type="button"
							onclick={() => removePreparedSpell(entry.id)}
							class="px-2 py-1 text-sm rounded-lg border border-[var(--color-border)]
								text-red-400 hover:bg-red-900/20 transition-colors"
						>
							✕
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if tooltipSpell}
	<SpellTooltipCard
		spell={tooltipSpell}
		{cursorX}
		{cursorY}
		visible={showTooltip}
		onClose={closeTooltip}
		onTooltipMouseEnter={handleTooltipMouseEnter}
		onTooltipMouseLeave={handleTooltipMouseLeave}
	/>
{/if}
