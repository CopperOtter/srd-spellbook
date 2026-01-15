<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { Spell } from '$lib/types';

	interface Props {
		spell: Spell;
		cursorX: number;
		cursorY: number;
		visible: boolean;
		onClose: () => void;
		onTooltipMouseEnter?: () => void;
		onTooltipMouseLeave?: () => void;
	}

	let { spell, cursorX, cursorY, visible, onClose, onTooltipMouseEnter, onTooltipMouseLeave }: Props = $props();

	let tooltipEl: HTMLDivElement | null = $state(null);
	let isMouseOver = $state(false);

	// Detect touch device
	const isTouchDevice = $derived(browser && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

	function formatLevels(spell: Spell): string {
		const parts: string[] = [];
		for (const [cls, level] of Object.entries(spell.levels.byClass)) {
			parts.push(`${cls} ${level}`);
		}
		if (spell.levels.byDomain) {
			for (const [domain, level] of Object.entries(spell.levels.byDomain)) {
				parts.push(`${domain} ${level}`);
			}
		}
		return parts.join(', ');
	}

	function formatComponents(spell: Spell): string {
		let result = spell.components.join(', ');
		if (spell.componentDetails) {
			const details: string[] = [];
			if (spell.componentDetails.material) details.push(`M: ${spell.componentDetails.material}`);
			if (spell.componentDetails.focus) details.push(`F: ${spell.componentDetails.focus}`);
			if (spell.componentDetails.xp) details.push(`XP: ${spell.componentDetails.xp}`);
			if (details.length > 0) {
				result += ` (${details.join('; ')})`;
			}
		}
		return result;
	}

	function getSchoolLine(spell: Spell): string {
		let line = spell.school;
		if (spell.subschool) line += ` (${spell.subschool})`;
		if (spell.descriptors && spell.descriptors.length > 0) {
			line += ` [${spell.descriptors.join(', ')}]`;
		}
		return line;
	}

	function updatePosition() {
		if (!tooltipEl) return;

		const padding = 12;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const tooltipRect = tooltipEl.getBoundingClientRect();
		const tooltipWidth = tooltipRect.width || 520;
		const tooltipHeight = tooltipRect.height || 400;

		let x = cursorX + padding;
		let y = cursorY + padding;

		// Check if tooltip would overflow right edge
		if (x + tooltipWidth > viewportWidth - padding) {
			// Position to the left of cursor
			x = cursorX - tooltipWidth - padding;
		}

		// Check if tooltip would overflow bottom edge
		if (y + tooltipHeight > viewportHeight - padding) {
			// Position above cursor (anchor from bottom)
			y = cursorY - tooltipHeight - padding;
		}

		// Ensure tooltip doesn't go off left edge
		if (x < padding) {
			x = padding;
		}

		// Ensure tooltip doesn't go off top edge
		if (y < padding) {
			y = padding;
		}

		Object.assign(tooltipEl.style, {
			left: `${x}px`,
			top: `${y}px`
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && visible) {
			onClose();
		}
	}

	function handleMouseEnter() {
		isMouseOver = true;
		onTooltipMouseEnter?.();
	}

	function handleMouseLeave() {
		isMouseOver = false;
		onTooltipMouseLeave?.();
		onClose();
	}

	$effect(() => {
		if (visible && tooltipEl) {
			updatePosition();
		}
	});

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if visible}
	<!-- Backdrop for touch devices - tap outside to close -->
	{#if isTouchDevice}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="fixed inset-0 z-40" 
			onclick={onClose}
			ontouchstart={onClose}
		></div>
	{/if}
	<div
		bind:this={tooltipEl}
		role="tooltip"
		class="tooltip-enter fixed z-50 w-[520px] max-w-[90vw] max-h-[80vh] overflow-auto
			bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl"
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
	>
		<!-- Header -->
		<div class="p-4 border-b border-[var(--color-border)]">
			<h2 class="text-xl font-bold text-[var(--color-text)] mb-1">{spell.name}</h2>
			<p class="text-sm text-[var(--color-text-muted)]">{getSchoolLine(spell)}</p>
		</div>

		<!-- Stat Block -->
		<div class="p-4 space-y-2 text-sm border-b border-[var(--color-border)]">
			<div class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
				<span class="font-medium text-[var(--color-text-muted)]">Level:</span>
				<span class="text-[var(--color-text)]">{formatLevels(spell)}</span>

				<span class="font-medium text-[var(--color-text-muted)]">Components:</span>
				<span class="text-[var(--color-text)]">{formatComponents(spell)}</span>

				<span class="font-medium text-[var(--color-text-muted)]">Casting Time:</span>
				<span class="text-[var(--color-text)]">{spell.castingTime}</span>

				<span class="font-medium text-[var(--color-text-muted)]">Range:</span>
				<span class="text-[var(--color-text)]">{spell.range}</span>

				{#if spell.target}
					<span class="font-medium text-[var(--color-text-muted)]">Target:</span>
					<span class="text-[var(--color-text)]">{spell.target}</span>
				{/if}

				{#if spell.targets}
					<span class="font-medium text-[var(--color-text-muted)]">Targets:</span>
					<span class="text-[var(--color-text)]">{spell.targets}</span>
				{/if}

				{#if spell.area}
					<span class="font-medium text-[var(--color-text-muted)]">Area:</span>
					<span class="text-[var(--color-text)]">{spell.area}</span>
				{/if}

				{#if spell.effect}
					<span class="font-medium text-[var(--color-text-muted)]">Effect:</span>
					<span class="text-[var(--color-text)]">{spell.effect}</span>
				{/if}

				<span class="font-medium text-[var(--color-text-muted)]">Duration:</span>
				<span class="text-[var(--color-text)]">{spell.duration}</span>

				<span class="font-medium text-[var(--color-text-muted)]">Saving Throw:</span>
				<span class="text-[var(--color-text)]">{spell.savingThrow}</span>

				<span class="font-medium text-[var(--color-text-muted)]">Spell Resistance:</span>
				<span class="text-[var(--color-text)]">{spell.spellResistance}</span>
			</div>
		</div>

		<!-- Description -->
		<div class="p-4">
			<p class="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
				{spell.description}
			</p>
		</div>

		<!-- SRD Link -->
		{#if spell.srdUrl}
			<div class="px-4 pb-4">
				<a
					href={spell.srdUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="text-xs text-[var(--color-accent)] hover:underline"
				>
					View on d20srd.org →
				</a>
			</div>
		{/if}
	</div>
{/if}
