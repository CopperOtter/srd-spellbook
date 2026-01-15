<script lang="ts">
	import type { Spell, SpellFilters } from '$lib/types';
	import SpellTooltipCard from './SpellTooltipCard.svelte';
	import AddToTrackerDialog from './AddToTrackerDialog.svelte';
	import { browser } from '$app/environment';

	interface Props {
		spell: Spell;
		filters?: SpellFilters;
	}

	let { spell, filters }: Props = $props();

	let rowEl: HTMLDivElement | null = $state(null);
	let showTooltip = $state(false);
	let hoverTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let focusTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let cursorX = $state(0);
	let cursorY = $state(0);
	let isMouseOverTooltip = $state(false);
	let showAddDialog = $state(false);

	// Touch/long-press state
	let longPressTimeout: ReturnType<typeof setTimeout> | null = $state(null);
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let didLongPress = $state(false);

	const TOOLTIP_DELAY = 1000; // 1 second for hover
	const LONG_PRESS_DELAY = 500; // 500ms for long-press

	// Detect touch device
	const isTouchDevice = $derived(browser && ('ontouchstart' in window || navigator.maxTouchPoints > 0));

	function getSchoolClass(school: string): string {
		return `school-${school.toLowerCase()}`;
	}

	interface ChipData {
		label: string;
		fullName: string;
		level: number;
		isClass: boolean;
		highlighted: boolean;
	}

	function getClassLevelChips(spell: Spell): ChipData[] {
		const chips: ChipData[] = [];
		
		for (const [cls, level] of Object.entries(spell.levels.byClass)) {
			// Check if this chip matches the active filters
			let highlighted = false;
			if (filters) {
				const classMatches = filters.classes.length === 0 || filters.classes.includes(cls as any);
				const levelMatches = filters.levels.length === 0 || filters.levels.includes(level);
				// Highlight if both class and level match (or if the respective filter is not active)
				highlighted = classMatches && levelMatches && (filters.classes.length > 0 || filters.levels.length > 0);
			}
			chips.push({ label: cls.substring(0, 3), fullName: cls, level, isClass: true, highlighted });
		}
		
		if (spell.levels.byDomain) {
			for (const [domain, level] of Object.entries(spell.levels.byDomain)) {
				let highlighted = false;
				if (filters) {
					// Domain chips match when level filter matches (domains aren't in class filter)
					const levelMatches = filters.levels.length === 0 || filters.levels.includes(level);
					highlighted = levelMatches && filters.levels.length > 0;
				}
				chips.push({ label: domain.substring(0, 3), fullName: domain, level, isClass: false, highlighted });
			}
		}
		
		return chips.sort((a, b) => a.level - b.level);
	}

	function startHoverTimer(e: MouseEvent) {
		clearTimers();
		cursorX = e.clientX;
		cursorY = e.clientY;
		hoverTimeout = setTimeout(() => {
			showTooltip = true;
		}, TOOLTIP_DELAY);
	}

	function startFocusTimer() {
		clearTimers();
		// For keyboard focus, position near the element
		if (rowEl) {
			const rect = rowEl.getBoundingClientRect();
			cursorX = rect.right;
			cursorY = rect.top + rect.height / 2;
		}
		focusTimeout = setTimeout(() => {
			showTooltip = true;
		}, TOOLTIP_DELAY);
	}

	function clearTimers() {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
		if (focusTimeout) {
			clearTimeout(focusTimeout);
			focusTimeout = null;
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!showTooltip) {
			cursorX = e.clientX;
			cursorY = e.clientY;
		}
	}

	function handleMouseEnter(e: MouseEvent) {
		startHoverTimer(e);
	}

	function handleMouseLeave() {
		clearTimers();
		// Don't immediately close - check if mouse moved to tooltip
		setTimeout(() => {
			if (!showTooltip) return;
			if (isMouseOverTooltip) return; // Mouse is over tooltip, keep it open
			showTooltip = false;
		}, 150);
	}

	function handleTooltipMouseEnter() {
		isMouseOverTooltip = true;
	}

	function handleTooltipMouseLeave() {
		isMouseOverTooltip = false;
	}

	function handleFocus() {
		startFocusTimer();
	}

	function handleBlur() {
		clearTimers();
		showTooltip = false;
	}

	function closeTooltip() {
		clearTimers();
		showTooltip = false;
	}

	function handleClick() {
		// On touch devices, click is handled by touch events
		if (isTouchDevice) return;
		closeTooltip();
		showAddDialog = true;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			closeTooltip();
			showAddDialog = true;
		}
	}

	// Touch event handlers
	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		cursorX = touch.clientX;
		cursorY = touch.clientY;
		didLongPress = false;

		longPressTimeout = setTimeout(() => {
			didLongPress = true;
			showTooltip = true;
		}, LONG_PRESS_DELAY);
	}

	function handleTouchMove(e: TouchEvent) {
		// Cancel long-press if finger moves too much
		const touch = e.touches[0];
		const deltaX = Math.abs(touch.clientX - touchStartX);
		const deltaY = Math.abs(touch.clientY - touchStartY);
		
		if (deltaX > 10 || deltaY > 10) {
			if (longPressTimeout) {
				clearTimeout(longPressTimeout);
				longPressTimeout = null;
			}
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (longPressTimeout) {
			clearTimeout(longPressTimeout);
			longPressTimeout = null;
		}

		// If long-press triggered, don't open dialog
		if (didLongPress) {
			didLongPress = false;
			return;
		}

		// Short tap: open dialog
		e.preventDefault(); // Prevent click from firing
		showAddDialog = true;
	}

	function handleTouchCancel() {
		if (longPressTimeout) {
			clearTimeout(longPressTimeout);
			longPressTimeout = null;
		}
		didLongPress = false;
	}
</script>

<div
	bind:this={rowEl}
	role="button"
	tabindex="0"
	class="group p-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] 
		border border-[var(--color-border)] rounded-lg cursor-pointer transition-colors
		focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]
		select-none touch-manipulation"
	onclick={handleClick}
	onkeydown={handleKeydown}
	onmouseenter={handleMouseEnter}
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
	onfocus={handleFocus}
	onblur={handleBlur}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	ontouchcancel={handleTouchCancel}
