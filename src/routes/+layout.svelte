<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const navItems = [
		{ href: resolve('/spells'), label: 'Spells', icon: '📜' },
		{ href: resolve('/tracker'), label: 'Tracker', icon: '⚡' },
		{ href: resolve('/settings'), label: '', icon: '⚙️' }
	];
</script>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3">
		<div class="max-w-6xl mx-auto flex items-center justify-between">
			<a href={resolve('/')} class="flex items-center gap-2 hover:opacity-80 transition-opacity">
				<h1 class="text-xl font-bold text-[var(--color-text)]">SRD Spellbook</h1>
				<span class="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-hover)] px-2 py-0.5 rounded">3.5</span>
			</a>
			
			<nav class="flex gap-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
							{$page.url.pathname.startsWith(item.href)
								? 'bg-[var(--color-accent)] text-white'
								: 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'}"
					>
						<span>{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>
		</div>
	</header>

	<!-- Main content -->
	<main class="flex-1">
		<div class="max-w-6xl mx-auto px-4 py-6">
			{@render children()}
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3">
		<div class="max-w-6xl mx-auto text-center text-xs text-[var(--color-text-muted)]">
			SRD content is Open Game Content. See <a href={resolve("/settings")} class="underline hover:text-[var(--color-text)]">Settings</a> for license info.
		</div>
	</footer>
</div>
