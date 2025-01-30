import { writable } from "svelte/store";
import type { LoginImageType } from "../types";

// export const layoutImage = writable<LoginImageType | undefined>(undefined);

// type LayoutStoreType = {
//   showLayout: boolean;
//   showBookmark: boolean;
// };

// export const updateLayoutStore = (data: LayoutStoreType) => {
//   layoutStore.update((u) => data);
// };

export const showLayout = writable<boolean>(false);
