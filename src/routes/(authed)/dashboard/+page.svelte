<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import {
    addToast,
    currentLocationId,
    focusMinutes,
    intervals,
    locationList,
    longbreakMinutes,
    shortbreakMinutes,
    weatherData,
    yearProgressList,
  } from "$lib/store/layoutstore";
  import MaterialSymbolsDeleteOutlineRounded from "~icons/material-symbols/delete-outline-rounded";
  import MaterialSymbolsAddRounded from "~icons/material-symbols/add-rounded";
  import MaterialSymbolsStarRounded from "~icons/material-symbols/star-rounded";
  import type { PageProps } from "./$types";
  import { saveUserSetting } from "$lib/store/localstore";
  import type {
    LocationType,
    UserType,
    WeatherQueryParams,
    YearProgressType,
  } from "$lib/types";
  import { v7 as uuidv7 } from "uuid";
  import { getOpenMeteoWeather } from "$lib/utils/functions";

  let { data: layoutData }: PageProps = $props();

  async function handleChangeInput(name: keyof UserType, value: any) {
    const { error } = await layoutData.supabase
      .from("dashboard_table")
      .update({ [name]: value })
      .eq("user", "thinh");
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    }
    saveUserSetting();
  }

  let newLocation = $state<LocationType>({
    id: "",
    name: "",
    latitude: "",
    longitude: "",
  });

  async function insertLocation() {
    if (
      newLocation.name === "" ||
      newLocation.latitude === "" ||
      newLocation.longitude === ""
    ) {
      addToast({
        type: "error",
        title: "Error!",
        message: "Invalid data",
      });
      return;
    }
    newLocation.id = uuidv7();
    const newList = [...$locationList, newLocation];
    const { error } = await layoutData.supabase
      .from("dashboard_table")
      .update({ locations: newList })
      .eq("user", "thinh");
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    } else {
      saveUserSetting();
      addToast({
        type: "success",
        title: "Success!",
        message: "Insert successfully.",
      });
      newLocation = {
        id: "",
        name: "",
        latitude: "",
        longitude: "",
      };
    }
  }

  async function deleteLocation(id: string) {
    const newList = [...$locationList].filter((item) => item.id !== id);
    const { error } = await layoutData.supabase
      .from("dashboard_table")
      .update({ locations: newList })
      .eq("user", "thinh");
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    } else {
      saveUserSetting();
      addToast({
        type: "success",
        title: "Success!",
        message: "Insert successfully.",
      });
    }
  }

  async function setCurrentLocation(id: string) {
    if ($currentLocationId === id) return;
    const { error } = await layoutData.supabase
      .from("dashboard_table")
      .update({ currentLocationId: id })
      .eq("user", "thinh");
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    } else {
      saveUserSetting();
      const currentLocation = $locationList.find((item) => item.id === id);
      if (currentLocation) {
        let param: WeatherQueryParams = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          tempUnit: "c",
        };
        $weatherData = await getOpenMeteoWeather(param);
      }
    }
  }

  let newProgress = $state<YearProgressType>({
    id: "",
    date: "",
    count: "",
  });

  async function insertProgress() {
    if (newProgress.date === "" || newProgress.count === "") {
      addToast({
        type: "error",
        title: "Error!",
        message: "Invalid data",
      });
      return;
    }
    newProgress.id = uuidv7();
    const newList = [...$yearProgressList, newProgress];
    const { error } = await layoutData.supabase
      .from("dashboard_table")
      .update({ progress: newList })
      .eq("user", "thinh");
    if (error) {
      addToast({
        type: "error",
        title: "Error!",
        message: error.message as string,
      });
    } else {
      saveUserSetting();
      addToast({
        type: "success",
        title: "Success!",
        message: "Insert successfully.",
      });
      newProgress = {
        id: "",
        date: "",
        count: "",
      };
    }
  }
</script>

