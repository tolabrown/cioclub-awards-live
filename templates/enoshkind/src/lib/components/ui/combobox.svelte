<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import { Button } from '$lib/components/ui/button';
	import { Check, ChevronsUpDown, Search } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';
	import type { iSelect } from './select/select-component.svelte';

	let {
		options = [],
		value = $bindable(''),
		placeholder = 'Select option...',
		searchPlaceholder = 'Search...',
		emptyMessage = 'No option found.',
		class: className = ''
	} = $props<{
		options: { label: string; value: string }[];
		value: string;
		placeholder?: string;
		searchPlaceholder?: string;
		emptyMessage?: string;
		class?: string;
	}>();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	const selectedLabel = $derived(
		options.find((f: iSelect) => f.value === value)?.label ?? placeholder
	);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef} class="w-full">
		{#snippet child({ props })}
			<Button
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={cn('w-full justify-between h-12 rounded-xl px-4 font-medium', className)}
				{...props}
			>
				{selectedLabel}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		class="w-[var(--bits-popover-anchor-width)] p-0 rounded-xl overflow-hidden border-border/40 shadow-2xl"
	>
		<Command.Root>
			<Command.Input placeholder={searchPlaceholder} class="h-10" />
			<Command.Empty>{emptyMessage}</Command.Empty>
			<Command.List class="max-h-64 overflow-y-auto">
				<Command.Group>
					{#each options as option}
						<Command.Item
							value={option.label}
							onSelect={() => {
								value = option.value;
								closeAndFocusTrigger();
							}}
							class="cursor-pointer font-medium"
						>
							<Check class={cn('mr-2 h-4 w-4', value !== option.value && 'text-transparent')} />
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
