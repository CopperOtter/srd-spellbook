<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>SRD Spellbook (3.5)</title>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
	<div class="text-6xl mb-6">📖</div>
	<h1 class="text-4xl font-bold mb-4">SRD Spellbook (3.5)</h1>
	<p class="text-[var(--color-text-muted)] text-lg mb-8 max-w-md">
		A fast, compact SRD spell browser with delayed tooltips and practical slot tracking.
	</p>
	
	<div class="flex gap-4">
		<a
			href="/spells"
			class="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-lg transition-colors"
		>
			<span>📜</span>
			<span>Browse Spells</span>
		</a>
		<a
			href="/tracker"
			class="flex items-center gap-2 px-6 py-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text)] font-medium rounded-lg border border-[var(--color-border)] transition-colors"
		>
			<span>⚡</span>
			<span>Spell Tracker</span>
		</a>
	</div>

	<div class="mt-12 grid grid-cols-3 gap-8 text-center">
		<div>
			<div class="text-3xl mb-2">🔍</div>
			<h3 class="font-medium mb-1">Browse by Level, Class, or School</h3>
			<p class="text-sm text-[var(--color-text-muted)]">Filter and search the complete SRD spell list</p>
		</div>
		<div>
			<div class="text-3xl mb-2">📋</div>
			<h3 class="font-medium mb-1">Full Stat Block Tooltips</h3>
			<p class="text-sm text-[var(--color-text-muted)]">Hover for 2.5s to see complete spell details</p>
		</div>
		<div>
			<div class="text-3xl mb-2">⚡</div>
			<h3 class="font-medium mb-1">Track Slots & Prepared Spells</h3>
			<p class="text-sm text-[var(--color-text-muted)]">Manage your caster's daily resources</p>
		</div>
	</div>
</div>
