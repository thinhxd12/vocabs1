/**
 * Source
 * https://github.com/gregrickaby/local-weather/blob/main/lib/utils/conditions.ts
 */

function getRangeBasedValue<T>(
  value: number,
  ranges: Array<{ max: number; result: T }>
): T {
  for (const range of ranges) {
    if (value <= range.max) {
      return range.result;
    }
  }
  // Return last range's result as fallback
  return ranges.at(-1)!.result;
}

/**
 * Static weather code descriptions (shared for day and night).
 * Stored outside function to avoid recreation on each call.
 */
const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const WEATHER_CODE_TO_LIQUID_ICON: Record<number, string> = {
  0: "sun", // Clear sky
  1: "sun", // Mainly clear
  2: "partlycloud", // Partly cloudy
  3: "cloud", // Overcast
  45: "fog", // Fog
  48: "fog", // Depositing rime fog
  51: "lightrainsun", // Light drizzle
  53: "lightrainsun", // Moderate drizzle
  55: "lightrain", // Dense drizzle
  56: "sleet", // Light freezing drizzle
  57: "sleet", // Dense freezing drizzle
  61: "lightrainsun", // Slight rain
  63: "rain", // Moderate rain
  65: "rainthunder", // Heavy rain
  66: "sleetsun", // Slight freezing rain
  67: "sleet", // Heavy freezing rain
  71: "sleetsun", // Slight snow
  73: "snow", // Moderate snow
  75: "snow", // Heavy snow
  77: "snowthunder", // Snow grains
  80: "lightrainsun", // Slight rain showers
  81: "rain", // Moderate rain showers
  82: "rainthunder", // Violent rain showers
  85: "sleetsun", // Slight snow showers
  86: "sleetsun", // Heavy snow showers
  95: "rainthunder", // Thunderstorm
  96: "lightrainthundersun", // Thunderstorm with slight hail
  99: "lightrainthundersun", // Thunderstorm with heavy hail
};

const WEATHER_CODE_TO_BACKGROUND: Record<number, string> = {
  0: "clear", // Clear sky
  1: "clear", // Mainly clear
  2: "partly-cloudy", // Partly cloudy
  3: "cloudy", // Overcast
  45: "foggy", // Fog
  48: "foggy", // Depositing rime fog
  51: "rain", // Light drizzle
  53: "rain", // Moderate drizzle
  55: "rain", // Dense drizzle
  56: "rain", // Light freezing drizzle
  57: "rain", // Dense freezing drizzle
  61: "rain", // Slight rain
  63: "rain", // Moderate rain
  65: "rain", // Heavy rain
  66: "rain", // Slight freezing rain
  67: "rain", // Heavy freezing rain
  71: "snow", // Slight snow
  73: "snow", // Moderate snow
  75: "snow", // Heavy snow
  77: "snow", // Snow grains
  80: "rain", // Slight rain showers
  81: "rain", // Moderate rain showers
  82: "rain", // Violent rain showers
  85: "snow", // Slight snow showers
  86: "snow", // Heavy snow showers
  95: "thunderstorm", // Thunderstorm
  96: "thunderstorm", // Thunderstorm with slight hail
  99: "thunderstorm", // Thunderstorm with heavy hail
};

export function getWeatherInfo(
  code: number,
  isday: number = 0
): {
  description: string;
  icon: string;
  background: string;
} {
  const dayNight = isday ? "" : "-night";
  const description = WEATHER_CODE_DESCRIPTIONS[code] || "Unknown";
  const liquidIcon = WEATHER_CODE_TO_LIQUID_ICON[code] || "nodata";
  const backgroundImage = WEATHER_CODE_TO_BACKGROUND[code] || "cloudy";

  // Some icons don't have day/night variants, so we append conditionally
  const iconsWithoutDayNight = new Set([
    "cloud",
    "fog",
    "lightrain",
    "lightrainthunder",
    "rain",
    "rainthunder",
    "sleet",
    "sleetthunder",
    "snow",
    "snowthunder",
  ]);

  const icon = iconsWithoutDayNight.has(liquidIcon)
    ? liquidIcon
    : `${liquidIcon}${dayNight}`;

  const background =
    backgroundImage === "clear"
      ? isday
        ? "clear-day"
        : "clear-night"
      : backgroundImage;
  return {
    description,
    icon,
    background,
  };
}

/**
 * Convert wind direction degrees to cardinal direction.
 *
 * @param degrees - Wind direction in degrees (0-360)
 * @returns Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Get UV level and description based on UV index.
 *
 * @param uv - UV index value
 * @returns Object with level and description
 */
