<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import {
		Stethoscope,
		User,
		DollarSign,
		Building,
		CreditCard,
		ShieldCheck,
		ArrowRight,
		ArrowLeft,
		CheckCircle2,
		Loader2,
		Plus,
		Trash2,
		Clock
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import Combobox from '$lib/components/ui/combobox.svelte';

	let step = $state(1);
	let loading = $state(false);
	let banks = $state<any[]>([]);
	let fetchingBanks = $state(false);

	const bankOptions = $derived(banks.map((b) => ({ label: b.name, value: b.code })));

	let form = $state({
		name: page.data.user?.name || '',
		specialty: '',
		price: '',
		bio: '',
		image: page.data.user?.image || '',
		bankCode: '',
		bankName: '',
		accountNumber: '',
		accountName: '',
		legalAccepted: false,
		licenseUrl: '',
		availability: [] as any[]
	});

	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	onMount(async () => {
		fetchingBanks = true;
		try {
			const res = await fetch('/api/banks');
			const data = await res.json();
			if (data.status) {
				banks = data.data;
			}
		} catch (e) {
			toast.error('Failed to load banks. Please refresh.');
		} finally {
			fetchingBanks = false;
		}
	});

	async function validateAccount() {
		if (form.accountNumber.length !== 10 || !form.bankCode) return;

		loading = true;
		try {
			const res = await fetch('/api/paystack/resolve-account', {
				method: 'POST',
				body: JSON.stringify({
					account_number: form.accountNumber,
					bank_code: form.bankCode
				})
			});
			const data = await res.json();
			if (data.status) {
				form.accountName = data.data.account_name;
				form.bankName = banks.find((b) => b.code === form.bankCode)?.name || '';
				toast.success('Account verified');
			} else {
				toast.error(data.message || 'Could not verify account');
			}
		} catch (e) {
			toast.error('Verification error');
		} finally {
			loading = false;
		}
	}

	async function handleSubmit() {
		if (!form.legalAccepted) return toast.error('Please accept the legal terms');

		loading = true;
		try {
			const res = await fetch('/api/doctors/onboard', {
				method: 'POST',
				body: JSON.stringify({
					...form,
					availabilitySlots: form.availability
				})
			});
			const data = await res.json();
			if (data.success) {
				toast.success('Onboarding complete!', { description: 'Welcome to the telemedicine team.' });
				window.location.href = '/telemedicine/doctor';
			} else {
				toast.error('Onboarding failed', { description: data.message });
			}
		} catch (e) {
			toast.error('An error occurred during onboarding');
		} finally {
			loading = false;
		}
	}

	async function handleLicenseUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		const formData = new FormData();
		formData.append('file', file);

		loading = true;
		try {
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (data.success) {
				form.licenseUrl = data.url;
				toast.success('License uploaded successfully');
			} else {
				toast.error('Upload failed: ' + data.message);
			}
		} catch (error) {
			toast.error('An error occurred during upload');
		} finally {
			loading = false;
		}
	}

	const nextStep = () => {
		if (step === 1) {
			if (!form.name || !form.specialty || !form.price || !form.bio || !form.licenseUrl) {
				return toast.error('Please fill all professional details and upload your license');
			}
		}
		if (step === 2) {
			if (!form.accountName) {
				return toast.error('Please verify your bank details');
			}
		}
		step++;
	};

	const prevStep = () => step--;
</script>

