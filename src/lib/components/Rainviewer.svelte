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
    Marker,
    FullScreenControl,
    HillshadeLayer,
    RasterDEMTileSource,
    ImageSource,
  } from "svelte-maplibre-gl";
  import { type StyleSpecification } from "maplibre-gl";
  import myStyle from "$lib/json/protomaps.json";

  type RainviewerCoord = {
    lng: number;
    lat: number;
  };

  type RadarPast = {
    time: string;
    path: string;
  };

  let interval: ReturnType<typeof setInterval>;
  let radarUrl = $state<string>("");
  let radarData = $state<RadarPast[]>([]);
  let animationPosition = $state<number>(0);
  let lonLat = $state<RainviewerCoord>({ lng: 51.5074, lat: -0.1278 });

  async function loadData() {
    generateRadarTimeline();
    showFrame();
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
    animationPosition = radarData.length - 1;
    interval = setInterval(updateFrame, 1000);
  }

  function updateFrame() {
    animationPosition--;
    if (animationPosition === 0) {
      clearInterval(interval);
      animationPosition = 0;
    }
    showFrame();
  }

  function showFrame() {
    radarUrl = `https://mywebapp.abcworker.workers.dev/http://hymetnet.gov.vn/dataout_web/COM/${radarData[animationPosition].path}.png`;
  }

  function generateRadarTimeline() {
    const now = new Date();
    const timeline: RadarPast[] = [];

    const roundedMinutes = Math.floor((now.getUTCMinutes() - 8) / 10) * 10;
    now.setUTCMinutes(roundedMinutes, 0, 0);

    for (let i = 0; i < 12; i++) {
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, "0");
      const day = String(now.getUTCDate()).padStart(2, "0");
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");

      const dateFolder = `${year}${month}${day}`;
      const fullTimestamp = `${year}${month}${day}${hours}${minutes}`;
      const path = `${dateFolder}/COM_${fullTimestamp}_CMAX00`;
      const time = `${year}-${month}-${day}T${hours}:${minutes}:00Z`;

      timeline.push({ time, path });

      now.setUTCMinutes(now.getUTCMinutes() - 10);
    }
    radarData = timeline;
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
      at {format(new Date(radarData[animationPosition].time), "p")}
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
      <ImageSource
        id="radar-source"
        url={radarUrl}
        coordinates={[
          [97, 25.2],
          [115, 25.2],
          [115, 7.2],
          [97, 7.2],
        ]}
      >
        <RasterLayer
          id="radar-layer"
          paint={{
            "raster-opacity": 0.7,
            "raster-fade-duration": 0,
          }}
        />
      </ImageSource>
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
