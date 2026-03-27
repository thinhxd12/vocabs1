import type {
  ArtImageType,
  ImageBackgroundType,
  LayoutSettingType,
  UserType,
} from "$lib/types";
import { get, writable } from "svelte/store";
import { page } from "$app/state";
import mainImage from "$lib/assets/images/main-image.webp";
import mainAuthor from "$lib/assets/images/main-author.webp";
import icescape from "$lib/assets/images/Icescape.jpg";
import {
  currentLocationId,
  focusMinutes,
  intervals,
  locationList,
  longbreakMinutes,
  shortbreakMinutes,
  yearProgressList,
} from "./layoutstore";

const browser =
  typeof window !== "undefined" && typeof document !== "undefined";
export const IMAGES_LENGTH = 9;
const LAYOUT_STORAGE = "layout-images";
const LAYOUT_INDEX = "layout-index";
const LAYOUT_API = "layout-api";
export const LAYOUT_SETTING = "layout-setting";
const defaultImage: ImageBackgroundType = {
  title: "Stunning Icelandic region of volcanoes, beaches, and glaciers.",
  url: icescape,
  place: "Snæfellsnes peninsula, Iceland",
};

export function serialize(value: any): string {
  return JSON.stringify(value);
}

export function deserialize(item: string) {
  return JSON.parse(item);
}

export const currentImageIndex = writable<number>(0);
export const localImageStore = writable<{
  loading: boolean;
  data: ImageBackgroundType[];
}>({
  loading: false,
  data: [],
});

export const layoutSetting = writable<LayoutSettingType>({
  showImage: true,
  showVideo: false,
});

export const layoutApi = writable<string>("getlayoutimagev3");

//----------------LAYOUT IMAGE-----------------//

export function setGetLayouImageApi(url: string) {
  layoutApi.set(url);
  localStorage.setItem(LAYOUT_API, url);
}

export function getCurrentImageBackground() {
  if (!browser) return;
  const api = localStorage.getItem(LAYOUT_API);
  const index = localStorage.getItem(LAYOUT_INDEX);
  const images = localStorage.getItem(LAYOUT_STORAGE);
  const settings = localStorage.getItem(LAYOUT_SETTING);
  if (api) layoutApi.set(api);
  if (index) currentImageIndex.set(Number(index));
  if (images)
    localImageStore.set({ loading: false, data: deserialize(images) });
  else {
    localImageStore.set({ loading: false, data: [defaultImage] });
  }
  if (settings) {
    layoutSetting.set(deserialize(settings));
  }
}

export async function getNextImageBackground() {
  if (!browser) return;
  const images = get(localImageStore);
  const index = get(currentImageIndex);
  const api = get(layoutApi);

  if (images.data.length < IMAGES_LENGTH && index === images.data.length - 1) {
    localImageStore.update((s) => ({ ...s, loading: true }));
    const response = await fetch(`/server/${api}`);
    if (response.status == 200) {
      const json = await response.json();
      localImageStore.update((s) => {
        const data = [...s.data, json];
        localStorage.setItem(LAYOUT_STORAGE, serialize(data));
        return { loading: false, data };
      });
      currentImageIndex.update((n) => {
        const newIndex = (n + 1) % IMAGES_LENGTH;
        localStorage.setItem(LAYOUT_INDEX, String(newIndex));
        return newIndex;
      });
    }
  } else if (
    images.data.length === IMAGES_LENGTH &&
    index === IMAGES_LENGTH - 1
  ) {
    localImageStore.update((s) => ({ ...s, loading: true }));
    const response = await fetch(`/server/${api}`);
    if (response.status == 200) {
      const json = await response.json();
      localImageStore.update((s) => {
        const data = [...s.data.slice(1), json];
        localStorage.setItem(LAYOUT_STORAGE, serialize(data));
        return { loading: false, data };
      });
    }
  } else if (images.data.length === 0) {
    localImageStore.update((s) => ({ ...s, loading: true }));
    const response = await fetch(`/server/${api}`);
    if (response.status == 200) {
      const json = await response.json();
      localImageStore.update((s) => {
        const data = [...s.data, json];
        localStorage.setItem(LAYOUT_STORAGE, serialize(data));
        return { loading: false, data };
      });
      currentImageIndex.set(0);
      localStorage.setItem(LAYOUT_INDEX, String(0));
    }
  } else {
    currentImageIndex.update((n) => {
      const newIndex = (n + 1) % IMAGES_LENGTH;
      localStorage.setItem(LAYOUT_INDEX, String(newIndex));
      return newIndex;
    });
  }
}

export async function getPrevImageBackground() {
  if (!browser) return;
  const images = get(localImageStore);

  currentImageIndex.update((n) => {
    let newIndex = (n - 1) % images.data.length;
    newIndex = newIndex < 0 ? 0 : newIndex;
    localStorage.setItem(LAYOUT_INDEX, String(newIndex));
    return newIndex;
  });
}

//--------------ART-------------------//