<div class="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
	<div class="max-w-4xl mx-auto py-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
				Doctor Onboarding
			</h1>
			<p class="text-muted-foreground mt-3 text-base sm: max-w-2xl mx-auto">
				Join Enoshkind's network of world-class healthcare providers and start your virtual practice
				today.
			</p>

			<div class="flex items-center justify-center mt-10 gap-2 sm:gap-4 flex-wrap">
				{#each [1, 2, 3, 4] as s}
					<div class="flex items-center">
						<div
							class="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold transition-all duration-500
							{step >= s
								? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105 rotate-3'
								: 'bg-muted/50 text-muted-foreground border border-border/50'}"
						>
							{#if step > s}
								<CheckCircle2 class="w-6 h-6" />
							{:else}
								{s}
							{/if}
						</div>
						{#if s < 4}
							<div
								class="w-6 sm:w-12 h-1 mx-1 sm:mx-2 rounded-full transition-colors duration-500 {step >
								s
									? 'bg-primary'
									: 'bg-muted/30'}"
							></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="relative">
			<!-- Decorative Background Elements -->
			<div
				class="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"
			></div>
			<div
				class="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"
				style="animation-delay: 1s"
			></div>

			{#if step === 1}
				<Card
					class="border-border/40 shadow-2xl overflow-hidden bg-background/80 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-10"
				>
					<CardHeader
						class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-0 px-0 border-b border-border/40"
					>
						<CardTitle class="flex items-center gap-4 text-2xl sm:text-3xl font-bold">
							<div class="p-3 bg-primary/20 text-primary">
								<Stethoscope class="w-7 h-7" />
							</div>
							Professional Profile
						</CardTitle>
						<CardDescription class="text-base"
							>Tell us about your medical background and your consultation rates.</CardDescription
						>
					</CardHeader>
					<CardContent class="p-0 space-y-8">
						<div class="grid gap-8 md:grid-cols-2">
							<div class="space-y-3">
								<Label
									for="name"
									class="font-bold text-sm tracking-wide ml-1 capitalize text-muted-foreground"
									>Full Professional Name</Label
								>
								<div class="relative group">
									<User
										class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"
									/>
									<Input
										id="name"
										bind:value={form.name}
										class="pl-12 border-border/50 bg-muted/20 focus:bg-background transition-all  font-medium"
										placeholder="Dr. Jane Smith"
									/>
								</div>
							</div>
							<div class="space-y-3">
								<Label
									for="specialty"
									class="font-bold text-sm tracking-wide ml-1 capitalize text-muted-foreground"
									>Medical Specialty</Label
								>
								<div class="relative group">
									<Stethoscope
										class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"
									/>
									<Input
										id="specialty"
										bind:value={form.specialty}
										class="pl-12 border-border/50 bg-muted/20 focus:bg-background transition-all  font-medium"
										placeholder="e.g. Consultant Cardiologist"
									/>
								</div>
							</div>
						</div>

						<div class="space-y-3">
							<Label
								for="price"
								class="font-bold text-sm tracking-wide ml-1 capitalize text-muted-foreground"
								>Consultation Fee (₦)</Label
							>
							<div class="relative group">
								<span
									class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"
									>₦</span
								>
								<Input
									type="number"
									id="price"
									bind:value={form.price}
									class="pl-12 border-border/50 bg-muted/20 focus:bg-background transition-all text-xl font-bold"
									placeholder="5000"
								/>
							</div>
							<p class="text-xs text-muted-foreground flex items-center gap-2 mt-2 px-1">
								<ShieldCheck class="w-3.5 h-3.5 text-primary" />
								Note: A 15% platform service charge will be added to this amount.
							</p>
						</div>

						<div class="space-y-3">
							<Label
								for="bio"
								class="font-bold text-sm tracking-wide ml-1 capitalize text-muted-foreground"
								>Professional Bio</Label
							>
							<Textarea
								id="bio"
								bind:value={form.bio}
								class="min-h-[160px] border-border/50 bg-muted/20 focus:bg-background transition-all p-5  leading-relaxed pt-6 mb-4"
								placeholder="Share your expertise, certifications, and years of experience..."
							/>
						</div>

						<div
							class="space-y-4 p-6 bg-primary/5 border-2 border-primary/10 rounded-xl relative overflow-hidden group"
						>
							<div
								class="absolute top-0 right-0 p-3 text-primary/10 group-hover:text-primary/20 transition-colors"
							>
								<ShieldCheck class="w-16 h-16" />
							</div>
							<Label
								class="font-bold text-sm tracking-wide capitalize text-primary flex items-center gap-2"
							>
								<ShieldCheck class="w-4 h-4" />
								Professional License Verification
							</Label>
							<p class="text-sm text-muted-foreground">
								Please upload a clear copy of your current medical practicing license (PDF or
								Image). Our team will review this to approve your profile.
							</p>

							<div class="flex items-center gap-4 mt-2">
								<div class="flex-1">
									<Input
										type="file"
										accept=".pdf,image/*"
										onchange={handleLicenseUpload}
										class="hidden"
										id="license-upload"
									/>
									<Label
										for="license-upload"
										class="flex items-center justify-center gap-3 h-12 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:bg-primary/10 hover:border-primary transition-all group/upload"
									>
										{#if loading}
											<Loader2 class="w-5 h-5 animate-spin text-primary" />
											<span class="font-bold text-primary">Uploading...</span>
										{:else if form.licenseUrl}
											<CheckCircle2 class="w-5 h-5 text-green-500" />
											<span class="font-bold text-green-600">License Uploaded</span>
										{:else}
											<Plus
												class="w-5 h-5 text-primary group-hover/upload:scale-110 transition-transform"
											/>
											<span class="font-bold text-primary text-sm sm:text-base"
												>Upload License Document</span
											>
										{/if}
									</Label>
								</div>

								{#if form.licenseUrl}
									<a
										href={form.licenseUrl}
										target="_blank"
										class="px-4 h-12 flex items-center justify-center bg-background border-2 border-border/50 rounded-xl hover:bg-muted transition-all"
										title="View uploaded document"
									>
										<ArrowRight class="w-5 h-5 text-muted-foreground -rotate-45" />
									</a>
								{/if}
							</div>
						</div>

						<div class="flex justify-end pt-6">
							<Button
								onclick={nextStep}
								class="gap-3 shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
							>
								Continue
								<ArrowRight class="w-5 h-5 transition-transform group-hover:translate-x-1" />
							</Button>
						</div>
					</CardContent>
				</Card>
			{:else if step === 2}
				<Card
					class="border-border/40 shadow-2xl rounded-xl overflow-hidden bg-background/80 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-10"
				>
					<CardHeader
						class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-0 px-0 border-b border-border/40"
					>
						<CardTitle class="flex items-center gap-4 text-2xl sm:text-3xl font-bold">
							<div class="p-3 bg-primary/20 text-primary">
								<Building class="w-7 h-7" />
							</div>
							Banking Details
						</CardTitle>
						<CardDescription class="text-base"
							>We use this information to automate your earnings payouts via Paystack.</CardDescription
						>
					</CardHeader>
					<CardContent class="p-0 space-y-8">
						<div class="space-y-3">
							<Label class="font-bold text-sm tracking-wide ml-1 capitalize text-muted-foreground"
								>Select Your Bank</Label
							>
							<Combobox
								options={bankOptions}
								bind:value={form.bankCode}
								placeholder="Choose your bank..."
								searchPlaceholder="Search banks..."
								emptyMessage="No bank found."
								class="shadow-sm border-border/50  w-full"
							/>
							{#if fetchingBanks}
								<p class="text-xs text-primary flex items-center gap-2 mt-2 font-medium px-1">
									<Loader2 class="w-3.5 h-3.5 animate-spin" />
									Updating bank list from Paystack...
								</p>
							{/if}
						</div>

						<div class="space-y-3">
							<Label
								for="account"
								class="font-bold text-sm tracking-wide ml-1 capitalize text-muted-foreground"
								>Account Number</Label
							>
							<div class="flex flex-col sm:flex-row gap-4">
								<div class="relative flex-1 group">
									<CreditCard
										class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"
									/>
									<Input
										id="account"
										bind:value={form.accountNumber}
										maxlength={10}
										class="pl-12 border-border/50 bg-muted/20 focus:bg-background transition-all text-xl font-bold tracking-[0.2em]"
										placeholder="0123456789"
									/>
								</div>
								<Button
									variant="outline"
									class="px-8 font-bold bg-background border-primary/20 hover:bg-primary/5 hover:border-primary transition-all shadow-sm"
									onclick={validateAccount}
									disabled={loading || form.accountNumber.length !== 10}
								>
									{#if loading}
										<Loader2 class="w-5 h-5 animate-spin" />
									{:else}
										Verify Account
									{/if}
								</Button>
							</div>
						</div>

						{#if form.accountName}
							<div
								class="p-6 bg-green-500/5 border-2 border-green-500/20 flex flex-col sm:flex-row items-center gap-5 animate-in fade-in zoom-in-95 duration-500"
							>
								<div
									class="w-14 h-9 bg-green-500/10 flex items-center justify-center text-green-600"
								>
									<CheckCircle2 class="w-8 h-8" />
								</div>
								<div class="text-center sm:text-left">
									<p class="text-sm font-bold text-muted-foreground capitalize tracking-wider mb-1">
										Account Verified
									</p>
									<p class="text-2xl font-bold text-green-700 tracking-tight">
										{form.accountName}
									</p>
									<p class="text-base font-medium text-green-600/80">{form.bankName}</p>
								</div>
							</div>
						{/if}

						<div class="flex justify-between items-center pt-8">
							<Button
								variant="ghost"
								onclick={prevStep}
								class="px-8 font-bold gap-3 hover:bg-muted transition-all"
							>
								<ArrowLeft class="w-5 h-5" />
								Back
							</Button>
							<Button
								onclick={nextStep}
								class="gap-3 shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
								disabled={!form.accountName}
							>
								Legal Terms
								<ArrowRight class="w-5 h-5 transition-transform group-hover:translate-x-1" />
							</Button>
						</div>
					</CardContent>
				</Card>
			{:else if step === 3}
				<Card
					class="border-border/40 shadow-2xl overflow-hidden bg-background/80 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-10"
				>
					<CardHeader
						class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-0 px-0 border-b border-border/40"
					>
						<CardTitle class="flex items-center gap-4 text-2xl sm:text-3xl font-bold">
							<div class="p-3 bg-primary/20 text-primary">
								<ShieldCheck class="w-7 h-7" />
							</div>
							Practitioner Agreement
						</CardTitle>
						<CardDescription class="text-base"
							>Please review our professional guidelines and terms of service.</CardDescription
						>
					</CardHeader>
					<CardContent class="p-0 space-y-8">
						<div
							class="h-[350px] sm:h-[450px] overflow-y-auto p-6 sm:p-8 bg-muted/30 border border-border/40 text-base leading-relaxed space-y-6 prose-sm sm:prose-base dark:prose-invert"
						>
							<div class="space-y-4">
								<h3 class="text-xl font-bold text-primary">1. Professional Accountability</h3>
								<p>
									As a practitioner on Enoshkind, you maintain full clinical responsibility for your
									consultations. You agree to provide care that meets international medical
									standards.
								</p>
							</div>

							<div class="space-y-4">
								<h3 class="text-xl font-bold text-primary">2. Financial Terms</h3>
								<p>
									Consultation fees are split between the practitioner and the platform. Payouts are
									processed automatically to your verified bank account after session completion
									notes are submitted.
								</p>
							</div>

							<div class="space-y-4">
								<h3 class="text-xl font-bold text-primary">3. Privacy & Compliance</h3>
								<p>
									Patient data security is paramount. You agree to use our encrypted video and
									messaging channels for all patient interactions.
								</p>
							</div>

							<p class="text-center py-8 text-muted-foreground border-t border-border/20 italic">
								Scroll to bottom to continue
							</p>
						</div>

						<div
							class="p-6 bg-primary/5 border-2 border-primary/10 group cursor-pointer hover:border-primary/30 transition-all"
						>
							<label class="flex items-start gap-4 cursor-pointer">
								<div class="relative flex items-center mt-1">
									<input
										type="checkbox"
										id="legal"
										bind:checked={form.legalAccepted}
										class="peer w-6 h-6 border-2 border-primary/50 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer appearance-none transition-all checked:bg-primary"
									/>
									<CheckCircle2
										class="absolute inset-0 w-6 h-6 text-white scale-0 peer-checked:scale-75 transition-transform"
									/>
								</div>
								<div class="space-y-1">
									<p class="text-base sm: font-bold text-foreground">I Accept the Agreement</p>
									<p class="text-sm text-muted-foreground">
										I confirm that I am a licensed healthcare professional and agree to the terms
										above.
									</p>
								</div>
							</label>
						</div>

						<div class="flex justify-between items-center pt-6">
							<Button
								variant="ghost"
								onclick={prevStep}
								class="px-8 font-bold gap-3 hover:bg-muted transition-all"
							>
								<ArrowLeft class="w-5 h-5" />
								Back
							</Button>
							<Button
								onclick={nextStep}
								class="bg-primary shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 group"
								disabled={loading || !form.legalAccepted}
							>
								Next: Availability
								<ArrowRight class="w-5 h-5 transition-transform group-hover:translate-x-1" />
							</Button>
						</div>
					</CardContent>
				</Card>
			{:else if step === 4}
				<Card
					class="border-border/40 shadow-2xl overflow-hidden bg-background/80 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-10"
				>
					<CardHeader
						class="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-0 px-0 border-b border-border/40"
					>
						<CardTitle class="flex items-center gap-4 text-2xl sm:text-3xl font-bold">
							<div class="p-3 bg-primary/20 text-primary">
								<Clock class="w-7 h-7" />
							</div>
							Define Availability
						</CardTitle>
						<CardDescription class="text-base"
							>Set your preferred consultation hours for each day of the week.</CardDescription
						>
					</CardHeader>
					<CardContent class="p-0 space-y-8">
						<div class="grid gap-6 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
							{#each days as day, i}
								<div
									class="p-5 sm:p-6 border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors space-y-4"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3">
											<div class="w-1.5 h-6 bg-primary rounded-full"></div>
											<p class="font-bold tracking-tight capitalize text-primary/80">
												{day}
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											class="bg-background border-primary/20 text-primary hover:bg-primary hover:text-white font-bold gap-2 transition-all shadow-sm"
											onclick={() =>
												(form.availability = [
													...form.availability,
													{ dayOfWeek: i, startTime: '09:00', endTime: '17:00' }
												])}
										>
											<Plus class="w-4 h-4" />
											Add Slot
										</Button>
									</div>

									<div class="space-y-3">
										{#each form.availability as slot, idx}
											{#if slot.dayOfWeek === i}
												<div
													class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300"
												>
													<div
														class="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 bg-background border-2 border-border/40 p-3 sm:p-4 shadow-inner group-focus-within:border-primary/50 transition-all"
													>
														<div class="flex items-center gap-3 w-full sm:w-auto justify-center">
															<Clock class="w-4 h-4 text-muted-foreground shrink-0" />
															<input
																type="time"
																bind:value={slot.startTime}
																class="bg-transparent border-none outline-none font-bold text-center cursor-pointer w-full sm:w-auto"
															/>
														</div>
														<div
															class="w-8 h-0.5 sm:w-4 sm:h-0.5 bg-muted-foreground/30 rounded-full shrink-0 my-1 sm:my-0"
														></div>
														<div class="flex items-center gap-3 w-full sm:w-auto justify-center">
															<Clock class="w-4 h-4 text-muted-foreground shrink-0 sm:hidden" />
															<input
																type="time"
																bind:value={slot.endTime}
																class="bg-transparent border-none outline-none font-bold text-center cursor-pointer w-full sm:w-auto"
															/>
														</div>
													</div>
													<Button
														variant="ghost"
														size="icon"
														class="w-full sm:w-14 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
														onclick={() =>
															(form.availability = form.availability.filter(
																(_, sIdx) => sIdx !== idx
															))}
													>
														<Trash2 class="w-5 h-5" />
													</Button>
												</div>
											{/if}
										{:else}
											<div
												class="text-center py-4 text-muted-foreground/60 text-sm font-medium italic border-2 border-dashed border-border/20"
											>
												No slots added. You'll be unavailable on this day.
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>

						<div
							class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border/40"
						>
							<Button
								variant="ghost"
								onclick={prevStep}
								class="w-full sm:w-auto px-8 font-bold gap-3 hover:bg-muted transition-all"
							>
								<ArrowLeft class="w-5 h-5" />
								Back
							</Button>
							<Button
								onclick={handleSubmit}
								class="w-full sm:w-auto bg-primary shadow-2xl shadow-primary/40 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all gap-4 group"
								disabled={loading}
							>
								{#if loading}
									<Loader2 class="w-6 h-6 animate-spin" />
									Processing Registration...
								{:else}
									Complete Onboarding
									<CheckCircle2 class="w-6 h-6 transition-transform group-hover:scale-110" />
								{/if}
							</Button>
						</div>
					</CardContent>
				</Card>
			{/if}
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: hsl(var(--muted-foreground) / 0.2);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground) / 0.4);
	}
</style>
