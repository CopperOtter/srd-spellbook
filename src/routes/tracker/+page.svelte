<script lang="ts">
	import { onMount } from 'svelte';
	import { loadSpells, getProfileStore, updateProfile, addDomainPool, removeDomainPool } from '$lib/stores.svelte';
	import type { CasterClass, CasterType } from '$lib/types';
	import SlotGrid from '$lib/components/SlotGrid.svelte';
	import PreparedList from '$lib/components/PreparedList.svelte';
	import PrepareSpellDialog from '$lib/components/PrepareSpellDialog.svelte';

	const profileStore = getProfileStore();

	let prepareDialogOpen = $state(false);

	const classes: CasterClass[] = ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'];
	const casterTypes: Array<{ value: CasterType; label: string }> = [
		{ value: 'prepared', label: 'Prepared (Wizard, Cleric, Druid)' },
		{ value: 'spontaneous', label: 'Spontaneous (Sorcerer, Bard)' }
	];

	const hasDomainPool = $derived(profileStore.slotPools.some((p) => p.id === 'domain'));

	function handleNameChange(e: Event) {
		const target = e.target as HTMLInputElement;
		updateProfile({ name: target.value });
	}

	function handleCasterTypeChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		updateProfile({ casterType: target.value as CasterType });
	}

	function handleCasterClassChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		updateProfile({ casterClass: target.value as CasterClass });
	}

	function toggleDomainPool() {
		if (hasDomainPool) {
			removeDomainPool();
		} else {
			addDomainPool();
		}
	}

	onMount(() => {
		loadSpells();
	});
</script>

<svelte:head>
	<title>Tracker - SRD Spellbook (3.5)</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-2xl font-bold">Spell Tracker</h1>

	<!-- Character Profile -->
	<section class="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
		<h2 class="text-lg font-semibold">Character Profile</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<div>
				<label for="char-name" class="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
					Character Name
				</label>
				<input
					id="char-name"
					type="text"
					value={profileStore.profile.name}
					oninput={handleNameChange}
					class="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)]
						rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
				/>
			</div>

			<div>
				<label for="caster-type" class="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
					Caster Type
				</label>
				<select
					id="caster-type"
					value={profileStore.profile.casterType}
					onchange={handleCasterTypeChange}
					class="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)]
						rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
				>
					{#each casterTypes as type}
						<option value={type.value}>{type.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="caster-class" class="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
					Class
				</label>
				<select
					id="caster-class"
					value={profileStore.profile.casterClass}
					onchange={handleCasterClassChange}
					class="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)]
						rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
				>
					{#each classes as cls}
						<option value={cls}>{cls}</option>
					{/each}
				</select>
			</div>

			<div class="flex items-end">
				<button
					type="button"
					onclick={toggleDomainPool}
					class="w-full px-4 py-2 rounded-lg border-2 transition-colors font-medium
						{hasDomainPool
							? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
							: 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500'}"
				>
					{hasDomainPool ? '✓ Domain Slots Enabled' : '⚡ Enable Domain Slots'}
				</button>
			</div>
		</div>
	</section>

	<!-- Slot Grid -->
	<section>
		<SlotGrid domainEnabled={hasDomainPool} />
	</section>

	<!-- Prepared Spells -->
	<section class="space-y-4">
		<PreparedList />
		
		<button
			type="button"
			onclick={() => (prepareDialogOpen = true)}
			class="w-full px-4 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]
				border border-[var(--color-border)] border-dashed rounded-lg
				text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors
				flex items-center justify-center gap-2"
		>
			<span class="text-xl">+</span>
			<span>Prepare Spell</span>
		</button>
	</section>
</div>

<PrepareSpellDialog open={prepareDialogOpen} onClose={() => (prepareDialogOpen = false)} />
