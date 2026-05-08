<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3",
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground [a&]:hover:bg-primary/90 border-transparent",
				secondary:
					"bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
				orange:
					"bg-orange-300 dark:bg-orange-500 text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
				blue:
					"bg-blue-500 dark:bg-blue-500 text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
				pink:
					"bg-pink-500 dark:bg-pink-500 text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
					
				gsgreen: "bg-green-500/10 text-green-800 dark:bg-green-800/30 dark:text-green-500 [a&]:hover:bg-secondary/90 border-transparent",
				gsred: "bg-red-500/10 text-red-800 dark:bg-red-800/30 dark:text-red-500 [a&]:hover:bg-secondary/90 border-transparent",
				gspink: "bg-pink-500/10 text-pink-800 dark:bg-pink-800/30 dark:text-pink-500 [a&]:hover:bg-pink/90 border-transparent",
				gsblue: "bg-blue-500/10 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500 [a&]:hover:bg-blue/90 border-transparent",
				gsorange: "bg-orange-500/10 text-orange-600 dark:bg-orange-800/30 dark:text-orange-500 [a&]:hover:bg-secondary/90 border-transparent",
				gsprimary: "bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary [a&]:hover:bg-secondary/90 border-transparent",
				green:
					"bg-green-300 dark:bg-green-500 dark:text-background text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
				purple:
					"bg-purple-300 dark:bg-purple-500 text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
				destructive:
					"bg-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/70 border-transparent text-white",
				outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				muted: "text-muted-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
