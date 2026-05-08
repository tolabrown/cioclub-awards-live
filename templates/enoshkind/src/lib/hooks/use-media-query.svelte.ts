import { MediaQuery } from "svelte/reactivity";
import { browser } from "$app/environment";

// We use a dummy object for SSR to avoid calling window.matchMedia at module evaluation time
const dummyMediaQuery = { current: false };

export const mediaQueries = browser ? {
  sm: new MediaQuery("min-width: 640px"),
  md: new MediaQuery("min-width: 768px"),
  lg: new MediaQuery("min-width: 1024px"),
  xl: new MediaQuery("min-width: 1280px"),
  "2xl": new MediaQuery("min-width: 1536px")
} : {
  sm: dummyMediaQuery,
  md: dummyMediaQuery,
  lg: dummyMediaQuery,
  xl: dummyMediaQuery,
  "2xl": dummyMediaQuery
} as unknown as Record<string, MediaQuery>;
