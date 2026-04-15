<script lang="ts">
  import { untrack } from "svelte";
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
  import type { WeatherQueryParams } from "$lib/types";
  import {
    addToast,
    currentForecastModel,
    currentLocationId,
    locationList,
    weatherData,
  } from "$lib/store/layoutstore";
  import { saveUserSetting } from "$lib/store/localstore";
  import type { PageProps } from "./$types";
  import FluentEmojiFlatSnowflake from "~icons/fluent-emoji-flat/snowflake";
  import FluentEmojiFlatCloud from "~icons/fluent-emoji-flat/cloud";
  import MaterialSymbolsWaterDrop from "~icons/material-symbols/water-drop";
  import Rainviewer from "$lib/components/Rainviewer.svelte";

  let { data: layoutData }: PageProps = $props();

  type HourlyForecast = {
    time: string;
    temp: number;
    icon: string;
    background: string;
    description: string;
    precipitation_probability: number;
  };

  type DailyForecast = {
    date: string;
    icon: string;
    temp_max: number;
    temp_min: number;
    temp_current?: number;
    feels_like: number;
    precipitation_probability: number;
  };

  let hourlyData = $state<HourlyForecast[]>([]);
  let dailyData = $state<DailyForecast[]>([]);
  let tempScale = $state<{
    min: number;
    max: number;
    range: number;
  }>({
    min: 0,
    max: 0,
    range: 0,
  });

  let currentValues = $state<{
    icon: string;
    actual: number;
    feelsLike: number;
    actualDescription: string;
    background: string;
    forecastStatement: string;
    lastUpdated: string;
    feelsLikeDescription: string;
  }>({
    icon: "nodata",
    actual: 0,
    feelsLike: 0,
    actualDescription: "No data",
    background: "",
    forecastStatement: "No data",
    lastUpdated: "No data",
    feelsLikeDescription: "No data",
  });

  let windValues = $state<{
    windSpeed: number;
    windGusts: number;
    windDirection: number;
    directionLabel: string;
    speedUnit: string;
    image: string;
    description: string;
  }>({
    windSpeed: 0,
    windGusts: 0,
    windDirection: 0,
    directionLabel: "",
    speedUnit: "km/h",
    image: "0",
    description: "",
  });

  let precipitationValues = $state<{
    hasPrecipitation: boolean;
    hasRain: boolean;
    hasSnow: boolean;
    formattedRain: string;
    formattedSnow: string;
    precipitationDescription: string;
  }>({
    hasPrecipitation: false,
    hasRain: false,
    hasSnow: false,
    formattedRain: "mm",
    formattedSnow: "cm",
    precipitationDescription: "No data",
  });

  let pressureValues = $state<{
    pressureHpa: number;
    normalizedValue: number;
    pressureDescription: string;
  }>({
    pressureHpa: 0,
    normalizedValue: 0,
    pressureDescription: "No data",
  });

  let humidityValues = $state<{
    humidity: number;
    dewPoint: number;
    humidityDescription: string;
  }>({
    humidity: 0,
    dewPoint: 0,
    humidityDescription: "No data",
  });

  let cloudCoverValues = $state<{
    cloudCover: number;
    cloudCoverDescription: string;
  }>({
    cloudCover: 0,
    cloudCoverDescription: "No data",
  });

  let visibilityValues = $state<{
    visibilityValue: number;
    visibilityUnit: string;
    visibilityDescription: string;
  }>({
    visibilityValue: 0,
    visibilityUnit: "No data",
    visibilityDescription: "No data",
  });

  let sunValues = $state<{
    sunrise: string;
    sunset: string;
    sunPosition: number;
  }>({
    sunrise: "",
    sunset: "",
    sunPosition: 0,
  });

  let aiqValues = $state<{
    aqi: number;
    level: string;
    color: string;
    description: string;
  }>({ aqi: 0, level: "None", color: "yellow", description: "No data" });

  let uvValues = $state<{
    currentUV: number;
    indicatorPercent: number;
    level: string;
    description: string;
  }>({
    currentUV: 0,
    indicatorPercent: 0,
    level: "No data",
    description: "No data",
  });

  let snowValues = $state<{
    snowDepth: string;
    description: string;
    hasSnow: boolean;
  }>({
    snowDepth: "0",
    description: "No data",
    hasSnow: false,
  });

  function getCurrentConditions() {
    if ($weatherData) {
      const {
        icon: current_icon,
        description: current_description,
        background: current_background,
      } = getWeatherInfo(
        $weatherData.current.weather_code,
        $weatherData.current.is_day,
      );
      let forecastStatement = generateForecastStatement($weatherData);
      const now = Date.now();
      const fulfilledTimeStamp = new Date($weatherData.current.time).getTime();
      const diffMs = Math.max(0, now - fulfilledTimeStamp);
      let lastUpdated = formatRelativeFromMs(diffMs);

      const feelsLike = Math.round($weatherData.current.apparent_temperature);
      const actual = Math.round($weatherData.current.temperature_2m);
      const feelsLikeDescription = getFeelsLikeDescription(
        feelsLike,
        actual,
        $weatherData.current.wind_speed_10m,
        $weatherData.current.relative_humidity_2m,
      );

      currentValues = {
        icon: current_icon,
        actualDescription: current_description,
        background: current_background,
        actual,
        feelsLike,
        forecastStatement,
        lastUpdated,
        feelsLikeDescription,
      };

      let windSpeed = Math.round($weatherData.current.wind_speed_10m || 0);
      let windGusts = Math.round($weatherData.current.wind_gusts_10m || 0);
      let windDirection = $weatherData.current.wind_direction_10m || 0;
      let directionLabel = getWindDirection(windDirection);
      let windInfo = getBeaufortInfo($weatherData.current.wind_speed_10m || 0);

      windValues = {
        windSpeed,
        windGusts,
        windDirection,
        directionLabel,
        speedUnit: "km/h",
        image: windInfo.level,
        description: windInfo.description,
      };

      const tempUnit = "c";
      const rain = $weatherData.current.rain ?? 0;
      const showers = $weatherData.current.showers ?? 0;
      const snowfall = $weatherData.current.snowfall ?? 0;

      // Total liquid precipitation (rain + showers)
      const totalLiquid = rain + showers;

      // Format values
      let formattedRain = formatPrecipitation(tempUnit, totalLiquid);
      let formattedSnow = formatPrecipitation(tempUnit, snowfall);

      // Determine primary precipitation type
      let hasRain = totalLiquid > 0;
      let hasSnow = snowfall > 0;
      let hasPrecipitation = hasRain || hasSnow;

      // Description - optimized with early returns
      const getDescription = (): string => {
        if (!hasPrecipitation) return "No precipitation";
        if (hasRain && hasSnow) return "Mixed precipitation";
        if (hasRain) return totalLiquid < 0.1 ? "Light rain" : "Rain";
        return snowfall < 0.1 ? "Light snow" : "Snow";
      };

      let precipitationDescription = getDescription();

      precipitationValues = {
        hasPrecipitation,
        hasRain,
        hasSnow,
        formattedRain,
        formattedSnow,
        precipitationDescription,
      };

      const pressureValue = $weatherData.current.pressure_msl;
      const pressureHpa = $weatherData.current.pressure_msl || 1013;
      const normalizedValue =
        tempUnit === "c"
          ? Math.max(0, Math.min(100, ((pressureHpa - 1000) / 40) * 100))
          : Math.max(
              0,
              Math.min(100, ((Number(pressureValue) - 29.53) / 1.18) * 100),
            );

      let pressureDescription = getPressureDescription(pressureHpa);

      pressureValues = {
        pressureHpa,
        normalizedValue,
        pressureDescription,
      };

      let humidity = Math.round($weatherData.current.relative_humidity_2m);
      let humidityDescription = getHumidityDescription(humidity);

      humidityValues = {
        humidity,
        dewPoint: Math.round($weatherData.current.dew_point_2m),
        humidityDescription,
      };

      let cloudCover = Math.round($weatherData.current.cloud_cover);
      let cloudCoverDescription = getCloudCoverDescription(cloudCover);

      cloudCoverValues = {
        cloudCover,
        cloudCoverDescription,
      };

      const visibilityMeters = Math.round($weatherData.current.visibility);

      // Convert to miles (imperial) or kilometers (metric)
      const visibilityValue =
        tempUnit === "c"
          ? Math.round(visibilityMeters / 1000) // km (whole number)
          : Math.round((visibilityMeters / 1000) * 0.621371); // mi (whole number)
      const visibilityUnit = tempUnit === "c" ? "km" : "mi";
      const visibilityDescription = getVisibilityDescription(
        visibilityValue,
        tempUnit === "c",
      );

      visibilityValues = {
        visibilityValue,
        visibilityUnit,
        visibilityDescription,
      };

      const sunriseISO = $weatherData.daily.sunrise[0];
      const sunsetISO = $weatherData.daily.sunset[0];
      const sunrise = sunriseISO ? formatTimeWithMinutes(sunriseISO) : "--:--";
      const sunset = sunsetISO ? formatTimeWithMinutes(sunsetISO) : "--:--";
      const sunPosition = calculateSunPosition(
        $weatherData.current.time,
        sunriseISO,
        sunsetISO,
      );

      sunValues = {
        sunrise,
        sunset,
        sunPosition,
      };

      const snowDepthMeters = $weatherData.current.snow_depth ?? 0;
      const hasSnowMetters = snowDepthMeters > 0;

      const formattedSnowDepth = hasSnowMetters
        ? formatSnowDepth(tempUnit, snowDepthMeters)
        : "0";
      let descriptionSnow = "No snow on ground";
      if (hasSnowMetters) {
        const inches = snowDepthMeters * 39.3701;
        if (inches < 1) {
          descriptionSnow = "Light snow cover";
        } else if (inches < 6) {
          descriptionSnow = "Moderate snow depth";
        } else {
          descriptionSnow = "Significant snow depth";
        }
      }

      snowValues = {
        hasSnow: hasSnowMetters,
        snowDepth: formattedSnowDepth,
        description: descriptionSnow,
      };

      const aqi = $weatherData.current.us_aqi || 0;
      const { level: aqi_level, color } = getAQILevel(aqi);
      const aqi_description = getAQIDescription(aqi);
      aiqValues = {
        aqi,
        level: aqi_level,
        color,
        description: aqi_description,
      };

      let currentUV = Math.round($weatherData.current.uv_index || 0);
      const indiNumber = currentUV > 11 ? 12 : currentUV;
      const uvScale = 11;
      const indicatorPercent = (indiNumber / uvScale) * 100;
      const { level: uv_level, description: uv_description } =
        getUVInfo(currentUV);
      uvValues = {
        currentUV,
        indicatorPercent,
        level: uv_level,
        description: uv_description,
      };

      const forecastData = calculateForecast();
      if (forecastData) {
        hourlyData = forecastData.hourlyForecasts;
        dailyData = forecastData.dailyForecasts;
        tempScale = forecastData.tempScale;
      }
    }
  }

  let windTickArray = Array.from({ length: 72 }).map((_, i) => {
    const angle = i * 5;
    const isCardinal = angle % 90 === 0;
    const isMajor = angle % 30 === 0;

    let length = 5;
    let width = 1;
    let opacity = 0.15;

    if (isCardinal) {
      length = 15;
      width = 2;
      opacity = 0.5;
    } else if (isMajor) {
      length = 10;
      width = 1.5;
      opacity = 0.3;
    }

    const rad = (angle * Math.PI) / 180;
    const r1 = 65;
    const r2 = 65 - length;
    const x1 = 75 + r1 * Math.sin(rad);
    const y1 = 75 - r1 * Math.cos(rad);
    const x2 = 75 + r2 * Math.sin(rad);
    const y2 = 75 - r2 * Math.cos(rad);
    return { x1, y1, x2, y2, width, opacity };
  });

  type ForecastResults = {
    hourlyForecasts: HourlyForecast[];
    dailyForecasts: DailyForecast[];
    tempScale: {
      min: number;
      max: number;
      range: number;
    };
  };

  function calculateForecast(): ForecastResults | null {
    if (!$weatherData?.hourly || !$weatherData?.hourly) {
      return null;
    }

    // Parse the hour directly from the ISO string to avoid timezone conversion
    const currentHourIndex = getHourFromISO($weatherData.current.time);
    // Generate hourly forecast starting from current hour
    const hourlyForecasts: HourlyForecast[] = Array.from(
      { length: 12 },
      (_, i) => {
        let { icon, description, background } = getWeatherInfo(
          $weatherData!.hourly.weather_code[i],
          $weatherData!.hourly.is_day[i],
        );
        return {
          time: $weatherData!.hourly.time[i],
          temp: $weatherData!.hourly.temperature_2m[i],
          icon,
          background,
          description,
          precipitation_probability:
            $weatherData!.hourly.precipitation_probability[i],
        };
      },
    ).filter((item): item is HourlyForecast => item !== null);
    // Skip "Today" in daily forecast if it's after 8 PM (late evening)
    // At this point, users are more interested in tomorrow's forecast
    const skipToday = currentHourIndex >= 20;
    const dailyForecastsRaw: DailyForecast[] = $weatherData.daily.time.map(
      (date, index) => {
        let { icon } = getWeatherInfo(
          $weatherData!.daily.weather_code[index],
          1,
        );
        return {
          date,
          icon,
          weather_code: $weatherData!.daily.weather_code[index],
          temp_max: $weatherData!.daily.temperature_2m_max[index],
          temp_min: $weatherData!.daily.temperature_2m_min[index],
          temp_current:
            index === 0 && !skipToday
              ? $weatherData!.hourly.temperature_2m[currentHourIndex]
              : undefined,
          feels_like: $weatherData!.daily.apparent_temperature_max[index],
          precipitation_probability:
            $weatherData!.daily.precipitation_probability_max[index],
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
    const minTempScale = Math.floor(Math.min(...validTemps) - 5);
    const maxTempScale = Math.ceil(Math.max(...validTemps) + 5);
    const tempRange = maxTempScale - minTempScale;

    return {
      hourlyForecasts,
      dailyForecasts,
      tempScale: {
        min: minTempScale,
        max: maxTempScale,
        range: tempRange,
      },
    };
  }

  $effect(() => {
    $weatherData;
    untrack(() => {
      if ($weatherData) getCurrentConditions();
    });
  });

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
    } else {
      saveUserSetting();
      const currentLocation = $locationList.find((item) => item.id === id);
      if (currentLocation) {
        let param: WeatherQueryParams = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          tempUnit: "c",
          model: $currentForecastModel,
        };
        $weatherData = await getOpenMeteoWeather(param);
      }
    }
  }

  function calculateWindRotate(angle: number) {
    let alpha = 0;
    if (angle <= 45) {
      alpha = angle;
    } else if (angle <= 135) {
      alpha = angle - 90;
    } else if (angle <= 225) {
      alpha = angle - 180;
    } else if (angle <= 315) {
      alpha = angle - 270;
    } else {
      alpha = angle - 360;
    }

    if (alpha >= 10 && alpha <= 35) return angle - 90 - (alpha - 10);
    else return angle - 90 - 25;
  }

  function calculateWindDash(angle: number) {
    let alpha = 0;
    if (angle <= 45) {
      alpha = angle;
    } else if (angle <= 135) {
      alpha = angle - 90;
    } else if (angle <= 225) {
      alpha = angle - 180;
    } else if (angle <= 315) {
      alpha = angle - 270;
    } else {
      alpha = angle - 360;
    }

    if (alpha <= -35 || alpha >= 35) return "50 310";
    if (alpha < 10 && alpha > -10)
      return `${25 - alpha - 10} 20 ${25 + alpha - 10} 310`;
    if (alpha >= 10) return `${25 + alpha - 10} ${360 - (25 + alpha - 10)}`;
    if (alpha <= -10) return `${25 - alpha - 10} ${360 - (25 - alpha - 10)}`;
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
</script>

<svelte:head>
  {#if !$showTimer}
    <title>🌧️</title>
  {/if}
  <meta name="Weather" content="Weather" />
</svelte:head>

<Container scrollable>
  {#if $weatherData}
    <div class="current">
      {#if currentValues.background}
        <video
          src="/weathervideos/{currentValues.background}.mp4"
          autoplay
          loop
          muted
          playsinline
          class="absolute top-0 left-0 w-full h-full object-cover object-top"
        >
          Your browser does not support the video tag.
        </video>
      {/if}

      <select
        name="location"
        onchange={(e) => setCurrentLocation(e.currentTarget.value)}
        class="location-list relative mb-6 text-white"
      >
        {#each $locationList as item}
          <option value={item.id} selected={item.id === $currentLocationId}>
            {item.name}
          </option>
        {/each}
      </select>

      <h1
        class="relative select-none indent-30 text-white text-135 font-300 leading-150 overflow-hidden text-center"
      >
        {currentValues.actual}°
      </h1>

      <div class="relative flex justify-center items-center gap-9 mb-3">
        <img
          src="/liquid/128/{currentValues.icon}.png"
          alt="icon"
          class="size-60 object-cover"
          style="filter: drop-shadow(0px 0px 9px rgba(0, 0, 0, 0.3));"
        />
        <span class="text-white text-18 font-400">
          {currentValues.actualDescription}
        </span>
      </div>

      <p class="relative text-white px-6 text-center text-15 leading-18 mb-3">
        {currentValues.forecastStatement}
      </p>
      <p class="relative text-white/60 text-center text-11 mb-3">
        Last updated {currentValues.lastUpdated}
      </p>
    </div>

    <Rainviewer />

    <!-- DetailsGrid -->
    <div class="w-full grid grid-cols-2 gap-2">
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Feels Like</p>
        <h1 class="text-48 font-400">
          {currentValues.feelsLike}°
        </h1>
        <p class="text-12">{currentValues.feelsLikeDescription}</p>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Wind</p>

        <div class="mx-auto size-110 relative" aria-hidden="true">
          <svg
            width="110"
            height="110"
            viewBox="0 0 180 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(90, 90) rotate(-80)">
              <circle
                r="80"
                stroke="#0000001a"
                stroke-width="8"
                pathLength="360"
                stroke-dasharray="70 290"
                stroke-linecap="round"
                fill="none"
              />
            </g>

            <g transform="translate(90, 90) rotate(10)">
              <circle
                r="80"
                stroke="#0000001a"
                stroke-width="8"
                pathLength="360"
                stroke-dasharray="70 290"
                stroke-linecap="round"
                fill="none"
              />
            </g>

            <g transform="translate(90, 90) rotate(100)">
              <circle
                r="80"
                stroke="#0000001a"
                stroke-width="8"
                pathLength="360"
                stroke-dasharray="70 290"
                stroke-linecap="round"
                fill="none"
              />
            </g>

            <g transform="translate(90, 90) rotate(190)">
              <circle
                r="80"
                stroke="#0000001a"
                stroke-width="8"
                pathLength="360"
                stroke-dasharray="70 290"
                stroke-linecap="round"
                fill="none"
              />
            </g>

            <path
              d="M 86.325 40.3742 C 86.9141 37.7765 90.5908 37.7098 91.2738 40.2843 L 112.0053 118.42840000000001 C 113.7162 124.8774 108.87360000000001 131.20420000000001 102.2016 131.23680000000002 L 78.5064 131.35250000000002 C 71.94605 131.3845 67.06373 125.3014 68.51471 118.9034 L 86.325 40.3742Z"
              fill="#228be6"
              transform="rotate({windValues.windDirection - 180} 90 90)"
            >
            </path>

            <g
              transform="translate(90, 90) rotate({calculateWindRotate(
                windValues.windDirection,
              )})"
            >
              <circle
                r="80"
                stroke="#228be6"
                stroke-width="8"
                pathLength="360"
                stroke-dasharray={calculateWindDash(windValues.windDirection)}
                stroke-linecap="round"
                fill="none"
              />
            </g>
          </svg>

          <div class="text-12 absolute top-0 left-1/2 -translate-x-1/2">N</div>
          <div class="text-12 absolute bottom-0 left-1/2 -translate-x-1/2">
            S
          </div>
          <div
            class="text-12 absolute top-1/2 left-7 -translate-x-1/2 -translate-y-1/2"
          >
            W
          </div>
          <div
            class="text-12 absolute top-1/2 right-7 translate-x-5 -translate-y-1/2"
          >
            E
          </div>
        </div>

        <div class="flex justify-between">
          <div class="flex flex-col my-6 gap-5">
            <p class="text-12 leading-15">
              From {windValues.directionLabel} ({windValues.windDirection}°)
            </p>
            <div class="flex gap-3 items-center">
              <div class="text-30 font-500 leading-30">
                {windValues.windSpeed}
              </div>
              <div class="flex flex-col">
                <p class="text-12 text-black/60 leading-15">
                  {windValues.speedUnit}
                </p>
                <p class="text-12 leading-15">Wind Speed</p>
              </div>
            </div>

            <div class="flex gap-3 items-center">
              <div class="text-30 font-500 leading-30">
                {windValues.windGusts}
              </div>
              <div class="flex flex-col">
                <p class="text-12 text-black/60 leading-15">
                  {windValues.speedUnit}
                </p>
                <p class="text-12 leading-15">Wind Gust</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-9 pl-6 bg-white rounded-2 overflow-hidden">
          <img
            src="/beaufort-scale/{windValues.image}.png"
            alt="Beaufortimg"
            class="w-1/3 object-cover"
          />
          <p class="text-12 leading-16 pb-3">{windValues.description}</p>
        </div>
      </div>
      <div class="light p-6 w-full">
        <p class="mb-3 uppercase text-12">Precipitation</p>
        <div class="flex flex-col items-center">
          {#if precipitationValues.hasPrecipitation}
            {#if precipitationValues.hasRain}
              <MaterialSymbolsWaterDrop
                width="50"
                height="50"
                color="#228be6"
              />
              <p class="mt-3 text-14 font-600">
                {precipitationValues.formattedRain}
              </p>
              <p class="text-12">in 15 minutes</p>
            {:else if precipitationValues.hasSnow}
              <FluentEmojiFlatSnowflake width="50" height="50" />
              <p class="mt-3 text-14 font-600">
                {precipitationValues.formattedSnow}
              </p>
              <p class="text-12">in 15 minutes</p>
            {/if}
          {:else}
            <p class="mt-45 text-14 font-600">None</p>
            <p class="text-12">
              {precipitationValues.precipitationDescription}
            </p>
          {/if}
        </div>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">UV Index</p>

        <div class="relative flex justify-center" aria-hidden="true">
          <svg
            width="134"
            height="134"
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
              stroke-width="8"
              stroke-linecap="round"
            ></path>
            <path
              d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
              transform="rotate(-52 90.5 80)"
              fill="none"
              stroke="#D13438"
              stroke-width="8"
              stroke-linecap="round"
            ></path>
            <path
              d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
              transform="rotate(-115 90.5 80)"
              fill="none"
              stroke="#FF8C00"
              stroke-width="8"
              stroke-linecap="round"
            ></path>
            <path
              d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
              transform="rotate(-178 90.5 80)"
              fill="none"
              stroke="#FDE300"
              stroke-width="8"
              stroke-linecap="round"
            ></path>
            <path
              d="M 90.5 80 m 76 0 a 76 76 0 0 1 -32 62.3 "
              transform="rotate(-243 90.5 80)"
              fill="none"
              stroke="#73AA24"
              stroke-width="8"
              stroke-linecap="round"
            ></path>
            {#if uvValues.currentUV}
              <g>
                <circle
                  cx={uvCoordinates[uvValues.currentUV - 1]?.cx}
                  cy={uvCoordinates[uvValues.currentUV - 1]?.cy}
                  r="10"
                  fill={uvCoordinates[uvValues.currentUV - 1]?.color}
                ></circle>
                <circle
                  cx={uvCoordinates[uvValues.currentUV - 1]?.cx}
                  cy={uvCoordinates[uvValues.currentUV - 1]?.cy}
                  r="11.5"
                  stroke="white"
                  stroke-width="3"
                ></circle>
              </g>
            {/if}
          </svg>
          <div class="absolute w-full h-full flex items-center justify-center">
            <div class="text-36 leading-36">{uvValues.currentUV}</div>
          </div>
        </div>

        <p class="text-14 font-600">{uvValues.level}</p>
        <p class="text-12 leading-16">
          {uvValues.description}
        </p>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Pressure</p>

        <div class="w-full px-12 mb-6 flex justify-between items-center">
          <div class="flex flex-col items-center justify-between">
            <div class="text-12 mb-3 font-500">High</div>
            <div
              class="w-6 h-100 rounded-3 relative bg-gradient-to-b from-white/20 via-white to-white/20"
            >
              <span
                class="absolute -left-4 -translate-y-1/2 w-14 h-4 rounded-3 bg-white shadow shadow-black/30"
                style="bottom: {pressureValues.normalizedValue}%;"
              ></span>
            </div>
            <div class="text-12 mt-3 font-500">Low</div>
          </div>
          <div class="flex flex-col">
            <h1 class="text-24 font-500">
              {pressureValues.pressureHpa} <small>hPa</small>
            </h1>
            <p class="text-12 text-center">
              {pressureValues.pressureDescription}
            </p>
          </div>
        </div>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12 mb-24">Humidity</p>
        <div class="flex items-center justify-center gap-30">
          <div class="relative h-100 w-10 rounded-8 bg-black/10">
            <div
              class="float-left w-10 rounded-8 absolute bottom-0 bg-[#228be6]"
              style="height: {humidityValues.humidity}%;"
            ></div>
          </div>

          <div class="flex flex-col gap-6">
            <div class="flex flex-col">
              <div class="text-30 font-500 leading-30">
                {humidityValues.humidity}%
              </div>
              <p class="text-12 leading-15">Relative Humidity</p>
            </div>
            <div class="flex flex-col">
              <div class="text-30 font-500 leading-30">
                {humidityValues.dewPoint}°
              </div>
              <p class="text-12 leading-15">Dew point</p>
            </div>
          </div>
        </div>
      </div>

      <div class="light p-6 w-full">
        <p class="uppercase text-12">Cloud Cover</p>
        <div class="flex flex-col items-center">
          <FluentEmojiFlatCloud width="50" height="50" />
          <p class="mt-3 text-14 font-600">{cloudCoverValues.cloudCover}%</p>
          <p class="text-12">{cloudCoverValues.cloudCoverDescription}</p>
        </div>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Visibility</p>
        <h1 class="text-48 font-400">
          {visibilityValues.visibilityValue}
          <small>{visibilityValues.visibilityUnit}</small>
        </h1>
        <p class="text-12">{visibilityValues.visibilityDescription}</p>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Sunrise / Sunset</p>

        <div class="h-80 relative">
          <svg
            width="100%"
            height="80"
            viewBox="0 0 200 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 20 60 Q 100 10, 180 60"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              opacity="0.2"
            />

            <path
              d="M 20 60 Q 100 10, 180 60"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              opacity="0.6"
              stroke-dasharray={`${sunValues.sunPosition * 2.2} 220`}
            />

            <circle cx="20" cy="60" r="3" fill="currentColor" opacity="0.4" />

            <circle cx="180" cy="60" r="3" fill="currentColor" opacity="0.4" />
          </svg>

          <div
            style="position: absolute; 
            left: {10 + sunValues.sunPosition * 0.8}%; 
            top: {60 -
              Math.sin((sunValues.sunPosition / 100) * Math.PI) * 37}px; 
                transform: translate(-50%, -50%);
                 width: 20;
                  height: 20;
                  overflow: hidden"
          >
            <img
              src="/openmeteo/icons/01d.svg"
              alt="sunicon"
              class="size-20 object-cover"
            />
          </div>
        </div>

        <div class="flex justify-between">
          <div class="flex flex-col items-start">
            <span class="text-12">Sunrise</span>
            <span class="text-14 font-600">{sunValues.sunrise} </span>
          </div>

          <div class="flex flex-col items-end">
            <span class="text-12">Sunset</span>
            <span class="text-14 font-600">{sunValues.sunset}</span>
          </div>
        </div>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Air Quality</p>

        <div class="size-100 mx-auto relative flex justify-center items-center">
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
              stroke="#e0e0e0"
              stroke-width="9"
            ></circle>
            <circle
              r="50"
              cx="60"
              cy="60"
              stroke={aiqValues.color}
              stroke-width="10"
              stroke-dashoffset="{(100 - aiqValues.aqi / 3) * 3}px"
              fill="transparent"
              stroke-dasharray="314px"
            ></circle>
          </svg>

          <div class="flex flex-col items-center">
            <p class="text-16 font-500">{Math.round(aiqValues.aqi)}</p>
            <p class="text-12 text-black/60">AQI</p>
          </div>
        </div>

        <div
          class="w-4/5 h-22 mx-auto rounded-full text-12 leading-22 font-600 text-center"
          style="background-color: {aiqValues.color};"
        >
          {aiqValues.level}
        </div>

        <p class="text-12 text-center">{aiqValues.description}</p>
      </div>
      {#if snowValues.hasSnow}
        <div class="light p-6 w-full">
          <p class="uppercase text-12">Snow Depth</p>
          <img
            src="/liquid/128/snow.png"
            alt="icon"
            class="size-60 object-cover mx-auto"
          />
          <p class="text-14 font-600">{snowValues.snowDepth}</p>
          <p class="text-12">{snowValues.description}</p>
        </div>
      {/if}
    </div>

    <h1 class="text-24">Hourly Forecast</h1>
    <div class="w-full grid grid-cols-4 gap-2">
      {#each hourlyData as item}
        <div class="light flex flex-col rounded-2 overflow-hidden">
          <h1 class="pt-9 uppercase text-21 leading-24 font-500 text-center">
            {@html formatTime(item.time)}
          </h1>

          <div class="light h-150 w-full relative">
            <img
              src="/navweather/{item.background}.webp"
              alt="wtb"
              class="absolute top-0 left-0 -z-1 w-full h-full object-cover"
            />

            <img
              src="/liquid/128/{item.icon}.png"
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
                class="text-12 leading-16 text-center font-500 text-blue-200"
                style="text-shadow: 0px 0px 3px #000000"
              >
                {item.precipitation_probability}%
              </p>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <h1 class="text-24">7-Day Forecast</h1>
    <div class="flex flex-wrap gap-2">
      {#each dailyData as item}
        <div class="light w-full h-36 flex px-9 rounded-2">
          <div class="flex items-center">
            <span class="text-16 font-500 min-w-60">
              {formatDay(item.date, $weatherData.current.time)}</span
            >
            <img
              src="/liquid/48/{item.icon}.png"
              alt="img"
              class="size-32 object-cover"
            />

            <span class="text-center min-w-36 text-12 font-500 text-[#228be6]">
              {#if item.precipitation_probability}
                {item.precipitation_probability}%
              {/if}
            </span>
          </div>

          <div class="flex justify-start items-center flex-1 h-full">
            <span class="text-12 text-black/60 min-w-30 text-center">
              {formatTemperature(item.temp_min)}
            </span>

            <span
              class="h-5 rounded-full bg-[#228be6]"
              style="width: {((item.temp_max - item.temp_min) /
                tempScale.range) *
                50}%;"
            ></span>

            <span
              class="min-w-30 text-12 text-center"
              style="margin-right: {((item.temp_min - tempScale.min) /
                tempScale.range) *
                50}%;"
            >
              {formatTemperature(item.temp_max)}
            </span>
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
