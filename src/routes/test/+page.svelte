<script lang="ts">
  import Bookmark from "$lib/components/Bookmarkcopy.svelte";
  import Flipcard from "$lib/components/Flipcard.svelte";
  import ImageLoader from "$lib/components/ImageLoader.svelte";
  import Tick from "$lib/components/Tick.svelte";

  let currentDummy = {
    data: {
      time: "2023-01-26T07:48:00Z",
      values: {
        cloudBase: 0.07,
        cloudCeiling: 0.07,
        cloudCover: 100,
        dewPoint: 0.88,
        freezingRainIntensity: 0,
        humidity: 96,
        precipitationProbability: 0,
        pressureSurfaceLevel: 984.57,
        rainIntensity: 0,
        sleetIntensity: 0,
        snowIntensity: 0,
        temperature: 1.88,
        temperatureApparent: -0.69,
        uvHealthConcern: 0,
        uvIndex: 0,
        visibility: 9.9,
        weatherCode: 1001,
        windDirection: 10,
        windGust: 3.38,
        windSpeed: 2.38,
      },
    },
    location: {
      lat: 43.653480529785156,
      lon: -79.3839340209961,
      name: "Old Toronto, Toronto, Golden Horseshoe, Ontario, Canada",
      type: "administrative",
    },
  };

  let current = $state(currentDummy);
  import type { PageProps } from "./$types";
  let { data, form }: PageProps = $props();

  async function name() {
    // const url =
    //   "https://api.tomorrow.io/v4/weather/realtime?location=10.65639, 106.3458&apikey=iKOCmIMApJ9ZJoeGT3JjQgr7Fvx6jQVi";
    // const options = {
    //   method: "GET",
    //   headers: {
    //     accept: "application/json",
    //     "accept-encoding": "deflate, gzip, br",
    //   },
    // };
    // fetch(url, options)
    //   .then((res) => res.json())
    //   .then((json) => {
    //     console.log(json);
    //     current = json;
    //   })
    //   .catch((err) => console.error(err));
    // const { data: vocab } = await data.supabase
    //   .from("bookmark_progress")
    //   .select();

    const { data: res, error } = await data.supabase.rpc("get_random_bookmark");

    console.log(res);
  }
</script>

<main class="flex items-center justify-center flex-col relative z-50">
  <div class="flex">
    <button onclick={name} class="mr-2 rounded-1 border px-1"> RUN </button>
  </div>

  <!-- <img
    src={`/tomorrow/${current.data.values.weatherCode}0.png`}
    alt=""
    width={50}
    height={50}
  /> -->
  <!-- <Bookmark supabase={data.supabase} /> -->
</main>
