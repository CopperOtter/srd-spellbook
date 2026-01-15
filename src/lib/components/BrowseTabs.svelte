<script lang="ts">
	import type { BrowseTab } from '$lib/types';

	interface Props {
		activeTab: BrowseTab;
		onTabChange: (tab: BrowseTab) => void;
	}

	let { activeTab, onTabChange }: Props = $props();

	const tabs: Array<{ id: BrowseTab; label: string; icon: string }> = [
		{ id: 'level', label: 'By Level', icon: '📊' },
		{ id: 'class', label: 'By Class', icon: '🧙' },
		{ id: 'school', label: 'By School', icon: '📚' }
	];
</script>

<div class="flex gap-1 p-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
	{#each tabs as tab}
		<button
			type="button"
			onclick={() => onTabChange(tab.id)}
			class="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
				{activeTab === tab.id
					? 'bg-[var(--color-accent)] text-white'
					: 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'}"
		>
			<span>{tab.icon}</span>
			<span>{tab.label}</span>
		</button>
	{/each}
</div>
