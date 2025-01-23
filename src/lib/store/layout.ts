import { writable } from "svelte/store";

// export const layoutStore = writable<LayoutStoreType>({
//   showLayout: false,
//   showBookmark: false,
// });

// type LayoutStoreType = {
//   showLayout: boolean;
//   showBookmark: boolean;
// };

// export const updateLayoutStore = (data: LayoutStoreType) => {
//   layoutStore.update((u) => data);
// };

export const showLayout = writable<boolean>(false);
