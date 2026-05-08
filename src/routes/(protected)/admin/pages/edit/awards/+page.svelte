<script lang="ts">
  import type { PageProps } from "./$types";
  import { deserialize } from "$app/forms";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import * as Drawer from "$lib/components/ui/drawer";
  import { toast } from "svelte-sonner";
  import { untrack } from "svelte";
  import { resizeImage } from "$lib/authentication/imageresize";
  import {
    Trophy,
    LayoutDashboard,
    Sparkles,
    Globe,
    Users,
    User,
    Award,
    Plus,
    Trash2,
    ImageIcon,
    Upload,
    Loader2,
    MoveUp,
    MoveDown,
    Search,
    Filter,
    Calendar,
    Edit2,
    X,
    Check,
    ChevronsUpDown,
    Timer,
    GripVertical,
  } from "@lucide/svelte";
  import { dndzone, type DndEvent } from "svelte-dnd-action";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { cn } from "$lib/utils";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { invalidateAll } from "$app/navigation";
  import ColorPicker from "$lib/components/ui/picker/ColorPicker.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "$lib/components/ui/card";
  import IconPicker from "$lib/components/ui/picker/IconPicker.svelte";

  let { data = $bindable() }: PageProps = $props();

  let isSubmitting = $state(false);
  let isUploadingOg = $state(false);
  let uploadingSlideIndex = $state<number | null>(null);
  let uploadingJuryImage = $state(false);
  let deletingJuryImage = $state(false);
  let uploadingWinnerImage = $state(false);
  let deletingWinnerImage = $state(false);
  let isSavingPartner = $state(false);
  let uploadingTeamImage = $state(false);
  let deletingTeamImage = $state(false);

  // Responsive: detect mobile for Dialog vs Drawer
  let innerWidth = $state(0);
  let isMobile = $derived(innerWidth < 768);

  // Jury image upload state (instant upload, not part of form submission)
  let juryImageUrl = $state("");
  let juryImageId = $state("");
  let winnerImageUrl = $state("");
  let winnerImageId = $state("");
  let teamImageUrl = $state("");
  let teamImageId = $state("");

  // Jury infinite scroll setup
  let jurySearchTerm = $state("");
  let juryYearFilter = $state(data.recentYear || "2024");

  const juryQuery = infiniteScroll.listQuery<any>(
    () => ({ search: jurySearchTerm, year: juryYearFilter }),
    "",
    "admin/awards/jury",
  );

  let winnerSearchTerm = $state("");
  let winnerYearFilter = $state(data.recentWinnerYear || "2024");

  const winnerQuery = infiniteScroll.listQuery<any>(
    () => ({ search: winnerSearchTerm, year: winnerYearFilter }),
    "",
    "admin/awards/winners",
  );

  let teamSearchTerm = $state("");
  let teamYearFilter = $state(data.recentTeamYear || "2024");
  const teamQuery = infiniteScroll.listQuery<any>(
    () => ({ search: teamSearchTerm, year: teamYearFilter }),
    "",
    "admin/awards/team",
  );

  // Reordering local state
  let winnersList = $state<any[]>([]);
  let teamList = $state<any[]>([]);

  $effect(() => {
    if ($winnerQuery.data?.results) {
      winnersList = [...$winnerQuery.data.results];
    }
  });

  $effect(() => {
    if ($teamQuery.data?.results) {
      teamList = [...$teamQuery.data.results];
    }
  });

  function handleWinnersDndConsider(e: CustomEvent<DndEvent<any>>) {
    winnersList = e.detail.items;
  }

  async function handleWinnersDndFinalize(e: CustomEvent<DndEvent<any>>) {
    winnersList = e.detail.items;
    const ids = winnersList.map((item) => item.id);
    const formData = new FormData();
    formData.append("ids", JSON.stringify(ids));
    try {
      const response = await fetch("?/reorderWinners", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Winners order updated");
      }
    } catch (err) {
      toast.error("Failed to save winners order");
    }
  }

  function handleTeamDndConsider(e: CustomEvent<DndEvent<any>>) {
    teamList = e.detail.items;
  }

  async function handleTeamDndFinalize(e: CustomEvent<DndEvent<any>>) {
    teamList = e.detail.items;
    const ids = teamList.map((item) => item.id);
    const formData = new FormData();
    formData.append("ids", JSON.stringify(ids));
    try {
      const response = await fetch("?/reorderTeam", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Team order updated");
      }
    } catch (err) {
      toast.error("Failed to save team order");
    }
  }

  // Initialize state
  let pageTitle = $state("Awards - CIO Club Africa");
  let pageDescription = $state("The CIO & C-Suite Awards Africa");
  let ogImage = $state("");

  let content = $state({
    hero: [] as any[], // Array of slides
    features: [] as any[],
    nominationPeriod: { startDate: "", endDate: "" },
  });

  // Available years for jury filter
  const juryYears = $derived(
    data.availableYears?.length > 0
      ? data.availableYears
      : [new Date().getFullYear().toString()],
  );

  const juryYearOptions = $derived(
    juryYears.map((y: string) => ({ label: y, value: y })),
  );

  const winnerYears = $derived(
    data.availableWinnerYears?.length > 0
      ? data.availableWinnerYears
      : [new Date().getFullYear().toString()],
  );

  const winnerYearOptions = $derived(
    winnerYears.map((y: string) => ({ label: y, value: y })),
  );

  const teamYears = $derived(
    data.availableTeamYears?.length > 0
      ? data.availableTeamYears
      : [new Date().getFullYear().toString()],
  );

  const teamYearOptions = $derived(
    teamYears.map((y: string) => ({ label: y, value: y })),
  );

  const defaultSlide = {
    subtitle: "Continental Excellence 2024",
    title: "New Award Slide",
    description: "Awards description text...",
    desktopImage: "",
    mobileImage: "",
    primaryCta: { text: "Enter Now", href: "/awards/entry" },
    secondaryCta: { text: "Learn More", href: "/awards/about" },
  };

  const defaultFeature = {
    title: "Sector-Based Excellence",
    desc: "Recognizing transformation...",
    iconName: "Award",
  };

  // Sync data from server
  $effect(() => {
    const meta = data.meta;
    if (meta) {
      untrack(() => {
        pageTitle = meta.title || "Awards - CIO Club Africa";
        pageDescription = meta.description || "The CIO & C-Suite Awards Africa";
        ogImage = meta.ogImage || "";
      });
    }
    if (data.content) {
      untrack(() => {
        content = {
          hero: data.content.hero || [],
          features: data.content.features || [],
          nominationPeriod: data.content.nominationPeriod || {
            startDate: "",
            endDate: "",
          },
        };
      });
    }
  });

  async function handleSave() {
    isSubmitting = true;
    const formData = new FormData();
    formData.append("data", JSON.stringify(content));
    formData.append("title", pageTitle);
    formData.append("description", pageDescription);
    formData.append("ogImage", ogImage);

    try {
      const response = await fetch("?/save", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        toast.success("Awards page content saved successfully");
        await invalidateAll();
      } else {
        toast.error("Failed to save content");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      isSubmitting = false;
    }
  }

  async function onImageUpload(
    e: Event,
    type: "og" | "slide" = "og",
    index: number | null = null,
  ) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (type === "og") isUploadingOg = true;
    else uploadingSlideIndex = index;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSizeKB: 200,
        format: "webp",
      });

      const formData = new FormData();
      formData.append("image", resizedFile);

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success" && result.data?.image) {
        if (type === "og") {
          ogImage = result.data.image.url;
        } else if (index !== null) {
          content.hero[index].desktopImage = result.data.image.url;
          content.hero[index].mobileImage = result.data.image.url;
        }
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process image");
    } finally {
      isUploadingOg = false;
      uploadingSlideIndex = null;
      input.value = "";
    }
  }

  function addItem(type: "hero" | "features") {
    if (type === "hero") {
      content.hero = [...content.hero, { ...defaultSlide }];
    } else {
      content.features = [...content.features, { ...defaultFeature }];
    }
  }

  function removeItem(type: "hero" | "features", index: number) {
    if (type === "hero") {
      content.hero = content.hero.filter((_, i) => i !== index);
    } else {
      content.features = content.features.filter((_, i) => i !== index);
    }
  }

  function moveItem(
    type: "hero" | "features",
    index: number,
    direction: "up" | "down",
  ) {
    const list = type === "hero" ? [...content.hero] : [...content.features];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;

    [list[index], list[newIndex]] = [list[newIndex], list[index]];

    if (type === "hero") content.hero = list;
    else content.features = list;
  }

  const jumpLinks = [
    { id: "seo", label: "SEO", icon: Sparkles },
    { id: "nomination-period", label: "Nomination Period", icon: Timer },
    { id: "hero", label: "Hero Carousel", icon: LayoutDashboard },
    { id: "features", label: "Page Features", icon: Award },
    { id: "jury", label: "Awards Jury", icon: Users },
    { id: "team", label: "Project Team", icon: Users },
    { id: "winners", label: "Award Winners", icon: Trophy },
    { id: "sponsors", label: "Partners & Sponsors", icon: Users },
  ];

  // Infinite Scroll Trigger
  let observerNode: HTMLElement | null = $state(null);
  $effect(() => {
    if (!observerNode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if ($juryQuery.hasNextPage) $juryQuery.fetchNextPage();
          if ($winnerQuery.hasNextPage) $winnerQuery.fetchNextPage();
          if ($teamQuery.hasNextPage) $teamQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(observerNode);
    return () => observer.disconnect();
  });

  let uploadingPartnerLogoIndex = $state<number | "new" | null>(null);

  async function onPartnerLogoUpload(e: Event, index: number | null) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    uploadingPartnerLogoIndex = index === null ? "new" : index;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: 800,
        maxHeight: 400,
        quality: 0.8,
        maxSizeKB: 200,
        format: "webp",
      });

      const formData = new FormData();
      formData.append("image", resizedFile);

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success" && result.data?.image) {
        if (index === null) {
          // If replacing a logo in the "Add New Partner" form, delete the old one
          if (newPartner.logoId) {
            const delFormData = new FormData();
            delFormData.append("fileId", newPartner.logoId);
            await fetch("?/deleteFile", { method: "POST", body: delFormData });
          }
          newPartner.logoUrl = result.data.image.url;
          newPartner.logoId = result.data.image.id;
        } else if (data?.partners) {
          const partner = data.partners[index];
          if (partner) {
            // If replacing a logo on an existing partner, delete the old one
            if (partner.logoId) {
              const delFormData = new FormData();
              delFormData.append("fileId", partner.logoId);
              await fetch("?/deleteFile", {
                method: "POST",
                body: delFormData,
              });
            }
            if (!partner.logo) {
              partner.logo = { url: result.data.image.url } as any;
            } else {
              (partner.logo as any).url = result.data.image.url;
            }
            partner.logoId = result.data.image.id;
          }
        }
        toast.success("Logo uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process logo");
    } finally {
      uploadingPartnerLogoIndex = null;
      input.value = "";
    }
  }

  let newPartner = $state({
    name: "",
    type: "",
    logoId: "",
    logoUrl: "",
    websiteUrl: "",
    displayOrder: 0,
  });

  async function handleSavePartner(partnerData: any) {
    const formData = new FormData();
    if (partnerData.id) formData.append("id", partnerData.id);
    formData.append("name", partnerData.name);
    formData.append("type", partnerData.type || "");
    formData.append("logoId", partnerData.logoId);
    formData.append("websiteUrl", partnerData.websiteUrl || "");
    formData.append("displayOrder", partnerData.displayOrder.toString());

    isSavingPartner = true;
    try {
      const response = await fetch("?/savePartner", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Partner saved successfully");
        if (!partnerData.id) {
          newPartner = {
            name: "",
            type: "",
            logoId: "",
            logoUrl: "",
            websiteUrl: "",
            displayOrder: 0,
          };
        }
        await invalidateAll();
      } else {
        toast.error("Failed to save partner");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isSavingPartner = false;
    }
  }

  async function handleDeletePartner(id: string) {
    if (!confirm("Are you sure you want to delete this partner?")) return;

    const formData = new FormData();
    formData.append("id", id);

    try {
      const response = await fetch("?/deletePartner", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Partner deleted");
        await invalidateAll();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  // --- Jury Actions ---
  let juryMemberToEdit = $state<any>(null);
  let isJuryModalOpen = $state(false);

  function openJuryModal(member: any = null) {
    juryMemberToEdit = member;
    juryImageUrl = member?.image?.url || "";
    juryImageId = member?.imageId || "";
    isJuryModalOpen = true;
  }

  function closeJuryModal() {
    isJuryModalOpen = false;
    juryMemberToEdit = null;
    juryImageUrl = "";
    juryImageId = "";
  }

  async function onJuryImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    uploadingJuryImage = true;

    try {
      // Client-side resize to < 200kb
      const resizedFile = await resizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        maxSizeKB: 200,
        format: "webp",
      });

      const formData = new FormData();
      formData.append("image", resizedFile);

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success" && result.data?.image) {
        // If replacing an existing image, delete the old one
        if (juryImageId) {
          await handleDeleteJuryImage(false);
        }
        juryImageUrl = result.data.image.url;
        juryImageId = result.data.image.id;
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Jury image upload error:", error);
      toast.error("Failed to process image");
    } finally {
      uploadingJuryImage = false;
      input.value = "";
    }
  }

  async function handleDeleteJuryImage(showToast = true) {
    if (!juryImageId) return;
    deletingJuryImage = true;
    try {
      // Delete from MinIO + file table via server
      const formData = new FormData();
      formData.append("fileId", juryImageId);
      await fetch("?/deleteFile", { method: "POST", body: formData });
      juryImageUrl = "";
      juryImageId = "";
      if (showToast) toast.success("Image removed");
    } catch (error) {
      console.error("Delete image error:", error);
      if (showToast) toast.error("Failed to remove image");
    } finally {
      deletingJuryImage = false;
    }
  }

  async function handleSaveJury(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    // Override imageId with our tracked state (from instant upload)
    formData.set("imageId", juryImageId);
    // Remove file input since upload is already done
    formData.delete("image");

    isSubmitting = true;
    try {
      const response = await fetch("?/saveJury", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Jury member saved");
        closeJuryModal();
        await invalidateAll();
        $juryQuery.refetch();
      } else {
        toast.error(result.data?.error || "Failed to save jury member");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteJury(id: string) {
    if (!confirm("Are you sure you want to delete this jury member?")) return;
    const formData = new FormData();
    formData.append("id", id);
    try {
      const response = await fetch("?/deleteJury", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Jury member deleted");
        await invalidateAll();
        $juryQuery.refetch();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  // --- Winner Actions ---
  let winnerToEdit = $state<any>(null);
  let isWinnerModalOpen = $state(false);

  function openWinnerModal(winner: any = null) {
    winnerToEdit = winner;
    winnerImageUrl = winner?.image?.url || "";
    winnerImageId = winner?.imageId || "";
    isWinnerModalOpen = true;
  }

  function closeWinnerModal() {
    isWinnerModalOpen = false;
    winnerToEdit = null;
    winnerImageUrl = "";
    winnerImageId = "";
  }

  async function onWinnerImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    uploadingWinnerImage = true;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        maxSizeKB: 200,
        format: "webp",
      });

      const formData = new FormData();
      formData.append("image", resizedFile);

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success" && result.data?.image) {
        if (winnerImageId) {
          await handleDeleteWinnerImage(false);
        }
        winnerImageUrl = result.data.image.url;
        winnerImageId = result.data.image.id;
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Winner image upload error:", error);
      toast.error("Failed to process image");
    } finally {
      uploadingWinnerImage = false;
      input.value = "";
    }
  }

  async function handleDeleteWinnerImage(showToast = true) {
    if (!winnerImageId) return;
    deletingWinnerImage = true;
    try {
      const formData = new FormData();
      formData.append("fileId", winnerImageId);
      await fetch("?/deleteFile", { method: "POST", body: formData });
      winnerImageUrl = "";
      winnerImageId = "";
      if (showToast) toast.success("Image removed");
    } catch (error) {
      console.error("Delete image error:", error);
      if (showToast) toast.error("Failed to remove image");
    } finally {
      deletingWinnerImage = false;
    }
  }

  async function handleSaveWinner(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.set("imageId", winnerImageId);
    formData.delete("image");

    isSubmitting = true;
    try {
      const response = await fetch("?/saveWinner", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Award winner saved");
        closeWinnerModal();
        await invalidateAll();
        $winnerQuery.refetch();
      } else {
        toast.error(result.data?.error || "Failed to save award winner");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteWinner(id: string) {
    if (!confirm("Are you sure you want to delete this winner?")) return;
    const formData = new FormData();
    formData.append("id", id);
    try {
      const response = await fetch("?/deleteWinner", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Winner deleted");
        await invalidateAll();
        $winnerQuery.refetch();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  // --- Team Actions ---
  let teamMemberToEdit = $state<any>(null);
  let isTeamModalOpen = $state(false);

  function openTeamModal(member: any = null) {
    teamMemberToEdit = member;
    teamImageUrl = member?.image?.url || "";
    teamImageId = member?.imageId || "";
    isTeamModalOpen = true;
  }

  function closeTeamModal() {
    isTeamModalOpen = false;
    teamMemberToEdit = null;
    teamImageUrl = "";
    teamImageId = "";
  }

  async function onTeamImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    uploadingTeamImage = true;

    try {
      const resizedFile = await resizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        maxSizeKB: 200,
        format: "webp",
      });

      const formData = new FormData();
      formData.append("image", resizedFile);

      const response = await fetch("?/uploadImage", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text()) as any;

      if (result.type === "success" && result.data?.image) {
        if (teamImageId) {
          await handleDeleteTeamImage(false);
        }
        teamImageUrl = result.data.image.url;
        teamImageId = result.data.image.id;
        toast.success("Image uploaded");
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Team image upload error:", error);
      toast.error("Failed to process image");
    } finally {
      uploadingTeamImage = false;
      input.value = "";
    }
  }

  async function handleDeleteTeamImage(showToast = true) {
    if (!teamImageId) return;
    deletingTeamImage = true;
    try {
      const formData = new FormData();
      formData.append("fileId", teamImageId);
      await fetch("?/deleteFile", { method: "POST", body: formData });
      teamImageUrl = "";
      teamImageId = "";
      if (showToast) toast.success("Image removed");
    } catch (error) {
      console.error("Delete image error:", error);
      if (showToast) toast.error("Failed to remove image");
    } finally {
      deletingTeamImage = false;
    }
  }

  async function handleSaveTeam(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.set("imageId", teamImageId);
    formData.delete("image");

    isSubmitting = true;
    try {
      const response = await fetch("?/saveTeam", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Team member saved");
        closeTeamModal();
        await invalidateAll();
        $teamQuery.refetch();
      } else {
        toast.error(result.data?.error || "Failed to save team member");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteTeam(id: string) {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    const formData = new FormData();
    formData.append("id", id);
    try {
      const response = await fetch("?/deleteTeam", {
        method: "POST",
        body: formData,
      });
      const result = deserialize(await response.text()) as any;
      if (result.type === "success") {
        toast.success("Team member deleted");
        await invalidateAll();
        $teamQuery.refetch();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }
</script>

<svelte:window bind:innerWidth />

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader title="Edit Awards Page" {isSubmitting} onSave={handleSave} />

  <EditorJumpLinks links={jumpLinks} />

  <div class="space-y-4">
    <SEOSection
      bind:title={pageTitle}
      bind:description={pageDescription}
      bind:ogImage
      {isUploadingOg}
      {onImageUpload}
    />

    <Separator class="bg-border/40" />

    <!-- Nomination Period Section -->
    <SectionWrapper
      id="nomination-period"
      title="Nomination Period"
      description="Set the start and end date/time for nominations and self-entries. Both /awards/nominate and /awards/entry will respect these dates."
      icon={Timer}
    >
      <div class="space-y-6">
        <div class="grid sm:grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Start Date & Time</Label
            >
            <Input
              type="datetime-local"
              bind:value={content.nominationPeriod.startDate}
            />
            {#if content.nominationPeriod.startDate}
              <p class="text-xs text-muted-foreground">
                {new Date(content.nominationPeriod.startDate).toLocaleString(
                  "en-GB",
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >End Date & Time</Label
            >
            <Input
              type="datetime-local"
              bind:value={content.nominationPeriod.endDate}
            />
            {#if content.nominationPeriod.endDate}
              <p class="text-xs text-muted-foreground">
                {new Date(content.nominationPeriod.endDate).toLocaleString(
                  "en-GB",
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            {/if}
          </div>
        </div>

        {#if content.nominationPeriod.startDate && content.nominationPeriod.endDate}
          {@const start = new Date(content.nominationPeriod.startDate)}
          {@const end = new Date(content.nominationPeriod.endDate)}
          {@const now = new Date()}
          {@const status =
            now < start ? "upcoming" : now <= end ? "active" : "closed"}
          <div class="p-4 rounded-lg border border-border/50 bg-card">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-foreground"
                >Current Status</span
              >
              <Badge
                variant={status === "active"
                  ? "default"
                  : status === "upcoming"
                    ? "secondary"
                    : "outline"}
                class="font-bold uppercase text-[10px] tracking-widest"
              >
                {status === "active"
                  ? "🟢 Active"
                  : status === "upcoming"
                    ? "🟡 Upcoming"
                    : "🔴 Closed"}
              </Badge>
            </div>
          </div>
        {:else}
          <div class="p-4 rounded-lg border border-border/50 bg-muted/30">
            <p class="text-sm text-muted-foreground">
              Set both start and end dates, then click <strong>Save Page</strong
              > to activate the nomination period.
            </p>
          </div>
        {/if}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Hero Carousel Section -->
    <SectionWrapper
      id="hero"
      title="Hero Carousel"
      description="Manage the slides for the auto-advancing awards hero"
      icon={LayoutDashboard}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => addItem("hero")}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Slide
        </Button>
      {/snippet}

      <div class="space-y-8">
        {#each content.hero as slide, i}
          <div
            class="relative group p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-md"
          >
            <!-- Controls -->
            <div class="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-full"
                onclick={() => moveItem("hero", i, "up")}
                disabled={i === 0}
              >
                <MoveUp class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-full"
                onclick={() => moveItem("hero", i, "down")}
                disabled={i === content.hero.length - 1}
              >
                <MoveDown class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                onclick={() => removeItem("hero", i)}
              >
                <Trash2 class="size-4" />
              </Button>
            </div>

            <div class="grid gap-8 lg:grid-cols-2">
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >Subtitle</Label
                  >
                  <Input
                    bind:value={slide.subtitle}
                    placeholder="Continental Excellence..."
                  />
                </div>
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >Title</Label
                  >
                  <Input
                    bind:value={slide.title}
                    placeholder="The CIO & C-Suite Awards Africa"
                  />
                </div>
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >Description</Label
                  >
                  <Textarea
                    bind:value={slide.description}
                    rows={3}
                    placeholder="Description..."
                  />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >Primary CTA Text</Label
                    >
                    <Input
                      bind:value={slide.primaryCta.text}
                      placeholder="Enter Now"
                    />
                  </div>
                  <div class="space-y-2">
                    <Label
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                      >URL</Label
                    >
                    <Input
                      bind:value={slide.primaryCta.href}
                      placeholder="/awards/entry"
                    />
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Slide Background Image</Label
                >
                <div
                  class="relative aspect-video rounded-xl overflow-hidden bg-muted border-2 border-dashed border-border group/img"
                >
                  {#if slide.desktopImage}
                    <img
                      src={slide.desktopImage}
                      alt="Slide Preview"
                      class="w-full h-full object-cover"
                    />
                    <div
                      class="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity"
                    >
                      <label class="cursor-pointer">
                        <div
                          class="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold text-sm shadow-xl"
                        >
                          <Upload class="size-4" /> Change Image
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          class="hidden"
                          onchange={(e) => onImageUpload(e, "slide", i)}
                        />
                      </label>
                    </div>
                  {:else}
                    <div
                      class="flex flex-col items-center justify-center h-full gap-2 text-center p-4"
                    >
                      <ImageIcon class="size-10 text-muted-foreground/40" />
                      <label class="cursor-pointer">
                        <div
                          class="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm shadow-lg hover:bg-primary/90 transition-all"
                        >
                          <Upload class="size-4" /> Upload Image
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          class="hidden"
                          onchange={(e) => onImageUpload(e, "slide", i)}
                        />
                      </label>
                    </div>
                  {/if}
                  {#if uploadingSlideIndex === i}
                    <div
                      class="absolute inset-0 bg-background/80 flex items-center justify-center"
                    >
                      <Loader2 class="size-8 animate-spin text-primary" />
                    </div>
                  {/if}
                </div>
                <Input
                  bind:value={slide.desktopImage}
                  placeholder="Or paste image URL..."
                  class="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Features Section -->
    <SectionWrapper
      id="features"
      title="Page Features"
      description="Icons and bullet points highlighting values"
      icon={Award}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => addItem("features")}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Feature
        </Button>
      {/snippet}

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each content.features as feature, i}
          <div
            class="relative p-6 rounded-xl border-2 border-border/40 bg-card hover:border-primary/30 transition-all shadow-sm"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 hover:bg-destructive/10 rounded-full"
              onclick={() => removeItem("features", i)}
            >
              <Trash2 class="size-4" />
            </Button>

            <div class="space-y-4">
              <div class="space-y-4">
                <IconPicker label="Icon" bind:value={feature.iconName} />
                <ColorPicker
                  label="Color Theme"
                  bind:value={feature.color}
                  mode="any"
                />
                <div class="space-y-2">
                  <Label
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >Title</Label
                  >
                  <Input
                    bind:value={feature.title}
                    placeholder="Feature Title"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >Description</Label
                >
                <Textarea
                  bind:value={feature.desc}
                  rows={2}
                  placeholder="Feature description..."
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
    </SectionWrapper>
    <Separator class="bg-border/40" />

    <!-- Awards Jury Section -->
    <SectionWrapper
      id="jury"
      title="Awards Jury"
      description="Manage the distinguished jury members"
      icon={Users}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => openJuryModal()}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Jury Member
        </Button>
      {/snippet}

      <div class="space-y-6">
        <!-- Search & Filter Bar -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              bind:value={jurySearchTerm}
              placeholder="Search jury members by name or role..."
              class="pl-10"
            />
          </div>
          <div class="flex items-center gap-2">
            <Calendar class="size-4 text-muted-foreground" />
            <SelectComponent
              name="year"
              placeholder="Filter by year"
              options={juryYearOptions}
              bind:value={juryYearFilter}
              class="w-[120px]"
            />
          </div>
        </div>

        <!-- Jury Members List -->
        <div
          class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {#if $juryQuery.data}
            {#each $juryQuery.data.results as member, i}
              <button
                onclick={() => openJuryModal(member)}
                class="group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex flex-col aspect-square w-full"
              >
                <!-- Image Section -->
                <div class="relative overflow-hidden bg-muted w-full h-full">
                  {#if member.image}
                    <img
                      src={member.image.url}
                      alt={member.name}
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  {:else}
                    <div
                      class="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5"
                    >
                      <User class="h-10 w-10 text-primary/40" />
                    </div>
                  {/if}

                  <!-- linear Overlay -->
                  <div
                    class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"
                  ></div>

                  <!-- Hover Action Buttons -->
                  <div
                    class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Button
                      variant="secondary"
                      size="icon"
                      class="size-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/40"
                      onclick={(e) => {
                        e.stopPropagation();
                        openJuryModal(member);
                      }}
                    >
                      <Edit2 class="size-4 text-white" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      class="size-8 rounded-lg"
                      onclick={(e) => {
                        e.stopPropagation();
                        handleDeleteJury(member.id);
                      }}
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </div>

                <!-- Content Overlay -->
                <div
                  class="absolute bottom-0 left-0 w-full p-3 pointer-events-none"
                >
                  <h3
                    class="font-bold leading-tight line-clamp-1 text-lg text-white"
                  >
                    {member.name}
                  </h3>
                  <div class="flex flex-col gap-1 mt-1">
                    <p class="text-[11px] font-medium text-white/70 line-clamp-1">
                      {member.occupation}
                    </p>
                  </div>
                </div>
              </button>
            {/each}
          {/if}
        </div>

        {#if $juryQuery.isFetchingNextPage}
          <div class="flex justify-center p-8">
            <Loader2 class="size-8 animate-spin text-primary" />
          </div>
        {:else if $juryQuery.hasNextPage}
          <div class="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onclick={() => $juryQuery.fetchNextPage()}
              class="gap-2"
            >
              Load More Jury
            </Button>
          </div>
        {/if}

        <!-- Infinite Scroll Trigger -->
        <div bind:this={observerNode} class="h-4"></div>
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Project Team Section -->
    <SectionWrapper
      id="team"
      title="Project Team"
      description="Manage the dedicated team behind the Awards"
      icon={Users}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => openTeamModal()}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Team Member
        </Button>
      {/snippet}

      <div class="space-y-6">
        <!-- Search Bar -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              bind:value={teamSearchTerm}
              placeholder="Search team members by name or title..."
              class="pl-10"
            />
          </div>
          <div class="flex items-center gap-2">
            <Calendar class="size-4 text-muted-foreground" />
            <SelectComponent
              name="year"
              placeholder="Filter by year"
              options={teamYearOptions}
              bind:value={teamYearFilter}
              class="w-[120px]"
            />
          </div>
        </div>

        <!-- Team Members List -->
        <div
          class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          use:dndzone={{
            items: teamList,
            flipDurationMs: 300,
          }}
          onconsider={handleTeamDndConsider}
          onfinalize={handleTeamDndFinalize}
        >
          {#each teamList as member, i (member.id)}
            <div class="relative group/card h-full">
              <button
                onclick={() => openTeamModal(member)}
                class="group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex flex-col aspect-square w-full"
              >
                <!-- Image Section -->
                <div class="relative overflow-hidden bg-muted w-full h-full">
                  {#if member.image}
                    <img
                      src={member.image.url}
                      alt={member.name}
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  {:else}
                    <div
                      class="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5"
                    >
                      <User class="h-10 w-10 text-primary/40" />
                    </div>
                  {/if}

                  <!-- Drag Handle (Desktop only) -->
                  <div
                    class="absolute top-2 left-2 size-8 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 items-center justify-center text-white cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-100 transition-opacity z-20 hidden md:flex"
                  >
                    <GripVertical class="size-4" />
                  </div>

                  <!-- linear Overlay -->
                  <div
                    class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"
                  ></div>

                  <!-- Hover Action Buttons -->
                  <div
                    class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                  >
                    <Button
                      variant="secondary"
                      size="icon"
                      class="size-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/40"
                      onclick={(e) => {
                        e.stopPropagation();
                        openTeamModal(member);
                      }}
                    >
                      <Edit2 class="size-4 text-white" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      class="size-8 rounded-lg"
                      onclick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(member.id);
                      }}
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </div>

                <!-- Content Overlay -->
                <div
                  class="absolute bottom-0 left-0 w-full p-3 pointer-events-none"
                >
                  <h3
                    class="font-bold leading-tight line-clamp-1 text-lg text-white"
                  >
                    {member.name}
                  </h3>
                  <p class="text-xs text-white/70 line-clamp-1 mt-1">
                    {member.title}
                  </p>
                </div>
              </button>
            </div>
          {/each}
        </div>

        {#if $teamQuery.isFetchingNextPage}
          <div class="flex justify-center p-8">
            <Loader2 class="size-8 animate-spin text-primary" />
          </div>
        {:else if $teamQuery.hasNextPage}
          <div class="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onclick={() => $teamQuery.fetchNextPage()}
              class="gap-2"
            >
              Load More Team
            </Button>
          </div>
        {/if}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- Award Winners Section -->
    <SectionWrapper
      id="winners"
      title="Award Winners"
      description="Manage the celebrated winners of the CIO Awards"
      icon={Trophy}
    >
      {#snippet headerAction()}
        <Button
          variant="outline"
          size="sm"
          onclick={() => openWinnerModal()}
          class="gap-2 rounded-lg text-primary"
        >
          <Plus class="size-4" /> Add Winner
        </Button>
      {/snippet}

      <div class="space-y-6">
        <!-- Search & Filter Bar -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              bind:value={winnerSearchTerm}
              placeholder="Search winners by name or category..."
              class="pl-10"
            />
          </div>
          <div class="flex items-center gap-2">
            <Calendar class="size-4 text-muted-foreground" />
            <SelectComponent
              name="year"
              placeholder="Filter by year"
              options={winnerYearOptions}
              bind:value={winnerYearFilter}
              class="w-[120px]"
            />
          </div>
        </div>

        <!-- Winners List -->
        <div
          class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          use:dndzone={{
            items: winnersList,
            flipDurationMs: 300,
          }}
          onconsider={handleWinnersDndConsider}
          onfinalize={handleWinnersDndFinalize}
        >
          {#each winnersList as winner, i (winner.id)}
            <div class="relative group/card h-full">
              <button
                onclick={() => openWinnerModal(winner)}
                class="group relative overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex flex-col aspect-square w-full"
              >
                <!-- Image Section -->
                <div class="relative overflow-hidden bg-muted w-full h-full">
                  {#if winner.image}
                    <img
                      src={winner.image.url}
                      alt={winner.name}
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  {:else}
                    <div
                      class="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5"
                    >
                      <User class="h-10 w-10 text-primary/40" />
                    </div>
                  {/if}

                  <!-- Drag Handle (Desktop only) -->
                  <div
                    class="absolute top-2 left-2 size-8 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 items-center justify-center text-white cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-100 transition-opacity z-20 hidden md:flex"
                  >
                    <GripVertical class="size-4" />
                  </div>

                  <!-- linear Overlay -->
                  <div
                    class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"
                  ></div>

                  <!-- Hover Action Buttons -->
                  <div
                    class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                  >
                    <Button
                      variant="secondary"
                      size="icon"
                      class="size-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/10 hover:bg-white/40"
                      onclick={(e) => {
                        e.stopPropagation();
                        openWinnerModal(winner);
                      }}
                    >
                      <Edit2 class="size-4 text-white" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      class="size-8 rounded-lg"
                      onclick={(e) => {
                        e.stopPropagation();
                        handleDeleteWinner(winner.id);
                      }}
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </div>

                <!-- Content Overlay -->
                <div
                  class="absolute bottom-0 left-0 w-full p-3 pointer-events-none"
                >
                  <h3
                    class="font-bold leading-tight line-clamp-1 text-lg text-white"
                  >
                    {winner.name}
                  </h3>
                  {#if winner.awardType?.toLowerCase().includes('special') || winner.awardType?.toLowerCase().includes('corporate')}
                    <p class="text-[11px] font-medium text-white/70 line-clamp-1 mt-0.5">
                      {winner.awardDescription || winner.organization}
                    </p>
                  {:else}
                    <div class="flex items-center gap-2 mt-1">
                      <span
                        class="text-xs font-medium text-white/90 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/10"
                      >
                        {winner.awardType}
                      </span>
                    </div>
                  {/if}
                </div>
              </button>
            </div>
          {/each}
        </div>

        {#if $winnerQuery.isFetchingNextPage}
          <div class="flex justify-center p-8">
            <Loader2 class="size-8 animate-spin text-primary" />
          </div>
        {:else if $winnerQuery.hasNextPage}
          <div class="flex justify-center pt-4">
            <Button
              variant="outline"
              size="sm"
              onclick={() => $winnerQuery.fetchNextPage()}
              class="gap-2"
            >
              Load More Winners
            </Button>
          </div>
        {/if}
      </div>
    </SectionWrapper>

    <Separator class="bg-border/40" />

    <!-- ... (Partners Section) ... -->
    <SectionWrapper
      id="sponsors"
      title="Partners & Sponsors"
      description="Manage the rotating partner logos displayed on the awards page"
      icon={Users}
    >
      <div class="space-y-8">
        <!-- Add New Partner -->
        <div
          class="p-6 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5"
        >
          <h5 class="text-sm font-bold mb-4 flex items-center gap-2">
            <Plus class="size-4" /> Add New Partner
          </h5>
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Name</Label
              >
              <Input bind:value={newPartner.name} placeholder="Partner Name" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Partner Type</Label
              >
              <Input
                bind:value={newPartner.type}
                placeholder="e.g. Strategic Partner"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Website URL</Label
              >
              <Input
                bind:value={newPartner.websiteUrl}
                placeholder="https://..."
              />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground"
                >Logo</Label
              >
              <div class="flex items-center gap-4">
                <div
                  class="size-12 rounded-lg bg-background border flex items-center justify-center overflow-hidden shrink-0 relative"
                >
                  {#if newPartner.logoUrl}
                    <img
                      src={newPartner.logoUrl}
                      alt="Preview"
                      class="w-full h-full object-contain p-1"
                    />
                  {:else}
                    <ImageIcon class="size-6 text-muted-foreground/40" />
                  {/if}
                  {#if uploadingPartnerLogoIndex === "new"}
                    <div
                      class="absolute inset-0 bg-background/80 flex items-center justify-center"
                    >
                      <Loader2 class="size-5 animate-spin text-primary" />
                    </div>
                  {/if}
                </div>
                <label class="cursor-pointer">
                  <div
                    class="px-3 py-1.5 bg-background border rounded-lg text-xs font-bold hover:bg-muted transition-colors"
                  >
                    Upload
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={(e) => onPartnerLogoUpload(e, null)}
                  />
                </label>
              </div>
            </div>
            <div class="flex items-end">
              <Button
                class="w-full gap-2 rounded-xl"
                disabled={!newPartner.name ||
                  !newPartner.logoId ||
                  isSavingPartner}
                onclick={() => handleSavePartner(newPartner)}
              >
                {#if isSavingPartner}
                  <Loader2 class="size-4 animate-spin mr-2" />
                {/if}
                Add Partner
              </Button>
            </div>
          </div>
        </div>

        <!-- Existing Partners -->
        <div class="grid gap-4">
          {#each data.partners as partner, i}
            <div
              class="flex items-center gap-6 p-4 rounded-xl border bg-card/50 shadow-sm group"
            >
              <div
                class="size-16 rounded-xl bg-background border flex items-center justify-center overflow-hidden shrink-0 p-2 relative"
              >
                {#if partner.logo}
                  <img
                    src={partner.logo.url}
                    alt={partner.name}
                    class="w-full h-full object-contain"
                  />
                {/if}
                <label
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <Upload class="size-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    onchange={(e) => onPartnerLogoUpload(e, i)}
                  />
                </label>
                {#if uploadingPartnerLogoIndex === i}
                  <div
                    class="absolute inset-0 bg-background/80 flex items-center justify-center"
                  >
                    <Loader2 class="size-5 animate-spin text-primary" />
                  </div>
                {/if}
              </div>

              <div class="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div class="space-y-1">
                  <Label
                    class="text-[10px] uppercase font-bold text-muted-foreground"
                    >Partner Name</Label
                  >
                  <Input bind:value={partner.name} class="h-8 text-sm" />
                </div>
                <div class="space-y-1">
                  <Label
                    class="text-[10px] uppercase font-bold text-muted-foreground"
                    >Website</Label
                  >
                  <Input bind:value={partner.websiteUrl} class="h-8 text-sm" />
                </div>
                <div class="space-y-1">
                  <Label
                    class="text-[10px] uppercase font-bold text-muted-foreground"
                    >Partner Type</Label
                  >
                  <Input bind:value={partner.type} class="h-8 text-sm" />
                </div>
                <div class="space-y-1">
                  <Label
                    class="text-[10px] uppercase font-bold text-muted-foreground"
                    >Order</Label
                  >
                  <Input
                    type="number"
                    bind:value={partner.displayOrder}
                    class="h-8 text-sm"
                  />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  class="h-8 w-8 rounded-lg"
                  onclick={() => handleSavePartner(partner)}
                  disabled={isSavingPartner}
                >
                  {#if isSavingPartner}
                    <Loader2 class="size-4 animate-spin" />
                  {:else}
                    <LayoutDashboard class="size-4" />
                  {/if}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                  onclick={() => handleDeletePartner(partner.id)}
                >
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </SectionWrapper>
  </div>
</div>

{#snippet juryFormContent()}
  <form onsubmit={handleSaveJury} class="p-6 md:p-8 space-y-6 bg-card">
    <input type="hidden" name="id" value={juryMemberToEdit?.id || ""} />
    <input type="hidden" name="imageId" value={juryImageId} />

    <div class="grid gap-6">
      <!-- Clickable Image Placeholder -->
      <div class="space-y-2">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Profile Image</Label
        >
        <div class="flex items-center gap-5">
          {#if juryImageUrl}
            <!-- Non-clickable preview when image exists -->
            <div
              class="relative size-24 rounded-2xl bg-muted border-2 border-border flex items-center justify-center overflow-hidden shrink-0 transition-all"
            >
              {#if deletingJuryImage}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center z-10"
                >
                  <Loader2 class="size-6 animate-spin text-primary" />
                </div>
              {/if}
              <img
                src={juryImageUrl}
                alt="Preview"
                class="w-full h-full object-cover pointer-events-none"
              />
            </div>
          {:else}
            <!-- Clickable uploader when no image -->
            <label
              class="relative size-24 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all group"
            >
              {#if uploadingJuryImage}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center z-10"
                >
                  <Loader2 class="size-6 animate-spin text-primary" />
                </div>
              {/if}
              <div class="flex flex-col items-center gap-1">
                <ImageIcon
                  class="size-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors"
                />
                <span class="text-[9px] text-muted-foreground font-medium"
                  >Click to upload</span
                >
              </div>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                onchange={onJuryImageUpload}
              />
            </label>
          {/if}
          <div class="space-y-1.5">
            {#if juryImageUrl}
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                disabled={deletingJuryImage}
                onclick={() => handleDeleteJuryImage()}
              >
                {#if deletingJuryImage}
                  <Loader2 class="size-3.5 animate-spin" /> Removing...
                {:else}
                  <X class="size-3.5" /> Remove
                {/if}
              </Button>
            {/if}
            <p class="text-[10px] text-muted-foreground leading-relaxed">
              Square image, max 200kb.<br />Auto-resized on upload.
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Full Name</Label
          >
          <Input
            name="name"
            value={juryMemberToEdit?.name || ""}
            placeholder="e.g. Ade Bajomo"
            required
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Year</Label
          >
          <Input
            name="year"
            value={juryMemberToEdit?.year || "2024"}
            placeholder="e.g. 2024"
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Role (Context)</Label
        >
        <Input
          name="role"
          value={juryMemberToEdit?.role || ""}
          placeholder="e.g. Chairman, Jury"
        />
      </div>

      <div class="space-y-2">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Occupation / Title</Label
        >
        <Textarea
          name="occupation"
          value={juryMemberToEdit?.occupation || ""}
          placeholder="e.g. Executive Director, IT & Operations, Access Bank PLC"
          rows={2}
          required
        />
      </div>
    </div>

    <div class="pt-4 flex gap-3">
      <Button
        variant="ghost"
        type="button"
        class="flex-1 rounded-xl"
        onclick={closeJuryModal}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        class="flex-1 rounded-xl shadow-lg shadow-primary/20"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <Loader2 class="size-4 animate-spin mr-2" /> Saving...
        {:else}
          Save Member Details
        {/if}
      </Button>
    </div>
  </form>
{/snippet}

{#snippet juryHeader()}
  <div
    class="bg-primary p-6 md:p-8 text-primary-foreground relative overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-linear(#ffffff11_1px,transparent_1px)] bg-size-[24px_24px] opacity-20"
    ></div>
    <h3 class="text-xl md:text-2xl font-bold tracking-tight relative">
      {juryMemberToEdit ? "Edit Jury Member" : "Add Jury Member"}
    </h3>
    <p class="text-primary-foreground/70 text-sm relative">
      Enter the details for the distinguished jury member. All fields except
      Role are required.
    </p>
  </div>
{/snippet}

<!-- Desktop: Dialog -->
{#if !isMobile}
  <Dialog.Root bind:open={isJuryModalOpen}>
    <Dialog.Content
      class="sm:max-w-xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl"
    >
      {@render juryHeader()}
      {@render juryFormContent()}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <!-- Mobile: Drawer -->
  <Drawer.Root bind:open={isJuryModalOpen}>
    <Drawer.Content class="max-h-[50vh]">
      <div class="overflow-y-auto max-h-[calc(50vh-2rem)]">
        {@render juryHeader()}
        {@render juryFormContent()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}

{#snippet winnerFormContent()}
  <form onsubmit={handleSaveWinner} class="p-6 md:p-8 space-y-6 bg-card">
    <input type="hidden" name="id" value={winnerToEdit?.id || ""} />
    <input type="hidden" name="imageId" value={winnerImageId} />

    <div class="grid gap-6">
      <!-- Clickable Image Placeholder -->
      <div class="space-y-2">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Award Winner Image</Label
        >
        <div class="flex items-center gap-5">
          {#if winnerImageUrl}
            <div
              class="relative size-24 rounded-2xl bg-muted border-2 border-border flex items-center justify-center overflow-hidden shrink-0 transition-all"
            >
              {#if deletingWinnerImage}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center z-10"
                >
                  <Loader2 class="size-6 animate-spin text-primary" />
                </div>
              {/if}
              <img
                src={winnerImageUrl}
                alt="Preview"
                class="w-full h-full object-cover pointer-events-none"
              />
            </div>
          {:else}
            <label
              class="relative size-24 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all group"
            >
              {#if uploadingWinnerImage}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center z-10"
                >
                  <Loader2 class="size-6 animate-spin text-primary" />
                </div>
              {/if}
              <div class="flex flex-col items-center gap-1">
                <ImageIcon
                  class="size-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors"
                />
                <span class="text-[9px] text-muted-foreground font-medium"
                  >Click to upload</span
                >
              </div>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                onchange={onWinnerImageUpload}
              />
            </label>
          {/if}
          <div class="space-y-1.5">
            {#if winnerImageUrl}
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                disabled={deletingWinnerImage}
                onclick={() => handleDeleteWinnerImage()}
              >
                {#if deletingWinnerImage}
                  <Loader2 class="size-3.5 animate-spin" /> Removing...
                {:else}
                  <X class="size-3.5" /> Remove
                {/if}
              </Button>
            {/if}
            <p class="text-[10px] text-muted-foreground leading-relaxed">
              Square image, max 200kb.<br />Auto-resized on upload.
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Full Name</Label
          >
          <Input
            name="name"
            value={winnerToEdit?.name || ""}
            placeholder="e.g. Olanrewaju Ibironke"
            required
          />
        </div>
        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Year</Label
          >
          <Input
            name="year"
            value={winnerToEdit?.year || "2024"}
            placeholder="e.g. 2024"
            required
          />
        </div>
      </div>

      <div class="space-y-2">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Award Category / Type</Label
        >
        <Input
          name="awardType"
          value={winnerToEdit?.awardType || ""}
          placeholder="e.g. CIO of the Year (Financial Services)"
          required
        />
      </div>

      <div class="space-y-2">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Award Description <span class="text-muted-foreground/50 normal-case tracking-normal font-normal">(Optional — for Special & Corporate Awards)</span></Label
        >
        <Textarea
          name="awardDescription"
          value={winnerToEdit?.awardDescription || ""}
          placeholder="e.g. Distinguished Leadership in Digital Innovation Award"
          rows={2}
        />
      </div>

      <div class="space-y-2">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Organization / Institute</Label
        >
        <Textarea
          name="organization"
          value={winnerToEdit?.organization || ""}
          placeholder="e.g. Executive Director, IT & Operations, Access Bank PLC"
          rows={2}
        />
      </div>
    </div>

    <div class="pt-4 flex gap-3">
      <Button
        variant="ghost"
        type="button"
        class="flex-1 rounded-xl"
        onclick={closeWinnerModal}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        class="flex-1 rounded-xl shadow-lg shadow-primary/20"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <Loader2 class="size-4 animate-spin mr-2" /> Saving...
        {:else}
          Save Winner Details
        {/if}
      </Button>
    </div>
  </form>
{/snippet}

{#snippet winnerHeader()}
  <div
    class="bg-primary p-6 md:p-8 text-primary-foreground relative overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-linear(#ffffff11_1px,transparent_1px)] bg-size-[24px_24px] opacity-20"
    ></div>
    <h3 class="text-xl md:text-2xl font-bold tracking-tight relative">
      {winnerToEdit ? "Edit Award Winner" : "Add Award Winner"}
    </h3>
    <p class="text-primary-foreground/70 text-sm relative">
      Enter the details for the award winner. All fields are required.
    </p>
  </div>
{/snippet}

<!-- Desktop: Dialog -->
{#if !isMobile}
  <Dialog.Root bind:open={isWinnerModalOpen}>
    <Dialog.Content
      class="sm:max-w-xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl"
    >
      {@render winnerHeader()}
      {@render winnerFormContent()}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <!-- Mobile: Drawer -->
  <Drawer.Root bind:open={isWinnerModalOpen}>
    <Drawer.Content class="max-h-[50vh]">
      <div class="overflow-y-auto max-h-[calc(50vh-2rem)]">
        {@render winnerHeader()}
        {@render winnerFormContent()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}

{#snippet teamFormContent()}
  <form onsubmit={handleSaveTeam} class="p-6 md:p-8 space-y-6 bg-card">
    <input type="hidden" name="id" value={teamMemberToEdit?.id || ""} />
    <input type="hidden" name="imageId" value={teamImageId} />

    <div class="grid gap-6">
      <!-- Clickable Image Placeholder -->
      <div class="space-y-2">
        <Label
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Team Member Image</Label
        >
        <div class="flex items-center gap-5">
          {#if teamImageUrl}
            <div
              class="relative size-24 rounded-2xl bg-muted border-2 border-border flex items-center justify-center overflow-hidden shrink-0 transition-all"
            >
              {#if deletingTeamImage}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center z-10"
                >
                  <Loader2 class="size-6 animate-spin text-primary" />
                </div>
              {/if}
              <img
                src={teamImageUrl}
                alt="Preview"
                class="w-full h-full object-cover pointer-events-none"
              />
            </div>
          {:else}
            <label
              class="relative size-24 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-all group"
            >
              {#if uploadingTeamImage}
                <div
                  class="absolute inset-0 bg-background/80 flex items-center justify-center z-10"
                >
                  <Loader2 class="size-6 animate-spin text-primary" />
                </div>
              {/if}
              <div class="flex flex-col items-center gap-1">
                <ImageIcon
                  class="size-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors"
                />
                <span class="text-[9px] text-muted-foreground font-medium"
                  >Click to upload</span
                >
              </div>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                onchange={onTeamImageUpload}
              />
            </label>
          {/if}
          <div class="space-y-1.5">
            {#if teamImageUrl}
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                disabled={deletingTeamImage}
                onclick={() => handleDeleteTeamImage()}
              >
                {#if deletingTeamImage}
                  <Loader2 class="size-3.5 animate-spin" /> Removing...
                {:else}
                  <X class="size-3.5" /> Remove
                {/if}
              </Button>
            {/if}
            <p class="text-[10px] text-muted-foreground leading-relaxed">
              Square image, max 200kb.<br />Auto-resized on upload.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Full Name</Label
            >
            <Input
              name="name"
              value={teamMemberToEdit?.name || ""}
              placeholder="e.g. Abiola Laseinde"
              required
            />
          </div>
          <div class="space-y-2">
            <Label
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >Year</Label
            >
            <Input
              name="year"
              value={teamMemberToEdit?.year || "2024"}
              placeholder="e.g. 2024"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >Job Title / Designation</Label
          >
          <Input
            name="title"
            value={teamMemberToEdit?.title || ""}
            placeholder="e.g. Chief Executive Officer"
            required
          />
        </div>
      </div>
    </div>

    <div class="pt-4 flex gap-3">
      <Button
        variant="ghost"
        type="button"
        class="flex-1 rounded-xl"
        onclick={closeTeamModal}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        class="flex-1 rounded-xl shadow-lg shadow-primary/20"
        disabled={isSubmitting}
      >
        {#if isSubmitting}
          <Loader2 class="size-4 animate-spin mr-2" /> Saving...
        {:else}
          Save Member Details
        {/if}
      </Button>
    </div>
  </form>
{/snippet}

{#snippet teamHeader()}
  <div
    class="bg-primary p-6 md:p-8 text-primary-foreground relative overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[radial-linear(#ffffff11_1px,transparent_1px)] bg-size-[24px_24px] opacity-20"
    ></div>
    <h3 class="text-xl md:text-2xl font-bold tracking-tight relative">
      {teamMemberToEdit ? "Edit Team Member" : "Add Team Member"}
    </h3>
    <p class="text-primary-foreground/70 text-sm relative">
      Enter the details for the Project Team member. All fields are required.
    </p>
  </div>
{/snippet}

<!-- Desktop: Dialog -->
{#if !isMobile}
  <Dialog.Root bind:open={isTeamModalOpen}>
    <Dialog.Content
      class="sm:max-w-xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl"
    >
      {@render teamHeader()}
      {@render teamFormContent()}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <!-- Mobile: Drawer -->
  <Drawer.Root bind:open={isTeamModalOpen}>
    <Drawer.Content class="max-h-[50vh]">
      <div class="overflow-y-auto max-h-[calc(50vh-2rem)]">
        {@render teamHeader()}
        {@render teamFormContent()}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}
