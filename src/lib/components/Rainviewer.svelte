<script lang="ts">
  import { currentLocationId, locationList } from "$lib/store/layoutstore";
  import { format } from "date-fns";
  import { untrack } from "svelte";
  import {
    MapLibre,
    NavigationControl,
    ScaleControl,
    GlobeControl,
    RasterLayer,
    RasterTileSource,
    Marker,
    FullScreenControl,
  } from "svelte-maplibre-gl";

  type RainviewerCoord = {
    lng: number;
    lat: number;
  };

  const API_URL = "https://api.rainviewer.com/public/weather-maps.json";

  let radarUrl = $state<string>("");
  let latestTime = $state<number>(0);
  let lonLat = $state<RainviewerCoord>({ lng: 0, lat: 0 });

  async function loadData() {
    const response = await fetch(API_URL);
    if (response.status === 200) {
      let data = await response.json();
      const latestData = data.radar.past[data.radar.past.length - 1];
      latestTime = latestData.time;
      const host = data.host;
      radarUrl = `${host}${latestData.path}/512/{z}/{x}/{y}/2/1_1.png`;
    } else {
      radarUrl = "";
    }
  }

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
    [
      "Alidade Smooth",
      "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
    ],
    [
      "Alidade Smooth Dark",
      "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
    ],
    ["Voyager", "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"],
    [
      "Positron",
      "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    ],
    [
      "Dark Matter",
      "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    ],
    [
      "Colorful",
      "https://tiles.versatiles.org/assets/styles/colorful/style.json",
    ],
    ["Fiord", "https://tiles.openfreemap.org/styles/fiord"],
  ]);

  let name = $state("Alidade Smooth");
  let style = $derived(STYLES.get(name)!);
</script>

<div class="relative flex flex-col w-main">
  <select
    onchange={(e) => (style = e.currentTarget.value)}
    class="light w-full h-24 text-12 outline-none"
    name="rainviewer"
  >
    {#each STYLES as item}
      <option value={item[1]} selected={item[0] === name}>
        {item[0]}
      </option>
    {/each}
  </select>

  {#if latestTime}
    <div
      class="absolute top-25 left-0 z-9 maplibregl-ctrl maplibregl-ctrl-scale font-600 !py-2 !px-6 !text-11 font-helvetica"
    >
      at {format(new Date(latestTime * 1000), "p")}
    </div>
  {/if}

  <MapLibre
    class="light w-full min-h-290 h-290"
    {style}
    zoom={7.4}
    center={lonLat}
    maxZoom={7.4}
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

    <FullScreenControl position="top-right" />
    <Marker lnglat={lonLat} scale={0.72} color="#228be6" />
    <NavigationControl />
    <ScaleControl />
    <GlobeControl />
  </MapLibre>
</div>

<style lang="postcss">
  :global {
    .maplibregl-ctrl {
      margin: 3px !important;
    }

    .maplibregl-ctrl button {
      width: 24px !important;
      height: 24px !important;
    }
  }
</style>
