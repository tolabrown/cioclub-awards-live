<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Mail, Phone, MapPin, Send, MessageCircle, AlertCircle } from '@lucide/svelte';
	import { fly, fade } from 'svelte/transition';
	import { Constants } from '$lib/constants';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let sending = $state(false);
</script>

<svelte:head>
	<title>Contact Us | EnoshKind</title>
</svelte:head>

<div class="flex flex-col min-h-screen">
	<!-- Hero -->
	<section class="py-20 bg-muted/30">
		<div class="container mx-auto px-4 text-center">
			<h1 class="font-bold mb-4 capitalize tracking-tighter">
				Get in <span class="text-primary">Touch</span>
			</h1>
			<p class="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
				Have questions about EnoshKind? Our team is here to support your journey to better health.
			</p>
		</div>
	</section>

	<section class="py-24 bg-background">
		<div class="container mx-auto px-4">
			<div class="grid lg:grid-cols-2 gap-4">
				<!-- Contact Info -->
				<div in:fly={{ x: -20, duration: 800 }}>
					<h2 class="font-bold mb-4">Contact Information</h2>
					<div class="space-y-4">
						<div class="flex items-start gap-4 group">
							<div
								class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<Mail class="w-6 h-6" />
							</div>
							<div>
								<h3 class="font-bold mb-1 capitalize tracking-wider">Email Us</h3>

								<a
									href="mailto:{Constants.SUPPORTEMAIL}"
									class="text-muted-foreground text-sm md:text-base hover:text-primary transition-colors"
								>
									{Constants.SUPPORTEMAIL}
								</a>
							</div>
						</div>

						<div class="flex items-start gap-4 group">
							<div
								class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<Phone class="w-6 h-6" />
							</div>
							<div>
								<h3 class="font-bold mb-1 capitalize tracking-wider">Call Us</h3>

								<a
									href="tel:+2347035278240"
									class="text-muted-foreground hover:text-primary transition-colors"
								>
									+234 703 527 8240
								</a>
							</div>
						</div>

						<div class="flex items-start gap-4 group">
							<div
								class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
							>
								<MapPin class="w-6 h-6" />
							</div>
							<div>
								<h3 class="font-bold mb-1 capitalize tracking-wider">Visit Us</h3>

								<p class=" text-muted-foreground">Lagos, Nigeria</p>
							</div>
						</div>

						<div class="pt-10">
							<div
								class="p-4 rounded-lg bg-muted/50 border border-dashed flex items-center justify-between gap-6"
							>
								<div>
									<h4 class="font-bold mb-2">Need Immediate Help?</h4>
									<p class="text-muted-foreground">
										Our AI Buddy is available 24/7 for health-related queries.
									</p>
								</div>
								<Button
									href="/ai-buddy"
									variant="secondary"
									size="icon"
									class="rounded-full shrink-0"
								>
									<MessageCircle class="w-5 h-5" />
								</Button>
							</div>
						</div>
					</div>
				</div>

				<!-- Contact Form -->
				<div
					class="bg-card p-4 rounded-lg border shadow-lg relative overflow-hidden"
					in:fly={{ x: 20, duration: 800 }}
				>
					{#if form?.success}
						<div
							class="absolute inset-0 bg-card z-10 flex flex-col items-center justify-center text-center p-10 animate-in fade-in zoom-in duration-500"
						>
							<div
								class="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6"
							>
								<Send class="w-10 h-10" />
							</div>
							<h3 class="text-3xl font-bold mb-4">Message Sent!</h3>
							<p class="text-muted-foreground mb-8">
								Thank you for reaching out. A member of our team will get back to you shortly.
							</p>
							<Button variant="outline" onclick={() => window.location.reload()} class=""
								>Send Another Message</Button
							>
						</div>
					{/if}

					<h2 class="font-bold mb-4">Send a Message</h2>

					{#if form?.error}
						<div
							class="mb-4 p-4 rounded-xl bg-destructive/10 text-destructive flex gap-4 items-center"
							in:fade
						>
							<AlertCircle class="w-5 h-5 shrink-0" />
							<p>{form.error}</p>
						</div>
					{/if}

					<form
						method="POST"
						use:enhance={() => {
							sending = true;
							return async ({ update }) => {
								await update();
								sending = false;
							};
						}}
						class="space-y-4"
					>
						<div class="grid md:grid-cols-2 gap-4">
							<div class="space-y-2">
								<label for="name" class="font-bold capitalize tracking-widest text-muted-foreground"
									>Full Name</label
								>
								<Input
									id="name"
									name="name"
									placeholder="John Doe"
									required
									value={form?.values?.name ?? ''}
									class="rounded-xl bg-muted/50 border-transparent focus:bg-background focus:ring-primary"
								/>
							</div>
							<div class="space-y-2">
								<label
									for="email"
									class="text-sm font-bold capitalize tracking-widest text-muted-foreground"
									>Email Address</label
								>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="john@example.com"
									required
									value={form?.values?.email ?? ''}
									class="rounded-xl bg-muted/50 border-transparent focus:bg-background focus:ring-primary"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<label
								for="subject"
								class="text-sm font-bold capitalize tracking-widest text-muted-foreground"
								>Subject</label
							>
							<Input
								id="subject"
								name="subject"
								placeholder="How can we help?"
								required
								value={form?.values?.subject ?? ''}
								class="rounded-xl bg-muted/50 border-transparent focus:bg-background focus:ring-primary"
							/>
						</div>
						<div class="space-y-2">
							<label
								for="message"
								class="text-sm font-bold capitalize tracking-widest text-muted-foreground"
								>Your Message</label
							>
							<Textarea
								id="message"
								name="message"
								placeholder="Type your message here..."
								required
								rows={5}
								value={form?.values?.message ?? ''}
								class="rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:ring-primary resize-none"
							/>
						</div>
						<Button
							type="submit"
							disabled={sending}
							class="w-full font-bold shadow-lg shadow-primary/20"
						>
							{sending ? 'Sending...' : 'Send Message'}
							<Send class="ml-2 w-5 h-5" />
						</Button>
					</form>
				</div>
			</div>
		</div>
	</section>
</div>
