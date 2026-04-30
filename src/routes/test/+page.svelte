<script lang="ts">
  const timeZoneFormatterCache = new Map<string, Intl.DateTimeFormat>();

  const getTimeZoneFormatter = (timeZone: string) => {
    let formatter = timeZoneFormatterCache.get(timeZone);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat("ia", {
        timeZone,
        timeZoneName: "shortOffset",
      });
      timeZoneFormatterCache.set(timeZone, formatter);
    }
    return formatter;
  };

  const getTimezoneOffset = (timeZone: string, date: Date | number) => {
    const timeZoneName = getTimeZoneFormatter(timeZone)
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value;

    if (!timeZoneName || timeZoneName === "GMT" || timeZoneName === "UTC") {
      return 0;
    }

    const [, sign, hours, minutes = "0"] =
      timeZoneName.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/) ?? [];

    if (!sign || !hours) {
      throw new Error(`Unsupported time zone offset: ${timeZoneName}`);
    }

    const totalMinutes = Number(hours) * 60 + Number(minutes);
    return sign === "+" ? totalMinutes : -totalMinutes;
  };
</script>

<svelte:head>
  <title>🙁</title>
  <meta name="sad" content="sad day!" />
</svelte:head>

<div
  class="absolute w-full h-full z-10 flex flex-col justify-center items-center"
>
  <button>click</button>
</div>

<style lang="postcss">
</style>
