<script lang="ts">
  import { onMount } from "svelte";
  import {
    MapLibre,
    NavigationControl,
    ScaleControl,
    GlobeControl,
    ImageLoader,
    GeoJSONSource,
    SymbolLayer,
    RasterLayer,
    RasterTileSource,
    RasterDEMTileSource,
    Marker,
    Popup,
  } from "svelte-maplibre-gl";
  import type { FeatureCollection } from "geojson";
  import Rainviewer from "$lib/components/Rainviewer.svelte";

  // === CONFIGURATION ===
  // var TILE_SIZE = window.devicePixelRatio >= 2 ? 512 : 256;
  // var RADAR_OPACITY = 0.8;
  // var ANIMATION_DELAY_MS = 500;
  var API_URL = "https://api.rainviewer.com/public/weather-maps.json";

  async function loadData() {
    const response = await fetch(API_URL);
    if (response.status === 200) {
      let data = await response.json();
      // Use the latest past radar frame
      const latestTime = data.radar.past[data.radar.past.length - 1].time;
      const host = data.host;

      radarUrl = `${host}${data.radar.past[data.radar.past.length - 1].path}/512/{z}/{x}/{y}/2/1_1.png`;

      // radarUrl = `${host}${data.radar.past[data.radar.past.length - 1].path}/256/{z}/{x}/{y}/2/1_1.png`;
    }
  }

  let radarUrl = $state("");

  let lonLat = { lng: 106.395781, lat: 10.583642 };

  // Base styles
  const STYLES = new Map<string, string | maplibregl.StyleSpecification>([
    ["Rainviewer", "https://maps.rainviewer.com/styles/m2/style.json"],
    ["Voyager", "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"],
    [
      "Positron",
      "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    ],
    [
      "Dark Matter",
      "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    ],
  ]);

  let name = $state("Positron");
  let style = $derived(STYLES.get(name)!);
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="Sad day!" />
</svelte:head>

<div
  class="absolute w-full h-full z-10 flex flex-col justify-center items-center"
>
  <Rainviewer/>
</div>

<style lang="postcss">
</style>
