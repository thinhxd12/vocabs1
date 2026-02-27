<script lang="ts">
  import { onMount } from "svelte";
  import { getOpenMeteoWeather } from "$lib/utils/functions";
  import Container from "$lib/components/Container.svelte";
  import { weatherData } from "$lib/store/navstore";
  import {
    getAQIDescription,
    getAQILevel,
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
  import type { DBSelect, WeatherQueryParams } from "$lib/types";
  import {
    currentWeatherIndex,
    handleChangeWeatherLocation,
    locationList,
  } from "$lib/store/localstore";

  type HourlyForecast = {
    time: string;
    temp: number;
    icon: string;
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
    forecastStatement: string;
    lastUpdated: string;
    feelsLikeDescription: string;
  }>({
    icon: "nodata",
    actual: 0,
    feelsLike: 0,
    actualDescription: "No data",
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
  }>({
    windSpeed: 0,
    windGusts: 0,
    windDirection: 0,
    directionLabel: "",
    speedUnit: "km/h",
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
      const { icon: current_icon, description: current_description } =
        getWeatherInfo(
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
      const feelsLikeDescription = getFeelsLikeDescription(feelsLike, actual);

      currentValues = {
        icon: current_icon,
        actualDescription: current_description,
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

      windValues = {
        windSpeed,
        windGusts,
        windDirection,
        directionLabel,
        speedUnit: "km/h",
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

      const currentUV = Math.round($weatherData.current.uv_index || 0);
      const uvScale = 11;
      const indicatorPercent = (currentUV / uvScale) * 100;
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
        let { icon, description } = getWeatherInfo(
          $weatherData!.hourly.weather_code[i],
          $weatherData!.hourly.is_day[i],
        );
        return {
          time: $weatherData!.hourly.time[i],
          temp: $weatherData!.hourly.temperature_2m[i],
          icon,
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

  onMount(() => {
    getCurrentConditions();
  });

  let location = $state<DBSelect["weather_table"] | undefined>(
    $locationList[$currentWeatherIndex],
  );

  async function handleChangeDefaultLocation(index: number) {
    handleChangeWeatherLocation(index);
    let param: WeatherQueryParams = {
      latitude: location!.lat,
      longitude: location!.lon,
      tempUnit: "c",
    };
    $weatherData = await getOpenMeteoWeather(param);
    getCurrentConditions();
  }
</script>

<svelte:head>
  <title>🌧️</title>
  <meta name="Weather" content="Weather" />
</svelte:head>

<Container zIndex={6} scrollable>
  {#if $weatherData}
    <div class="current">
      <select
        name="location"
        bind:value={location}
        onchange={(e) =>
          handleChangeDefaultLocation(e.currentTarget.selectedIndex)}
        class="location-list mb-6"
      >
        {#each $locationList as item}
          <option value={item} class="hover:bg-red-500 hover:text-white">
            {item.name}
          </option>
        {/each}
      </select>

      <h1
        class="indent-30 text-[120px] font-300 leading-100 h-100 overflow-hidden mb-9 text-center"
      >
        {currentValues.actual}°
      </h1>

      <div class="flex justify-center items-center gap-9 h-50 mb-6">
        <img
          src="/liquid/128/{currentValues.icon}.png"
          alt="icon"
          class="size-60 object-cover"
        />
        <span class="text-[#212529] text-21 font-400"
          >{currentValues.actualDescription}</span
        >
      </div>

      <p class="text-center text-16 mb-6">
        Feels Like: {currentValues.feelsLike}°C
      </p>
      <p class="px-6 text-center text-15 text-[#343a40]">
        {currentValues.forecastStatement}
      </p>
      <p class="text-center text-12 mb-6 text-[#343a40]">
        Last updated {currentValues.lastUpdated}
      </p>
    </div>

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
        <div class="relative w-[120px] h-[120px] ml-30 mb-6">
          <span
            class="absolute -top-5 left-1/2 -translate-x-1/2 text-12 leading-12"
            >N</span
          >
          <span
            class="absolute top-1/2 -right-2 -translate-y-1/2 text-12 leading-12"
            >E</span
          >
          <span
            class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-12 leading-12"
            >S</span
          >
          <span
            class="absolute top-1/2 -left-6 -translate-y-1/2 text-12 leading-12"
            >W</span
          >

          <svg
            width="120"
            height="120"
            viewBox="0 0 150 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="absolute top-0 left-0 overflow-visible"
          >
            <circle
              cx="75"
              cy="75"
              r="65"
              stroke="currentColor"
              stroke-width="1.5"
              opacity="0.15"
              fill="none"
            />

            {#each windTickArray as tick, i}
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="currentColor"
                stroke-width={tick.width}
                opacity={tick.opacity}
              />
            {/each}

            <g transform={`rotate(${windValues.windDirection + 180} 75 75)`}>
              <path
                d="M75 12 L71 25 L75 22 L79 25 Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M75 22 L75 50"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                opacity="0.9"
              />
            </g>

            <text
              x="75"
              y="79"
              text-anchor="middle"
              font-size="18"
              font-weight="500"
              fill="currentColor"
            >
              {windValues.windSpeed}
            </text>
            <text
              x="75"
              y="92"
              text-anchor="middle"
              font-size="10"
              fill="currentColor"
              opacity="0.6"
            >
              {windValues.speedUnit}
            </text>
          </svg>
        </div>
        <div class="grid grid-cols-2 text-center">
          <div>
            <p class="text-12">Gust</p>
            <p class="text-14 font-500">
              {windValues.windGusts}
              {windValues.speedUnit}
            </p>
          </div>
          <div>
            <p class="text-12">Direction</p>
            <p class="text-14 font-500">
              {windValues.windDirection}° {windValues.directionLabel}
            </p>
          </div>
        </div>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Precipitation</p>
        {#if precipitationValues.hasPrecipitation}
          {#if precipitationValues.hasRain}
            <img
              src="/liquid/128/rain.png"
              alt="icon"
              class="size-60 object-cover mx-auto"
            />
            <p class="text-14 font-600">{precipitationValues.formattedRain}</p>
            <p class="text-12">Rain</p>
          {:else if precipitationValues.hasSnow}
            <img
              src="/liquid/128/snow.png"
              alt="icon"
              class="size-90 object-cover"
            />
            <p class="text-14 font-600">{precipitationValues.formattedSnow}</p>
            <p class="text-12">Snow</p>
          {/if}
        {:else}
          <p class="text-14 font-600">None</p>
          <p class="text-12">{precipitationValues.precipitationDescription}</p>
        {/if}
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">UV Index</p>
        <h1 class="text-48 leading-48 font-400 pl-6">
          {uvValues.currentUV}
        </h1>
        <p class="text-14 font-600 mb-9 px-6">{uvValues.level}</p>
        <div
          class="relative h-6 rounded-full mb-6 w-4/5 mx-auto"
          style="background: linear-gradient(to right, #22c55e 0%, #eab308 30%, #f97316 60%, #ef4444 80%, #ec4899 100%);"
        >
          <div
            class="absolute top-3 size-12 bg-white border-2 border-black/80 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm shadow-black/60"
            style="left: {uvValues.indicatorPercent}%;"
          ></div>
        </div>
        <p class="text-12 px-6">{uvValues.description}</p>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12 mb-15">Pressure</p>
        <h1 class="text-20 mb-15 text-center">
          {pressureValues.pressureHpa} hPa
        </h1>
        <div class="w-full flex justify-center">
          <progress value={pressureValues.normalizedValue} max="100"></progress>
        </div>
        <div class="w-full flex justify-between text-12 mb-6">
          <span>Low</span>
          <span>High</span>
        </div>
        <p class="text-12 text-center">{pressureValues.pressureDescription}</p>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Humidity</p>

        <svg
          width="120"
          height="120"
          viewBox="-15 -15 150 150"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          style="transform:rotate(-90deg)"
          class="ml-30"
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
            stroke="#228be6"
            stroke-width="10"
            stroke-dashoffset="{(100 - humidityValues.humidity) * 3}px"
            fill="transparent"
            stroke-dasharray="314px"
          ></circle>
          <text
            x="37px"
            y="67px"
            fill="#000000"
            font-size="20px"
            font-weight="bold"
            style="transform:rotate(90deg) translate(8px, -120px)"
            >{humidityValues.humidity}%</text
          >
        </svg>

        <p class="text-12 text-center">
          Dew point: {humidityValues.dewPoint}°
        </p>
        <p class="text-12 text-center">{humidityValues.humidityDescription}</p>
      </div>
      <div class="light p-6 w-full">
        <p class="uppercase text-12">Cloud Cover</p>
        <img
          src="/liquid/128/cloud.png"
          alt="icon"
          class="size-60 object-cover mx-auto"
        />
        <p class="text-14 font-600 mb-6 pl-9">{cloudCoverValues.cloudCover}%</p>
        <div class="w-full flex justify-center h-6 mb-6">
          <progress value={cloudCoverValues.cloudCover} max="100"></progress>
        </div>
        <p class="text-12 pl-9">{cloudCoverValues.cloudCoverDescription}</p>
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
            <div class="size-20 flex items-center justify-center">
              <img
                src="/liquid/48/sun.png"
                alt="icon"
                class="size-20 object-cover"
              />
            </div>
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
        <div class="light p-6 w-full">
          <p class="text-center text-14 font-600">{formatTime(item.time)}</p>
          <img
            src="/liquid/128/{item.icon}.png"
            alt="icon"
            class="size-60 object-cover mx-auto"
          />
          <p class="text-18 text-center font-500">
            {formatTemperature("c", item.temp)}
          </p>
          <p class="text-12 text-center w-full">{item.description}</p>
        </div>
      {/each}
    </div>

    <h1 class="text-24">7-Day Forecast</h1>
    <div class="flex flex-wrap gap-2">
      {#each dailyData as item}
        <div class="light w-full flex items-center px-9 py-3">
          <div class="flex items-center gap-3">
            <span class="text-18 font-500 min-w-50">
              {formatDay(item.date, $weatherData.current.time)}</span
            >
            <img
              src="/liquid/48/{item.icon}.png"
              alt="img"
              class="size-32 object-cover"
            />
            <span class="text-12 text-black/60 min-w-30 text-center">
              {formatTemperature("c", item.temp_min)}
            </span>
          </div>

          <div class="flex flex-1 items-center gap-3">
            <div class="px-6 flex-1">
              <div
                class="h-4 rounded-full bg-[#228be6]"
                style="width: {((item.temp_max - item.temp_min) /
                  tempScale.range) *
                  100}%; margin-left: {((item.temp_min - tempScale.min) /
                  tempScale.range) *
                  100}%"
              ></div>
            </div>

            <span class="min-w-30 text-12 text-right">
              {formatTemperature("c", item.temp_max)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Container>

<style>
  .current {
    width: 100%;
    background: linear-gradient(
        0deg,
        rgb(255 255 255 / 30%) 0%,
        rgb(171, 203, 222) 100%
      )
      0% 0% no-repeat padding-box padding-box transparent;
    backdrop-filter: blur(6px);
  }

  progress::-webkit-progress-bar {
    width: 100%;
    height: 10px;
    background-color: #e9ecef;
    border-radius: 10px;
    overflow: hidden;
  }

  progress::-webkit-progress-value {
    background-color: #228be6;
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
