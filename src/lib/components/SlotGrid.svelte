<script lang="ts">
	import type { SlotPool } from '$lib/types';
	import {
		getProfileStore,
		setSlotMax,
		setSlotRemaining,
		adjustSlotRemaining,
		resetDay
	} from '$lib/stores.svelte';

	interface Props {
		domainEnabled?: boolean;
	}

	let { domainEnabled = false }: Props = $props();

	const profileStore = getProfileStore();

	// Create a display list that always includes domain column
	const displayPools = $derived.by(() => {
		const pools: Array<{ pool: SlotPool; disabled: boolean }> = [];
		
		// Add the regular pool
		const regularPool = profileStore.slotPools.find(p => p.id === 'regular');
		if (regularPool) {
			pools.push({ pool: regularPool, disabled: false });
		}
		
		// Always add domain column
		const domainPool = profileStore.slotPools.find(p => p.id === 'domain');
		if (domainPool) {
			pools.push({ pool: domainPool, disabled: false });
		} else {
			// Create a placeholder domain pool for display
			pools.push({
				pool: {
					id: 'domain',
					label: 'Domain',
					levels: Object.fromEntries(
						Array.from({ length: 10 }, (_, i) => [i, { max: 0, remaining: 0 }])
					)
				},
				disabled: true
			});
		}
		
		// Add any other custom pools
		for (const pool of profileStore.slotPools) {
			if (pool.id !== 'regular' && pool.id !== 'domain') {
				pools.push({ pool, disabled: false });
			}
		}
		
		return pools;
	});

	function handleMaxChange(poolId: string, level: number, e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value) || 0;
		setSlotMax(poolId, level, Math.max(0, value));
	}

	function handleRemainingChange(poolId: string, level: number, delta: number) {
		adjustSlotRemaining(poolId, level, delta);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Spell Slots</h2>
		<button
			type="button"
			onclick={() => resetDay()}
			class="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white
				text-sm font-medium rounded-lg transition-colors"
		>
			🌅 Reset Day
		</button>
	</div>

	<div class="overflow-x-auto">
		<table class="w-full border-collapse">
			<thead>
				<tr>
					<th class="p-2 text-left text-sm font-medium text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
						Level
					</th>
					{#each displayPools as { pool, disabled }}
						<th 
							class="p-2 text-center text-sm font-medium border-b border-[var(--color-border)]
								{disabled ? 'text-[var(--color-text-muted)]/40' : 'text-[var(--color-text-muted)]'}" 
							colspan="2"
						>
							{pool.label}
							{#if disabled}
								<span class="text-xs opacity-50">(disabled)</span>
							{/if}
						</th>
					{/each}
				</tr>
				<tr>
					<th class="p-2 text-left text-xs text-[var(--color-text-muted)]"></th>
					{#each displayPools as { pool, disabled }}
						<th class="p-2 text-center text-xs {disabled ? 'text-[var(--color-text-muted)]/40' : 'text-[var(--color-text-muted)]'}">Max</th>
						<th class="p-2 text-center text-xs {disabled ? 'text-[var(--color-text-muted)]/40' : 'text-[var(--color-text-muted)]'}">Remaining</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as level}
					<tr class="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
						<td class="p-2 text-sm font-medium text-[var(--color-text)]">
							{level === 0 ? '0 (Cantrip)' : level}
						</td>
						{#each displayPools as { pool, disabled }}
							{@const slotLevel = pool.levels[level] || { max: 0, remaining: 0 }}
							<td class="p-2 text-center {disabled ? 'opacity-40' : ''}">
								<input
									type="number"
									min="0"
									max="99"
									value={disabled ? 0 : slotLevel.max}
									{disabled}
									onchange={(e) => handleMaxChange(pool.id, level, e)}
									class="w-14 px-2 py-1 text-center text-sm bg-[var(--color-surface)] border border-[var(--color-border)]
										rounded text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]
										disabled:cursor-not-allowed disabled:bg-[var(--color-bg)]"
								/>
							</td>
							<td class="p-2 {disabled ? 'opacity-40' : ''}">
								<div class="flex items-center justify-center gap-1">
									<button
										type="button"
										onclick={() => handleRemainingChange(pool.id, level, -1)}
										disabled={disabled || slotLevel.remaining <= 0}
										class="w-7 h-7 flex items-center justify-center rounded bg-[var(--color-surface)] border border-[var(--color-border)]
											text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
									>
										−
									</button>
									<span
										class="w-8 text-center text-sm font-medium
											{disabled ? 'text-[var(--color-text-muted)]' : slotLevel.remaining === 0 ? 'text-red-400' : slotLevel.remaining < slotLevel.max ? 'text-yellow-400' : 'text-[var(--color-text)]'}"
									>
										{disabled ? 0 : slotLevel.remaining}
									</span>
									<button
										type="button"
										onclick={() => handleRemainingChange(pool.id, level, 1)}
										{disabled}
										class="w-7 h-7 flex items-center justify-center rounded bg-[var(--color-surface)] border border-[var(--color-border)]
											text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
									>
										+
									</button>
								</div>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
