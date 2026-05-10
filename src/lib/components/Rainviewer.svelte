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
    HillshadeLayer,
    RasterDEMTileSource,
  } from "svelte-maplibre-gl";
  import { type StyleSpecification } from "maplibre-gl";
  import myStyle from "$lib/json/positron.json";

  // edit basemap style json at https://maplibre.org/maputnik/

  type RainviewerCoord = {
    lng: number;
    lat: number;
  };

  const API_URL = "https://api.rainviewer.com/public/weather-maps.json";

  let radarUrl = $state<string>("");
  let latestTime = $state<number>(0);
  let lonLat = $state<RainviewerCoord>({ lng: 106.395781, lat: 10.583642 });

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
</script>

<div class="relative flex flex-col w-main">
  {#if latestTime}
    <div
      class="absolute top-0 left-0 z-9 maplibregl-ctrl maplibregl-ctrl-scale font-600 !py-2 !px-6 !text-11 font-helvetica"
    >
      at {format(new Date(latestTime * 1000), "p")}
    </div>
  {/if}

  <MapLibre
    class="light w-full min-h-290 h-290"
    style={myStyle as StyleSpecification}
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
        <RasterLayer id="rainviewer-layer" paint={{ "raster-opacity": 1.0 }} />
      </RasterTileSource>
    {/if}

    <RasterDEMTileSource url="https://tiles.mapterhorn.com/tilejson.json">
      <HillshadeLayer paint={{ "hillshade-exaggeration": 0.3 }} />
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