export function getUVInfo(uv: number): { level: string; description: string } {
  return getRangeBasedValue(uv, [
    {
      max: 2,
      result: { level: "Low", description: "Low for the rest of the day" },
    },
    {
      max: 5,
      result: { level: "Moderate", description: "Some protection required" },
    },
    { max: 7, result: { level: "High", description: "Protection essential" } },
    {
      max: 10,
      result: { level: "Very High", description: "Extra protection needed" },
    },
    {
      max: Infinity,
      result: { level: "Extreme", description: "Stay inside if possible" },
    },
  ]);
}

/**
 * Get AQI level and color based on US AQI scale.
 *
 * @param aqi - Air Quality Index value
 * @returns Object with level and color
 */
export function getAQILevel(aqi: number): { level: string; color: string } {
  return getRangeBasedValue(aqi, [
    { max: 50, result: { level: "Good", color: "#50ccaa" } },
    { max: 100, result: { level: "Moderate", color: "#f0e641" } },
    {
      max: 150,
      result: { level: "Unhealthy for Sensitive", color: "#f0a741" },
    },
    { max: 200, result: { level: "Unhealthy", color: "#ff5050" } },
    { max: 300, result: { level: "Very Unhealthy", color: "#960032" } },
    { max: Infinity, result: { level: "Hazardous", color: "#7d2181" } },
  ]);
}

/**
 * Get AQI health description.
 *
 * @param aqi - Air Quality Index value
 * @returns Health description string
 */
export function getAQIDescription(aqi: number): string {
  return getRangeBasedValue(aqi, [
    { max: 50, result: "Air quality is satisfactory" },
    { max: 100, result: "Acceptable for most people" },
    { max: 150, result: "Unhealthy for sensitive groups" },
    { max: 200, result: "Everyone may experience effects" },
    { max: 300, result: "Health alert: everyone affected" },
    { max: Infinity, result: "Health warning of emergency conditions" },
  ]);
}

/**
 * Get humidity comfort description.
 *
 * @param humidity - Relative humidity percentage (0-100)
 * @returns Comfort description string
 */
export function getHumidityDescription(humidity: number): string {
  return getRangeBasedValue(humidity, [
    { max: 29, result: "Dry conditions" },
    { max: 59, result: "Comfortable" },
    { max: 79, result: "Slightly humid" },
    { max: Infinity, result: "Very humid" },
  ]);
}

/**
 * Get pressure trend description (uses hPa values regardless of display unit).
 *
 * @param pressureHpa - Pressure in hectopascals
 * @returns Pressure description string
 */
export function getPressureDescription(pressureHpa: number): string {
  // For >= logic, check from highest to lowest
  if (pressureHpa >= 1020) return "High pressure";
  if (pressureHpa >= 1010) return "Normal pressure";
  if (pressureHpa >= 1000) return "Low pressure";
  return "Very low pressure";
}

/**
 * Get visibility quality description.
 *
 * @param distance - Visibility distance value
 * @param isMetric - Whether using metric units (km vs miles)
 * @returns Visibility description string
 */
export function getVisibilityDescription(
  distance: number,
  isMetric: boolean
): string {
  const ranges = isMetric
    ? [
        { min: 16, result: "Excellent visibility" },
        { min: 10, result: "Very good visibility" },
        { min: 5, result: "Good visibility" },
        { min: 2, result: "Moderate visibility" },
      ]
    : [
        { min: 10, result: "Excellent visibility" },
        { min: 6, result: "Very good visibility" },
        { min: 3, result: "Good visibility" },
        { min: 1, result: "Moderate visibility" },
      ];

  // Check from highest to lowest threshold
  for (const range of ranges) {
    if (distance >= range.min) {
      return range.result;
    }
  }
  return "Poor visibility";
}

/**
 * Get feels like comparison description.
 *
 * @param feels - Apparent/feels like temperature
 * @param actual - Actual temperature
 * @returns Comparison description string
 */
export function getFeelsLikeDescription(feels: number, actual: number): string {
  const diff = feels - actual;
  const absDiff = Math.abs(diff);

  if (absDiff < 2) return "Similar to actual temperature";
  if (diff > 5) return `Feels much warmer (${Math.round(diff)}° warmer)`;
  if (diff < -5) return `Feels much cooler (${Math.round(absDiff)}° cooler)`;
  return diff > 0
    ? `Feels ${Math.round(diff)}° warmer`
    : `Feels ${Math.round(absDiff)}° cooler`;
}

/**
 * Get cloud cover description based on percentage.
 *
 * @param percentage - Cloud cover percentage (0-100)
 * @returns Cloud cover description string
 */
export function getCloudCoverDescription(percentage: number): string {
  return getRangeBasedValue(percentage, [
    { max: 10, result: "Clear sky" },
    { max: 25, result: "Mostly clear" },
    { max: 50, result: "Partly cloudy" },
    { max: 75, result: "Mostly cloudy" },
    { max: Infinity, result: "Overcast" },
  ]);
}