const defaultArtImage: ArtImageType = {
  mainImage: mainImage,
  shareDate: "01 July 2023",
  title: "The Red Buoy, Saint-Tropez",
  attr: "Oil on canvas • 81 × 65 cm",
  authorImage: mainAuthor,
  author: "Paul Signac",
  authorYears: "1895",
  content:
    "<p>Hello July!</p> <p>Time for an artist who in my opinion, created one of the best images of Summer ... the French Pointillist, Paul Signac!</p> <p>Signac was a painter and an avid sailor. He created several marine paintings, including a series of views over the port of Saint-Tropez, where he settled in 1892.</p> <p>In this vertical painting, the eye initially fixes on the vibrant red-orange buoy, which contrasts with the water's deep blue. The reflections of the buildings then lead the viewer's eye to the background, with lighter tones. The divisionist technique and the combination of pure colors allowed Signac to depict a glittering sea, and the glimmering light of the Midi.</p> <p>The Pointillist painters differ from the Impressionists, most notably in the scientific dimension of their work. Regarding the rigor of his initial work, Signac's strokes have widened for this series; the division of tones is more relaxed.</p> <p>P.S. Our sale is on! Save 20% on our <a href=\"https://shop.dailyartmagazine.com/product-category/prints/?utm_campaign=DailyArt-Prints&amp;utm_medium=text&amp;utm_source=DailyArtapp&amp;utm_term=fine-art-prints\">Prints Collection</a> and order a high-quality reproduction of the greatest masterpieces.&nbsp;</p>",
};

export const currentArtImageIndex = writable<number>(0);
export const localArtStore = writable<{
  loading: boolean;
  data: ArtImageType[];
}>({ loading: false, data: [defaultArtImage] });

export function getCurrentArtImage() {
  if (!browser) return;
  currentArtImageIndex.set(0);
  localArtStore.set({ loading: false, data: [defaultArtImage] });
}

export async function getNextArtImage() {
  if (!browser) return;
  const images = get(localArtStore);
  const index = get(currentArtImageIndex);

  if (images.data.length < IMAGES_LENGTH && index === images.data.length - 1) {
    localArtStore.update((s) => ({ ...s, loading: true }));
    const response = await fetch(`/server/getdailyart`);

    if (response.status == 200) {
      let json = await response.json();
      localArtStore.update((s) => {
        const data = [...s.data, json];
        return { loading: false, data };
      });
      currentArtImageIndex.update((n) => {
        const newIndex = (n + 1) % IMAGES_LENGTH;
        return newIndex;
      });
    }
  } else if (
    images.data.length === IMAGES_LENGTH &&
    index === IMAGES_LENGTH - 1
  ) {
    localArtStore.update((s) => ({ ...s, loading: true }));
    const response = await fetch(`/server/getdailyart`);
    if (response.status == 200) {
      const json = await response.json();
      localArtStore.update((s) => {
        const data = [...s.data.slice(1), json];
        return { loading: false, data };
      });
    }
  } else {
    currentArtImageIndex.update((n) => {
      const newIndex = (n + 1) % IMAGES_LENGTH;
      return newIndex;
    });
  }
}

export async function getPrevArtImage() {
  if (!browser) return;
  const images = get(localArtStore);

  currentArtImageIndex.update((n) => {
    let newIndex = (n - 1) % images.data.length;
    newIndex = newIndex < 0 ? 0 : newIndex;
    return newIndex;
  });
}

//----------------DASHBOARD-----------------//

export const USER_SETTINGS = "user-settings";

export async function getUserSettingsData() {
  if (!browser) return;
  const settings = localStorage.getItem(USER_SETTINGS);
  if (settings) {
    const data = deserialize(settings);
    setStoreUserSettings(data);
  } else {
    const { data } = await page.data.supabase
      .from("dashboard_table")
      .select(
        "focusMinutes,shortbreakMinutes,longbreakMinutes,intervals,locations,currentLocationId,progress",
      )
      .eq("user", "thinh");
    if (data) {
      localStorage.setItem(USER_SETTINGS, serialize(data[0]));
      setStoreUserSettings(data[0]);
    }
  }
}

function setStoreUserSettings(setting: UserType) {
  focusMinutes.set(setting.focusMinutes);
  shortbreakMinutes.set(setting.shortbreakMinutes);
  longbreakMinutes.set(setting.longbreakMinutes);
  intervals.set(setting.intervals);
  locationList.set(setting.locations);
  currentLocationId.set(setting.currentLocationId);
  yearProgressList.set(setting.progress);
}

export async function saveUserSetting() {
  if (!browser) return;
  const { data } = await page.data.supabase
    .from("dashboard_table")
    .select(
      "focusMinutes,shortbreakMinutes,longbreakMinutes,intervals,locations,currentLocationId,progress",
    )
    .eq("user", "thinh");
  if (data) {
    localStorage.setItem(USER_SETTINGS, serialize(data[0]));
    setStoreUserSettings(data[0]);
  }
}
