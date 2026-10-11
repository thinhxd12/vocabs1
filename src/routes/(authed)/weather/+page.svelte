<script lang="ts">
  import { onMount } from "svelte";
  import { getOpenMeteoWeather } from "$lib/utils/functions";
  import Container from "$lib/components/Container.svelte";
  import { showTimer } from "$lib/store/navstore";
  import {
    getAQIDescription,
    getAQILevel,
    getBeaufortInfo,
    getCloudCoverDescription,
    getFeelsLikeDescription,
    getHumidityDescription,
    getPressureDescription,
    getUVInfo,
    getVisibilityDescription,
    getWeatherInfo,
    getWindDirection,
  } from "$lib/utils/w-conditions";
  import {
    calculateSunPosition,
    generateForecastStatement,
    getHourFromISO,
  } from "$lib/utils/w-calculations";
  import {
    formatDay,
    formatPrecipitation,
    formatRelativeFromMs,
    formatSnowDepth,
    formatTemperature,
    formatTime,
    formatTimeWithMinutes,
  } from "$lib/utils/w-formatting";
  import type { LocationType, WeatherQueryParams } from "$lib/types";
  import {
    addToast,
    currentForecastModel,
    currentLocationId,
    locationList,
    weatherData,
  } from "$lib/store/layoutstore";
  import { saveUserSetting } from "$lib/store/localstore";
  import type { PageProps } from "./$types";
  import Rainviewer from "$lib/components/Rainviewer.svelte";

  let { data: layoutData }: PageProps = $props();

  type HourlyForecast = {
    time: string;
    temp: number;
    icon: string;
    background: string;
    description: string;
    precipitation_probability: number;
    timeLabel: { hour: string; period: "AM" | "PM" };
  };

  type DailyForecast = {
    date: string;
    icon: string;
    description: string;
    temp_max: number;
    temp_min: number;
    temp_current?: number;
    feels_like: number;
    precipitation_probability: number;
  };

  let sunSVGpath = $state<SVGPathElement>();
  let now = $state(Date.now());

  function captureSunPath(node: SVGPathElement) {
    sunSVGpath = node;
  }

  onMount(() => {
    if (!$weatherData) loadCurrentWeather();
  });

  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 30_000);
    return () => clearInterval(id);
  });

  async function loadWeather(location: LocationType) {
    const params: WeatherQueryParams = {
      latitude: location.latitude,
      longitude: location.longitude,
      tempUnit: "c",
      model: $currentForecastModel,
    };
    const data = await getOpenMeteoWeather(params);
    if (!data) return;
    $weatherData = data;
  }

  async function loadCurrentWeather() {
    const currentLocation = $locationList.find(
      (item) => item.id === $currentLocationId,
    );
    if (currentLocation) await loadWeather(currentLocation);
  }

  async function setCurrentLocation(id: string) {
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
      return;
    }
    saveUserSetting();
    const currentLocation = $locationList.find((item) => item.id === id);
    if (currentLocation) await loadWeather(currentLocation);
  }

  const uvCoordinates = [
    {
      cx: 36.6,
      cy: 133.6,
      color: "#73AA24",
    },
    {
      cx: 18.7,
      cy: 105,
      color: "#73AA24",
    },
    {
      cx: 14.5,
      cy: 80,
      color: "#FDE300",
    },
    {
      cx: 18.7,
      cy: 55.2,
      color: "#FDE300",
    },
    {
      cx: 36.2,
      cy: 26.8,
      color: "#FDE300",
    },
    {
      cx: 56.6,
      cy: 12,
      color: "#FF8C00",
    },
    {
      cx: 90.5,
      cy: 4,
      color: "#FF8C00",
    },
    {
      cx: 124.4,
      cy: 12,
      color: "#D13438",
    },
    {
      cx: 144.8,
      cy: 26.8,
      color: "#D13438",
    },
    {
      cx: 162.3,
      cy: 55.2,
      color: "#D13438",
    },
    {
      cx: 166.3,
      cy: 85.3,
      color: "#5C2E91",
    },
    {
      cx: 144.8,
      cy: 133.6,
      color: "#5C2E91",
    },
  ];

  function getSunPosition(t: number) {
    if (!sunSVGpath) return;
    const startPoint = 0.22;
    const endPoint = 0.78;
    const position = (t / 100) * (endPoint - startPoint) + startPoint;
    const totalLength = sunSVGpath.getTotalLength();
    const point = sunSVGpath.getPointAtLength(totalLength * position);
    return { x: point.x, y: point.y };
  }

  class WeatherForecast {
    data = $derived($weatherData);

    current = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const temperature = Math.round(data.current.temperature_2m);
      const { icon, description, background } = getWeatherInfo(
        data.current.weather_code,
        data.current.is_day,
      );
      const forecastStatement = generateForecastStatement(data);
      return {
        temperature,
        icon,
        description,
        background,
        forecastStatement,
      };
    });

    lastUpdated = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const timestampMs =
        Date.parse(`${data.current.time}Z`) - data.utc_offset_seconds * 1000;
      return formatRelativeFromMs(now - timestampMs);
    });

    feelslike = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const temperature = Math.round(data.current.apparent_temperature);
      const actual = Math.round(data.current.temperature_2m);
      const description = getFeelsLikeDescription(
        temperature,
        actual,
        data.current.wind_speed_10m,
        data.current.relative_humidity_2m,
      );
      return {
        temperature,
        description,
      };
    });

    wind = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const direction = data.current.wind_direction_10m || 0;
      const directionLabel = getWindDirection(direction);
      const speed = Math.round(data.current.wind_speed_10m || 0);
      const gusts = Math.round(data.current.wind_gusts_10m || 0);
      const unit = "km/h";
      const windInfo = getBeaufortInfo(data.current.wind_speed_10m || 0);
      return {
        direction,
        directionLabel,
        speed,
        gusts,
        unit,
        image: windInfo.level,
        description: windInfo.description,
      };
    });

    precipitation = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const rain = data.current.rain ?? 0;
      const showers = data.current.showers ?? 0;
      const snowfall = data.current.snowfall ?? 0;

      // Total liquid precipitation (rain + showers)
      const totalLiquid = rain + showers;

      const formattedRain = formatPrecipitation("c", totalLiquid);
      const formattedSnow = formatPrecipitation("c", snowfall);

      const hasRain = totalLiquid > 0;
      const hasSnow = snowfall > 0;
      const hasPrecipitation = hasRain || hasSnow;

      const precipitationDescription = !hasPrecipitation
        ? "No precipitation"
        : hasRain && hasSnow
          ? "Mixed precipitation"
          : hasRain
            ? totalLiquid < 0.1
              ? "Light rain"
              : "Rain"
            : snowfall < 0.1
              ? "Light snow"
              : "Snow";

      return {
        hasPrecipitation,
        hasRain,
        hasSnow,
        formattedRain,
        formattedSnow,
        precipitationDescription,
      };
    });

    uvIndex = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const value = Math.round(data.current.uv_index || 0);
      const { level, description } = getUVInfo(value);
      return {
        value,
        level,
        description,
      };
    });

    uvPoint = $derived.by(() => {
      const value = this.uvIndex?.value ?? 0;
      if (!value) return;
      return uvCoordinates[Math.min(value, uvCoordinates.length) - 1];
    });

    pressure = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const pressureHpa = data.current.pressure_msl || 1013;
      const normalizedValue = Math.max(
        0,
        Math.min(100, ((pressureHpa - 1000) / 40) * 100),
      );
      const description = getPressureDescription(pressureHpa);
      return {
        value: pressureHpa,
        percent: Math.round(normalizedValue),
        description,
      };
    });

    humidity = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const value = Math.round(data.current.relative_humidity_2m);
      const description = getHumidityDescription(value);
      const dewpoint = Math.round(data.current.dew_point_2m);
      return { value, description, dewpoint };
    });

    cloudcover = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const value = Math.round(data.current.cloud_cover);
      const description = getCloudCoverDescription(value);
      return { value, description };
    });

    visibility = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const visibilityKm = Math.round(data.current.visibility / 1000);
      const description = getVisibilityDescription(visibilityKm, true);
      return { value: visibilityKm, description, unit: "km" };
    });

    sunrise = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const sunriseISO = data.daily.sunrise[0];
      const sunsetISO = data.daily.sunset[0];
      const sunrise = sunriseISO ? formatTimeWithMinutes(sunriseISO) : "--:--";
      const sunset = sunsetISO ? formatTimeWithMinutes(sunsetISO) : "--:--";
      const position = calculateSunPosition(
        data.current.time,
        sunriseISO,
        sunsetISO,
      );
      return {
        sunrise,
        sunset,
        position: Math.round(position),
      };
    });

    aiq = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const value = data.current.us_aqi || 0;
      const { level, color } = getAQILevel(value);
      const description = getAQIDescription(value);
      return {
        value,
        level,
        color,
        description,
      };
    });

    snow = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const snowDepthMeters = data.current.snow_depth ?? 0;
      const hasSnow = snowDepthMeters > 0;
      const formattedSnowDepth = hasSnow
        ? formatSnowDepth("c", snowDepthMeters)
        : "0";
      let descriptionSnow = "No snow on ground";
      if (hasSnow) {
        const inches = snowDepthMeters * 39.3701;
        if (inches < 1) {
          descriptionSnow = "Light snow cover";
        } else if (inches < 6) {
          descriptionSnow = "Moderate snow depth";
        } else {
          descriptionSnow = "Significant snow depth";
        }
      }
      return {
        hasSnow,
        snowDepth: formattedSnowDepth,
        description: descriptionSnow,
      };
    });

    hourly = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const {
        weather_code,
        is_day,
        temperature_2m,
        precipitation_probability,
      } = data.hourly;
      const hourlyForecasts: HourlyForecast[] = data.hourly.time
        .slice(0, 12)
        .map((time, i) => {
          const { icon, description, background } = getWeatherInfo(
            weather_code[i],
            is_day[i],
          );
          return {
            time,
            temp: temperature_2m[i],
            icon,
            background,
            description,
            precipitation_probability: precipitation_probability[i],
            timeLabel: formatTime(time),
          };
        });
      return { data: hourlyForecasts };
    });

    daily = $derived.by(() => {
      const data = this.data;
      if (!data) return;
      const currentHourIndex = getHourFromISO(data.current.time);
      const skipToday = currentHourIndex >= 20;
      const dailyForecastsRaw: DailyForecast[] = data.daily.time.map(
        (date, index) => {
          const { icon, description } = getWeatherInfo(
            data.daily.weather_code[index],
            1,
          );
          return {
            date,
            icon,
            description,
            temp_max: data.daily.temperature_2m_max[index],
            temp_min: data.daily.temperature_2m_min[index],
            temp_current:
              index === 0 && !skipToday
                ? Math.round(data.current.temperature_2m)
                : undefined,
            feels_like: data.daily.apparent_temperature_max[index],
            precipitation_probability:
              data.daily.precipitation_probability_max[index],
          };
        },
      );
      // Filter out today if it's late evening
      const dailyForecasts = skipToday
        ? dailyForecastsRaw.slice(1)
        : dailyForecastsRaw;

      // Calculate dynamic temperature scale based on actual data
      const allTemps = dailyForecasts.flatMap((f) => [
        f.temp_min,
        f.temp_max,
        f.temp_current,
      ]);
      const validTemps = allTemps.filter(
        (t): t is number => typeof t === "number" && !Number.isNaN(t),
      );
      const minTempScale = validTemps.length
        ? Math.round(Math.min(...validTemps))
        : 0;
      const maxTempScale = validTemps.length
        ? Math.round(Math.max(...validTemps))
        : 0;
      const tempRange = maxTempScale - minTempScale;
      return {
        data: dailyForecasts,
        time: data.current.time,
        tempScale: {
          min: minTempScale,
          max: maxTempScale,
          range: tempRange || 1,
        },
      };
    });
  }

  const weather = new WeatherForecast();

  const sunPosition = $derived.by(() => {
    const sunrise = weather.sunrise;
    if (!sunrise || !sunSVGpath) return;
    return getSunPosition(sunrise.position);
  });
