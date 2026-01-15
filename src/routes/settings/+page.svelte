<script lang="ts">
	import { exportProfile, importProfile, resetProfile } from '$lib/stores.svelte';

	let importText = $state('');
	let exportText = $state('');
	let importError = $state('');
	let importSuccess = $state(false);

	function handleExport() {
		exportText = exportProfile();
	}

	function handleImport() {
		importError = '';
		importSuccess = false;

		if (!importText.trim()) {
			importError = 'Please paste your profile JSON';
			return;
		}

		const success = importProfile(importText);
		if (success) {
			importSuccess = true;
			importText = '';
		} else {
			importError = 'Invalid profile format. Please check your JSON.';
		}
	}

	function handleReset() {
		if (confirm('Are you sure you want to reset your profile? This cannot be undone.')) {
			resetProfile();
		}
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(exportText);
	}
</script>

<svelte:head>
	<title>Settings - SRD Spellbook (3.5)</title>
</svelte:head>

<div class="space-y-8">
	<h1 class="text-2xl font-bold">Settings</h1>

	<!-- Export -->
	<section class="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
		<h2 class="text-lg font-semibold">Export Profile</h2>
		<p class="text-sm text-[var(--color-text-muted)]">
			Export your character profile and prepared spells as JSON.
		</p>
		
		<button
			type="button"
			onclick={handleExport}
			class="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
				text-white font-medium rounded-lg transition-colors"
		>
			Generate Export
		</button>

		{#if exportText}
			<div class="space-y-2">
				<textarea
					readonly
					value={exportText}
					class="w-full h-48 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)]
						rounded-lg text-[var(--color-text)] text-sm font-mono resize-none"
				></textarea>
				<button
					type="button"
					onclick={copyToClipboard}
					class="px-4 py-2 border border-[var(--color-border)] rounded-lg
						text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
				>
					📋 Copy to Clipboard
				</button>
			</div>
		{/if}
	</section>

	<!-- Import -->
	<section class="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
		<h2 class="text-lg font-semibold">Import Profile</h2>
		<p class="text-sm text-[var(--color-text-muted)]">
			Paste a previously exported profile JSON to restore it. This will overwrite your current profile.
		</p>

		<textarea
			bind:value={importText}
			placeholder="Paste your profile JSON here..."
			class="w-full h-48 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)]
				rounded-lg text-[var(--color-text)] text-sm font-mono resize-none
				placeholder-[var(--color-text-muted)]"
		></textarea>

		{#if importError}
			<p class="text-sm text-red-400">{importError}</p>
		{/if}

		{#if importSuccess}
			<p class="text-sm text-green-400">✓ Profile imported successfully!</p>
		{/if}

		<button
			type="button"
			onclick={handleImport}
			class="px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
				text-white font-medium rounded-lg transition-colors"
		>
			Import Profile
		</button>
	</section>

	<!-- Reset -->
	<section class="space-y-4 p-4 bg-[var(--color-surface)] border border-red-500/30 rounded-lg">
		<h2 class="text-lg font-semibold text-red-400">Danger Zone</h2>
		<p class="text-sm text-[var(--color-text-muted)]">
			Reset your profile to default. This will clear all your slot configurations and prepared spells.
		</p>
		<button
			type="button"
			onclick={handleReset}
			class="px-4 py-2 bg-red-600 hover:bg-red-700
				text-white font-medium rounded-lg transition-colors"
		>
			Reset Profile
		</button>
	</section>

	<!-- OGL Notice -->
	<section class="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
		<h2 class="text-lg font-semibold">Open Game License</h2>
		<div class="text-sm text-[var(--color-text-muted)] space-y-4 max-h-96 overflow-y-auto">
			<p>
				The spell data in this application is based on the System Reference Document (SRD) 
				published by Wizards of the Coast under the Open Game License.
			</p>
			<p class="font-medium text-[var(--color-text)]">OPEN GAME LICENSE Version 1.0a</p>
			<p>
				The following text is the property of Wizards of the Coast, Inc. and is Copyright 2000 
				Wizards of the Coast, Inc ("Wizards"). All Rights Reserved.
			</p>
			<ol class="list-decimal list-inside space-y-2">
				<li>
					<strong>Definitions:</strong> (a) "Contributors" means the copyright and/or trademark 
					owners who have contributed Open Game Content; (b) "Derivative Material" means 
					copyrighted material including derivative works and translations...
				</li>
				<li>
					<strong>The License:</strong> This License applies to any Open Game Content that 
					contains a notice indicating that the Open Game Content may only be Used under and 
					in terms of this License.
				</li>
				<li>
					<strong>Offer and Acceptance:</strong> By Using the Open Game Content You indicate 
					Your acceptance of the terms of this License.
				</li>
			</ol>
			<p>
				For the complete Open Game License text, visit 
				<a 
					href="https://www.d20srd.org/ogl.htm" 
					target="_blank" 
					rel="noopener noreferrer"
					class="text-[var(--color-accent)] hover:underline"
				>
					d20srd.org/ogl.htm
				</a>
			</p>
			<p class="border-t border-[var(--color-border)] pt-4">
				<strong>Data Source:</strong> 
				<a 
					href="https://www.d20srd.org/" 
					target="_blank" 
					rel="noopener noreferrer"
					class="text-[var(--color-accent)] hover:underline"
				>
					d20srd.org
				</a> 
				— SRD text is published as Open Game Content.
			</p>
		</div>
	</section>
</div>
