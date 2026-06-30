<script lang="ts">
  import { currentLocationId, locationList } from "$lib/store/layoutstore";
  import { format } from "date-fns";
  import { onDestroy, onMount, untrack } from "svelte";
  import {
    MapLibre,
    NavigationControl,
    ScaleControl,
    GlobeControl,
    RasterLayer,
    RasterTileSource,
    Marker,
    FullScreenControl,
    HillshadeLayer,
    RasterDEMTileSource,
  } from "svelte-maplibre-gl";
  import { type StyleSpecification } from "maplibre-gl";
  import myStyle from "$lib/json/protomaps.json";
  // https://maplibre.org/maputnik/

  type RainviewerCoord = {
    lng: number;
    lat: number;
  };

  type RadarPast = {
    time: number;
    path: string;
  };

  // const API_URL = "https://api.rainviewer.com/public/weather-maps.json";
  const API_URL = "https://api.librewxr.net/public/weather-maps.json";

  let interval: ReturnType<typeof setInterval>;
  let radarHost = $state<string>("");
  let radarUrl = $state<string>("");
  let radarData = $state<RadarPast[]>([]);
  let animationPosition = $state<number>(0);
  let lonLat = $state<RainviewerCoord>({ lng: 51.5074, lat: -0.1278 });

  async function loadData() {
    const response = await fetch(API_URL);
    if (response.status === 200) {
      const data = await response.json();
      radarHost = data.host;
      radarData = data.radar.past;
      animationPosition = data.radar.past.length - 1;
      showFrame();
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
      }
    });
  });

  onMount(() => {
    loadData();
  });

  function playStop() {
    clearInterval(interval);
    animationPosition = 0;
    interval = setInterval(updateFrame, 500);
  }

  function updateFrame() {
    animationPosition++;
    if (animationPosition >= radarData.length) {
      clearInterval(interval);
      animationPosition = radarData.length - 1;
    }
    showFrame();
  }

  function showFrame() {
    radarUrl =
      radarHost +
      radarData[animationPosition].path +
      "/512/{z}/{x}/{y}/2/1_1.webp?arrows=light";
  }

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="relative flex flex-col w-main">
  {#if radarData.length}
    <button
      class="absolute top-0 left-0 z-9 maplibregl-ctrl maplibregl-ctrl-scale font-600 !py-2 !px-6 !text-11 font-helvetica"
      onclick={playStop}
    >
      at {format(new Date(radarData[animationPosition].time * 1000), "p")}
    </button>
  {/if}

  <MapLibre
    class="light w-full min-h-290 h-290"
    style={myStyle as StyleSpecification}
    zoom={9}
    center={lonLat}
    maxZoom={12}
    attributionControl={false}
  >
    {#if radarData.length}
      <RasterTileSource
        id="rainviewer-source"
        tiles={[radarUrl]}
        tileSize={512}
      >
        <RasterLayer
          id="rainviewer-layer"
          paint={{
            "raster-opacity": 0.8,
            "raster-opacity-transition": { duration: 0, delay: 0 },
            "raster-fade-duration": 0,
          }}
        />
      </RasterTileSource>
    {/if}

    <RasterDEMTileSource url="https://tiles.mapterhorn.com/tilejson.json">
      <HillshadeLayer paint={{ "hillshade-exaggeration": 0.1 }} />
    </RasterDEMTileSource>

    <FullScreenControl position="top-right" />
    <Marker lnglat={lonLat} scale={0.72} color="#228be6" />
    <NavigationControl showCompass={false} />
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
