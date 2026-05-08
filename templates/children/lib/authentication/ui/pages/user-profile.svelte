<script lang="ts">
	import { page } from "$app/state";
	import type { User } from "$lib/auth";
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";
	import { Constants } from "$lib/constants";
	import { cn } from "$lib/utils";
	import ChangePasswordForm from "../change-password-form.svelte";
	import UpdateUserForm from "../update-user-form.svelte";
	import type { Account } from "better-auth";

	let user = $derived<User>(page.data.session?.user);
	let account = $derived<Account>(page.data.session?.account);
	let isACredentialAccount = $derived(
		account && account.providerId === Constants.CREDENTIAL,
	);

	let updatedAt = $derived(
		user?.updatedAt
			? new Date(user.updatedAt)
					.toLocaleDateString("en-US", {
						weekday: "short",
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "numeric",
						hour12: true,
					})
					.replace(/,\s*\d+:\d+:\d+\s*(AM|PM)/, (match) => {
						const hour = new Date(user.updatedAt).getHours();
						const period = hour >= 12 ? "PM" : "AM";
						const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
						return ` ${displayHour}${period}`;
					})
			: "N/A",
	);
	let createdAt = $derived(
		user?.createdAt
			? new Date(user.createdAt)
					.toLocaleDateString("en-US", {
						weekday: "short",
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "numeric",
						hour12: true,
					})
					.replace(/,\s*\d+:\d+:\d+\s*(AM|PM)/, (match) => {
						const hour = new Date(user.createdAt).getHours();
						const period = hour >= 12 ? "PM" : "AM";
						const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
						return ` ${displayHour}${period}`;
					})
			: "N/A",
	);
</script>

<div class="py-8">
	<div class="space-y-4">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-foreground">My Profile</h1>
			<p class="mt-2 text-muted-foreground">
				Manage your account settings and preferences
			</p>
		</div>

		<UpdateUserForm />
		<div
			class={cn(
				"grid grid-cols-1",
				isACredentialAccount ? "md:grid-cols-2" : "md:grid-cols-1",
				"gap-4",
			)}
		>
			{#if isACredentialAccount}
				<Card class="shadow-elevated w-full">
					<CardHeader>
						<CardTitle class="text-lg">Update Password</CardTitle>
					</CardHeader>

					<CardContent class="w-full space-y-6">
						<ChangePasswordForm />
					</CardContent>
				</Card>
			{/if}

			<Card class="shadow-elevated">
				<CardHeader>
					<CardTitle class="text-lg">Account Information</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div
						class="flex flex-col items-start justify-between border-b border-border py-2 sm:flex-row sm:items-center"
					>
						<span class="text-muted-foreground">Member since</span>
						<span class="font-medium">
							{createdAt}
						</span>
					</div>
					<div
						class="flex flex-col items-start justify-between border-b border-border py-2 sm:flex-row sm:items-center"
					>
						<span class="text-muted-foreground">Last updated</span>
						<span class="font-medium">
							{updatedAt}
						</span>
					</div>
					<div
						class="flex flex-col items-start justify-between py-2 sm:flex-row sm:items-center"
					>
						<span class="text-muted-foreground">User ID</span>
						<span class="rounded bg-muted px-2 py-1 font-mono text-sm">
							{user?.id}
						</span>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