<Container scrollable>
  <h1
    class="font-copernicus text-24 text-center leading-28 mt-3 uppercase font-600"
  >
    Dashboard
  </h1>

  <div class="w-full grid grid-cols-2 gap-3">
    <h2 class="col-span-2 text-18 font-500">Pomodoro</h2>
    <div class="dashboardItem">
      <h3>Focus minutes</h3>
      <input
        type="number"
        name="focusMinutes"
        bind:value={$focusMinutes}
        onchange={(e) => {
          handleChangeInput(
            e.currentTarget.name as keyof UserType,
            Number(e.currentTarget.value),
          );
        }}
      />
    </div>
    <div class="dashboardItem">
      <h3>Short Break minutes</h3>
      <input
        type="number"
        name="shortbreakMinutes"
        bind:value={$shortbreakMinutes}
        onchange={(e) => {
          handleChangeInput(
            e.currentTarget.name as keyof UserType,
            Number(e.currentTarget.value),
          );
        }}
      />
    </div>
    <div class="dashboardItem">
      <h3>Long Break minutes</h3>
      <input
        type="number"
        name="longbreakMinutes"
        bind:value={$longbreakMinutes}
        onchange={(e) => {
          handleChangeInput(
            e.currentTarget.name as keyof UserType,
            Number(e.currentTarget.value),
          );
        }}
      />
    </div>
    <div class="dashboardItem">
      <h3>Interval</h3>
      <input
        type="number"
        name="intervals"
        bind:value={$intervals}
        onchange={(e) => {
          handleChangeInput(
            e.currentTarget.name as keyof UserType,
            Number(e.currentTarget.value),
          );
        }}
      />
    </div>

    <h2 class="col-span-2 text-18 font-500">Weather Locations</h2>
    <div class="dashboardItem col-span-2">
      <div class="dashboardRow grid-cols-12 mb-3">
        <input
          type="text"
          name="name"
          autocomplete="off"
          placeholder="Place"
          class="col-span-4"
          bind:value={newLocation.name}
        />
        <input
          type="text"
          name="latitude"
          autocomplete="off"
          placeholder="Latitude"
          class="col-span-3"
          bind:value={newLocation.latitude}
        />
        <input
          type="text"
          name="longitude"
          autocomplete="off"
          placeholder="Longtitude"
          class="col-span-3"
          bind:value={newLocation.longitude}
        />
        <div class="flex justify-end col-span-2">
          <button
            class="dashboardBtn hover:bg-green-400"
            onclick={insertLocation}
          >
            <MaterialSymbolsAddRounded width={18} height={18} />
          </button>
        </div>
      </div>

      {#each $locationList as item}
        <div class="dashboardRow grid-cols-12">
          <span class="truncate col-span-4">{item.name}</span>
          <span class="col-span-3">{item.latitude}</span>
          <span class="col-span-3">{item.longitude}</span>
          <div class="flex justify-end col-span-2">
            <button
              class="dashboardBtn {item.id === $currentLocationId
                ? 'opacity-100'
                : 'opacity-0'} hover:opacity-100"
              onclick={() => setCurrentLocation(item.id)}
            >
              <MaterialSymbolsStarRounded
                width={18}
                height={18}
                color="#f1a90e"
              />
            </button>
            <button
              class="dashboardBtn hover:text-[#ff3333]"
              onclick={() => deleteLocation(item.id)}
            >
              <MaterialSymbolsDeleteOutlineRounded width={18} height={18} />
            </button>
          </div>
        </div>
      {/each}
    </div>

    <h2 class="col-span-2 text-18 font-500">Annual Progress</h2>
    <div class="dashboardItem col-span-2">
      <div class="dashboardRow grid-cols-9 mb-3">
        <input
          type="text"
          name="date"
          autocomplete="off"
          placeholder="Date"
          class="col-span-4"
          bind:value={newProgress.date}
        />
        <input
          type="text"
          name="count"
          autocomplete="off"
          placeholder="Count"
          class="col-span-4"
          bind:value={newProgress.count}
        />
        <div class="flex justify-end col-span-1">
          <button
            class="dashboardBtn hover:bg-green-400"
            onclick={insertProgress}
          >
            <MaterialSymbolsAddRounded width={18} height={18} />
          </button>
        </div>
      </div>

      {#each $yearProgressList as item}
        <div class="dashboardRow grid-cols-9">
          <span class="col-span-4">{item.date}</span>
          <span class="col-span-4">{item.count}</span>
          <span class="col-span-1"></span>
        </div>
      {/each}
    </div>
  </div>
</Container>

<style lang="postcss">
  .dashboardItem {
    @apply px-12 py-6 rounded-2 transition duration-100 bg-white/30 hover:bg-white/90 backdrop-blur-md ring-1 ring-black/5 shadow shadow-black/30;
  }

  .dashboardItem h3 {
    @apply bg-transparent text-14 font-500 cursor-default;
  }

  .dashboardItem > input {
    @apply bg-transparent text-36 leading-36 font-500 w-full outline-none;
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .dashboardRow {
    @apply grid;
  }

  .dashboardRow input,
  .dashboardRow span {
    @apply h-24 bg-transparent placeholder:text-black/45 text-14 font-400 w-full outline-none;
  }

  .dashboardBtn {
    @apply min-w-24 h-24 rounded-3 flex items-center justify-center;
  }
</style>
