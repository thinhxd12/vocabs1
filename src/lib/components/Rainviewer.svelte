<script lang="ts">
  import { currentLocationId, locationList } from "$lib/store/layoutstore";
  import { untrack } from "svelte";
  import {
    MapLibre,
    NavigationControl,
    ScaleControl,
    GlobeControl,
    RasterLayer,
    RasterTileSource,
    Marker,
  } from "svelte-maplibre-gl";

  type RainviewerCoord = {
    lng: number;
    lat: number;
  };

  const API_URL = "https://api.rainviewer.com/public/weather-maps.json";

  async function loadData() {
    const response = await fetch(API_URL);
    if (response.status === 200) {
      let data = await response.json();
      const latestTime = data.radar.past[data.radar.past.length - 1];
      const host = data.host;
      radarUrl = `${host}${latestTime.path}/512/{z}/{x}/{y}/2/1_1.png`;
    } else {
      radarUrl = "";
    }
  }

  let radarUrl = $state("");

  let lonLat = $state<RainviewerCoord>({ lng: 106.395781, lat: 10.583642 });

  $effect(() => {
    $currentLocationId;
    untrack(() => {
      const currentLocation = $locationList.find(
        (item) => item.id === $currentLocationId,
      );
      if (currentLocation) {
        lonLat = {
          lng: Number(currentLocation.longitude),
          lat: Number(currentLocation.latitude),
        };
        loadData();
      }
    });
  });

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

  let name = $state("Dark Matter");
  let style = $derived(STYLES.get(name)!);
</script>

<div class="flex flex-col w-main">
  <select
    onchange={(e) => (style = e.currentTarget.value)}
    class="light w-full h-24 text-12 outline-none"
  >
    {#each STYLES as item}
      <option value={item[1]} selected={item[0] === name}>
        {item[0]}
      </option>
    {/each}
  </select>

  <MapLibre
    class="light w-full min-h-290 h-290"
    {style}
    zoom={7}
    center={lonLat}
    maxZoom={7}
    attributionControl={false}
  >
    {#if radarUrl}
      <RasterTileSource
        id="rainviewer-source"
        tiles={[radarUrl]}
        tileSize={512}
      >
        <RasterLayer id="rainviewer-layer" paint={{ "raster-opacity": 0.9 }} />
      </RasterTileSource>
    {/if}

    <Marker lnglat={lonLat} scale={0.72} color="#228be6" />
    <NavigationControl />
    <ScaleControl />
    <GlobeControl />
  </MapLibre>
</div>

<style lang="postcss">
</style>