>
	<div class="flex items-start justify-between gap-3">
		<!-- Left: Name, School, Brief -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-1">
				<h3 class="font-medium text-[var(--color-text)] truncate">{spell.name}</h3>
				<span
					class="text-xs px-1.5 py-0.5 rounded {getSchoolClass(spell.school)}"
					style="background-color: color-mix(in srgb, var(--school-color) 20%, transparent); color: var(--school-color);"
				>
					{spell.school}
					{#if spell.subschool}
						<span class="opacity-70">({spell.subschool})</span>
					{/if}
				</span>
				{#if spell.descriptors}
					{#each spell.descriptors as descriptor}
						<span class="text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
							{descriptor}
						</span>
					{/each}
				{/if}
			</div>
			<p class="text-sm text-[var(--color-text-muted)] line-clamp-1">{spell.brief}</p>
		</div>

		<!-- Right: Class/Level chips -->
		<div class="flex flex-wrap gap-1 justify-end">
			{#each getClassLevelChips(spell) as chip}
				<span 
					class="text-xs px-1.5 py-0.5 rounded transition-colors
						{chip.highlighted 
							? 'bg-green-600/30 text-green-400 ring-1 ring-green-500/50' 
							: 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'}"
					title="{chip.fullName} {chip.level}"
				>
					{chip.label} {chip.level}
				</span>
			{/each}
		</div>
	</div>
</div>

<SpellTooltipCard 
	{spell} 
	{cursorX} 
	{cursorY} 
	visible={showTooltip} 
	onClose={closeTooltip}
	onTooltipMouseEnter={handleTooltipMouseEnter}
	onTooltipMouseLeave={handleTooltipMouseLeave}
/>

<AddToTrackerDialog
	{spell}
	open={showAddDialog}
	onClose={() => showAddDialog = false}
/>