</script>

<svelte:head>
  {#if !$showTimer}
    <title>🌧️</title>
  {/if}
  <meta name="Weather" content="Weather" />
</svelte:head>

<Container scrollable>
  <div class="current select-none">
    <select
      name="location"
      onchange={(e) => setCurrentLocation(e.currentTarget.value)}
      class="location-list relative mb-6 text-white"
    >
      {#each $locationList as item (item.id)}
        <option value={item.id} selected={item.id === $currentLocationId}>
          {item.name}
        </option>
      {/each}
    </select>

    {#if weather.current}
      <video
        src="/weathervideos/{weather.current.background}.mp4"
        autoplay
        loop
        muted
        playsinline
        class="absolute top-0 left-0 w-full h-full object-cover object-top"
      >
        Your browser does not support the video tag.
      </video>

      <h1
        class="relative select-none indent-30 text-white text-135 font-300 leading-130 overflow-hidden text-center"
      >
        {weather.current.temperature}°
      </h1>

      <div class="relative flex justify-center items-center gap-9 mb-3">
        <img
          src="/metoffice/{weather.current.icon}.svg"
          alt="icon"
          class="size-90 object-cover"
          style="filter: drop-shadow(0px 0px 9px rgba(0, 0, 0, 0.3));"
        />
        <span class="text-white text-18 font-400">
          {weather.current.description}
        </span>
      </div>

      <p class="relative text-white px-6 text-center text-15 leading-18 mb-3">
        {weather.current.forecastStatement}
      </p>
      <p class="relative text-white/60 text-center text-11 mb-3">
        Last updated {weather.lastUpdated}
      </p>
    {/if}
  </div>

  <Rainviewer />

  <div class="w-full grid grid-cols-2 gap-2 select-none">
    {#if weather.feelslike}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12">Feels Like</p>
        <h1 class="text-36 font-400 leading-50">
          {weather.feelslike.temperature}°
        </h1>
        <p class="text-12">{weather.feelslike.description}</p>
      </div>
    {/if}

    {#if weather.wind}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12">Wind</p>

        <div class="flex items-center">
          <div class="-ml-15 relative size-120" aria-hidden="true">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(60, 60) rotate(-80)">
                <circle
                  r="40"
                  stroke="#ffffff1a"
                  stroke-width="4"
                  pathLength="360"
                  stroke-dasharray="70 290"
                  stroke-linecap="round"
                  fill="none"
                />
              </g>

              <g transform="translate(60, 60) rotate(10)">
                <circle
                  r="40"
                  stroke="#ffffff1a"
                  stroke-width="4"
                  pathLength="360"
                  stroke-dasharray="70 290"
                  stroke-linecap="round"
                  fill="none"
                />
              </g>

              <g transform="translate(60, 60) rotate(100)">
                <circle
                  r="40"
                  stroke="#ffffff1a"
                  stroke-width="4"
                  pathLength="360"
                  stroke-dasharray="70 290"
                  stroke-linecap="round"
                  fill="none"
                />
              </g>

              <g transform="translate(60, 60) rotate(190)">
                <circle
                  r="40"
                  stroke="#ffffff1a"
                  stroke-width="4"
                  pathLength="360"
                  stroke-dasharray="70 290"
                  stroke-linecap="round"
                  fill="none"
                />
              </g>

              <path
                fill="#228be6"
                d="M 61.0453 41.1725 A 1.125 1.125 90 0 0 58.9547 41.1725 l -12.728 31.8197 a 1.125 1.125 90 0 0 1.548 1.424 l 12.2251 -6.1126 l 12.2236 6.1142 a 1.125 1.125 90 0 0 1.5496 -1.4256 z"
                transform="rotate({weather.wind.direction - 180} 60 60)"
              ></path>
            </svg>

            <div class="text-11 absolute top-13 left-1/2 -translate-x-1/2">
              N
            </div>
            <div class="text-11 absolute bottom-14 left-1/2 -translate-x-1/2">
              S
            </div>
            <div
              class="text-11 absolute top-1/2 left-22 -translate-x-1/2 -translate-y-1/2"
            >
              W
            </div>
            <div
              class="text-11 absolute top-1/2 right-23 translate-x-5 -translate-y-1/2"
            >
              E
            </div>
          </div>

          <div class="flex justify-between">
            <div class="flex flex-col">
              <p class="text-12 leading-15 text-white/60 mb-6">
                From {weather.wind.directionLabel} ({weather.wind.direction}°)
              </p>

              <p class="text-12 leading-15 text-white/60">Wind Speed</p>
              <p class="text-14 leading-15 mb-6">
                {weather.wind.speed}
                <small>{weather.wind.unit}</small>
              </p>

              <p class="text-12 leading-15 text-white/60">Wind Gust</p>
              <p class="text-14 leading-15">
                {weather.wind.gusts}
                <small>{weather.wind.unit}</small>
              </p>
            </div>
          </div>
        </div>

        <div class="flex gap-9 pl-6 bg-white rounded-2 overflow-hidden">
          <img
            src="/beaufort-scale/{weather.wind.image}.png"
            alt="Beaufortimg"
            class="w-1/3 object-cover"
          />
          <p class="text-12 leading-16 pb-3 text-black">
            {weather.wind.description}
          </p>
        </div>
      </div>
    {/if}

    {#if weather.precipitation}
      <div class="dark p-6 aspect-square">
        <p class="mb-3 uppercase text-12">Precipitation</p>
        <div class="flex flex-col items-center">
          {#if weather.precipitation.hasPrecipitation}
            {#if weather.precipitation.hasRain}
              <img
                src="/navweather/drizzle.webp"
                alt="icon"
                class="size-90 object-cover object-bottom mx-auto my-12 rounded-full"
              />
              <p class="mt-3 text-14 font-600">
                {weather.precipitation.formattedRain}
              </p>
              <p class="text-12">in 15 minutes</p>
            {:else if weather.precipitation.hasSnow}
              <img
                src="/navweather/snow.webp"
                alt="icon"
                class="size-90 object-cover object-bottom mx-auto my-12 rounded-full"
              />
              <p class="mt-3 text-14 font-600">
                {weather.precipitation.formattedSnow}
              </p>
              <p class="text-12">in 15 minutes</p>
            {/if}
          {:else}
            <p class="mt-45 text-14 font-600">None</p>
            <p class="text-12">
              {weather.precipitation.precipitationDescription}
            </p>
          {/if}
        </div>
      </div>
    {/if}

    {#if weather.uvIndex}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12 mb-12">UV Index</p>

        <div class="flex flex-col justify-center items-center">
          <div class="relative flex justify-center" aria-hidden="true">
            <svg
              width="100"
              height="100"
              viewBox="5 -12 171 178"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
                transform="rotate(13 90.5 80)"
                fill="none"
                stroke="#5C2E91"
                stroke-width="10"
                stroke-linecap="round"
              ></path>
              <path
                d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
                transform="rotate(-52 90.5 80)"
                fill="none"
                stroke="#D13438"
                stroke-width="10"
                stroke-linecap="round"
              ></path>
              <path
                d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
                transform="rotate(-115 90.5 80)"
                fill="none"
                stroke="#FF8C00"
                stroke-width="10"
                stroke-linecap="round"
              ></path>
              <path
                d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
                transform="rotate(-178 90.5 80)"
                fill="none"
                stroke="#FDE300"
                stroke-width="10"
                stroke-linecap="round"
              ></path>
              <path
                d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
                transform="rotate(-243 90.5 80)"
                fill="none"
                stroke="#73AA24"
                stroke-width="10"
                stroke-linecap="round"
              ></path>
              {#if weather.uvPoint}
                <g>
                  <circle
                    cx={weather.uvPoint.cx}
                    cy={weather.uvPoint.cy}
                    r="10"
                    fill={weather.uvPoint.color}
                  ></circle>
                  <circle
                    cx={weather.uvPoint.cx}
                    cy={weather.uvPoint.cy}
                    r="11.5"
                    stroke="white"
                    stroke-width="3"
                  ></circle>
                </g>
              {/if}
            </svg>
            <div
              class="absolute w-full h-full flex items-center justify-center"
            >
              <div class="text-36 leading-36">{weather.uvIndex.value}</div>
            </div>
          </div>

          <p class="text-14 font-600">{weather.uvIndex.level}</p>
          <p class="text-12 leading-16">
            {weather.uvIndex.description}
          </p>
        </div>
      </div>
    {/if}

    {#if weather.pressure}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12 mb-30">Pressure</p>

        <div class="w-full flex justify-center items-center gap-25">
          <div
            class="w-9 h-100 rounded-full shadow shadow-black/30 relative bg-gradient-to-b from-white via-white to-white/10"
          >
            <span
              class="absolute -left-4 -translate-y-1/2 w-17 h-5 rounded-3 bg-white shadow shadow-black/30"
              style="bottom: {weather.pressure.percent}%;"
            ></span>
          </div>
          <div class="flex flex-col">
            <h1 class="text-20 font-500">
              {weather.pressure.value} <small>hPa</small>
            </h1>
            <p class="text-12 text-center">
              {weather.pressure.description}
            </p>
          </div>
        </div>
      </div>
    {/if}

    {#if weather.humidity}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12 mb-30">Humidity</p>
        <div class="flex items-center justify-center gap-25">
          <div class="relative h-100 w-9 rounded-full bg-white/10">
            <div
              class="float-left w-full rounded-full absolute bottom-0 bg-white/90"
              style="height: {weather.humidity.value}%;"
            ></div>
          </div>

          <div class="flex flex-col gap-6">
            <div class="flex flex-col">
              <p class="text-12 leading-15 text-white/60">Relative Humidity</p>
              <div class="text-14 font-500 leading-18">
                {weather.humidity.value}%
              </div>
            </div>
            <div class="flex flex-col">
              <p class="text-12 leading-15 text-white/60">Dew point</p>
              <div class="text-14 font-500 leading-18">
                {weather.humidity.dewpoint}°
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if weather.cloudcover}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12">Cloud Cover</p>
        <div class="flex flex-col items-center">
          <img
            src="/cloud/{weather.cloudcover.description}.webp"
            alt="icon"
            class="size-90 object-cover mx-auto my-12 rounded-full"
          />
          <p class="mt-3 text-14 font-600">{weather.cloudcover.value}%</p>
          <p class="text-12">{weather.cloudcover.description}</p>
        </div>
      </div>
    {/if}

    {#if weather.visibility}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12">Visibility</p>
        <h1 class="text-36 font-400 leading-50">
          {weather.visibility.value}
          <small>{weather.visibility.unit}</small>
        </h1>
        <p class="text-12">{weather.visibility.description}</p>
      </div>
    {/if}

    {#if weather.sunrise}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12">Sunrise / Sunset</p>
        <div class="relative -mt-40 ml-15 -mb-10">
          <svg
            width="150"
            height="150"
            viewBox="0 0 150 150"
            xmlns="http://w3.org"
          >
            <defs>
              <path
                id="curve"
                d="M 0 125 C 40 110 45 70 75 70 S 110 110 150 125"
                fill="none"
                {@attach captureSunPath}
              />

              <mask id="maskTop">
                <rect x="0" y="0" width="150" height="100" fill="white" />
              </mask>

              <mask id="maskBottom">
                <rect x="0" y="100" width="150" height="50" fill="white" />
              </mask>
            </defs>

            <use
              href="#curve"
              stroke="#efb839"
              stroke-width="6"
              mask="url(#maskTop)"
            />

            <use
              href="#curve"
              stroke="#ffffff1a"
              stroke-width="6"
              mask="url(#maskBottom)"
            />

            <line
              x1="0"
              y1="100"
              x2="150"
              y2="100"
              stroke="black"
              stroke-opacity="0.2"
              stroke-width="1"
            />
          </svg>

          <div
            class="absolute size-15 bg-[#ff6b00] rounded-full -translate-x-1/2 -translate-y-1/2"
            style="box-shadow: 0 0 9px #ff6b00; left: {sunPosition?.x}px; top: {sunPosition?.y}px;"
          ></div>
        </div>

        <div class="flex justify-between">
          <div class="flex flex-col items-start">
            <span class="text-12 text-white/60">Sunrise</span>
            <span class="text-14 font-500">{weather.sunrise.sunrise} </span>
          </div>

          <div class="flex flex-col items-end">
            <span class="text-12 text-white/60">Sunset</span>
            <span class="text-14 font-500">{weather.sunrise.sunset}</span>
          </div>
        </div>
      </div>
    {/if}

    {#if weather.aiq}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12">Air Quality</p>

        <div class="-mt-9 flex flex-col justify-center items-center">
          <div class="size-120 -mb-6 relative flex justify-center items-center">
            <svg
              width="120"
              height="120"
              viewBox="-15 -15 150 150"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              style="transform:rotate(-90deg)"
              class="absolute"
            >
              <circle
                r="50"
                cx="60"
                cy="60"
                fill="transparent"
                stroke="#ffffff1a"
                stroke-width="10"
              ></circle>
              <circle
                r="50"
                cx="60"
                cy="60"
                stroke={weather.aiq.color}
                stroke-width="10"
                stroke-dashoffset="{(100 - weather.aiq.value / 3) * 3}px"
                fill="transparent"
                stroke-dasharray="314px"
              ></circle>
            </svg>

            <div class="flex flex-col items-center">
              <p class="text-16 font-500">{weather.aiq.value}</p>
              <p class="text-12 text-white/60">AQI</p>
            </div>
          </div>

          <span
            class="mb-6 rounded-full text-12 text-black leading-22 font-500 text-center px-10"
            style="background-color: {weather.aiq.color};"
          >
            {weather.aiq.level}
          </span>

          <p class="text-12 text-center">{weather.aiq.description}</p>
        </div>
      </div>
    {/if}

    {#if weather.snow && weather.snow.hasSnow}
      <div class="dark p-6 aspect-square">
        <p class="uppercase text-12">Snow Depth</p>
        <div class="flex flex-col items-center">
          <img
            src="/navweather/snow.webp"
            alt="icon"
            class="size-90 object-cover mx-auto my-12 rounded-full"
          />
          <p class="mt-3 text-14 font-600">{weather.snow.snowDepth}</p>
          <p class="text-12">{weather.snow.description}</p>
        </div>
      </div>
    {/if}
  </div>

  {#if weather.hourly}
    <h1 class="text-24">Hourly Forecast</h1>
    <div class="w-full grid grid-cols-4 gap-2">
      {#each weather.hourly.data as item (item.time)}
        <div class="dark flex flex-col rounded-2 overflow-hidden">
          <h1 class="uppercase text-21 leading-24 font-500 text-center">
            {item.timeLabel.hour}<small>{item.timeLabel.period}</small>
          </h1>

          <div class="light flex-1 w-full relative">
            <img
              src="/navweather/{item.background}.webp"
              alt="wtb"
              class="absolute top-0 left-0 -z-1 w-full h-full object-cover"
            />

            <img
              src="/metoffice/{item.icon}.svg"
              alt="icon"
              class="size-60 object-cover mx-auto mt-12"
              style="filter: drop-shadow(0px 0px 6px rgba(0, 0, 0, 0.3));"
            />
            <p
              class="mb-3 text-12 text-center font-500 leading-18 text-white"
              style="text-shadow: 0px 0px 3px #000000"
            >
              {item.description}
            </p>
            <p
              class="mb-3 text-18 leading-24 text-center font-500 text-white"
              style="text-shadow: 0px 0px 3px #000000"
            >
              {formatTemperature(item.temp)}
            </p>

            {#if item.precipitation_probability}
              <p
                class="mb-9 text-12 leading-16 text-center font-500 text-blue-200"
                style="text-shadow: 0px 0px 3px #000000"
              >
                {item.precipitation_probability}%
              </p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if weather.daily}
    <h1 class="text-24">7-Day Forecast</h1>
    <div class="flex flex-wrap gap-2">
      {#each weather.daily.data as item (item.date)}
        <div
          class="dark w-full h-36 flex items-center justify-between pl-9 rounded-2"
        >
          <div class="flex items-center flex-1">
            <span class="text-16 font-500 min-w-50">
              {formatDay(item.date, weather.daily.time)}</span
            >
            <img
              src="/metoffice/{item.icon}.svg"
              alt="img"
              class="size-32 object-cover"
            />

            <span class="text-center min-w-36 text-12 font-500 text-[#228be6]">
              {#if item.precipitation_probability}
                {item.precipitation_probability}%
              {/if}
            </span>

            <div
              class="text-12 w-120 overflow-hidden whitespace-nowrap text-ellipsis"
            >
              {item.description}
            </div>
          </div>

          <div
            class="flex w-120 overflow-hidden justify-end items-center h-full"
          >
            <div class="text-11 text-white/60 leading-16 min-w-30 text-center">
              {formatTemperature(item.temp_min)}
            </div>

            <div
              class="h-6 mt-3 rounded-full bg-[#228be6]"
              style="min-width: {((Math.round(item.temp_max) -
                Math.round(item.temp_min)) /
                weather.daily.tempScale.range) *
                50}%;"
            ></div>

            <div
              class="min-w-30 text-12 leading-16 text-center"
              style="margin-right: {((weather.daily.tempScale.max -
                Math.round(item.temp_max)) /
                weather.daily.tempScale.range) *
                50}%;"
            >
              {formatTemperature(item.temp_max)}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Container>

<style lang="postcss">
  .current {
    width: 100%;
    background: linear-gradient(
        0deg,
        rgb(255 255 255 / 30%) 0%,
        rgb(142, 187, 213) 60%,
        rgb(87, 175, 226) 100%
      )
      0% 0% no-repeat padding-box padding-box transparent;
    backdrop-filter: blur(6px);
    position: relative;
  }

  .location-list {
    width: 100%;
    position: relative;
    z-index: 99;
    text-align: center;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    background: transparent;
    font-size: 21px;
    outline: none;
    border: none;
  }

  option {
    background-color: #fff;
    color: black;
  }

  option:checked {
    background-color: #eaebeb;
    font-weight: bold;
  }

  option:hover {
    background-color: #eaebeb;
  }

  option:focus-visible {
    outline: none;
    background-color: #dedfdf;
  }

  option::checkmark {
    display: none;
  }
</style>
