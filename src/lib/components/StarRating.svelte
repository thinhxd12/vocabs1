<script lang="ts">
  interface Props {
    rating: number;
    starColor?: string;
    inactiveColor?: string;
    totalStars?: number;
    size?: number;
    gap?: number;
  }

  let {
    rating,
    starColor = "#e87400",
    inactiveColor = "#c2c7cc",
    totalStars = 5,
    size = 24,
    gap = 2,
  }: Props = $props();

  function getFillPercent(index: number) {
    const diff = rating - index;
    if (diff >= 1) return 1;
    if (diff > 0) return diff;
    return 0;
  }
</script>

<div class="flex items-center gap-{gap}">
  {#each Array(totalStars) as _, index}
    {#if getFillPercent(index) === 1}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style="width:{size}px;height:{size}px;"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 .587l3.668 7.568L24 9.75l-6 5.85L19.336 24 12 19.897 4.664 24 6 15.6 0 9.75l8.332-1.595z"
          fill={starColor}
        />
      </svg>
    {:else if getFillPercent(index) === 0}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        style="width:{size}px;height:{size}px;"
      >
        <path
          d="M12 .587l3.668 7.568L24 9.75l-6 5.85L19.336 24 12 19.897 4.664 24 6 15.6 0 9.75l8.332-1.595z"
          fill={inactiveColor}
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        style="width:{size}px;height:{size}px;"
      >
        <defs>
          <linearGradient id="grad-{index}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:{starColor};stop-opacity:1" />
            <stop
              offset="{getFillPercent(index) * 100}%"
              style="stop-color:{starColor};stop-opacity:1"
            />
            <stop
              offset="{getFillPercent(index) * 100}%"
              style="stop-color:{inactiveColor};stop-opacity:1"
            />
          </linearGradient>
        </defs>
        <path
          d="M12 .587l3.668 7.568L24 9.75l-6 5.85L19.336 24 12 19.897 4.664 24 6 15.6 0 9.75l8.332-1.595z"
          fill={`url(#grad-${index})`}
        />
      </svg>
    {/if}
  {/each}
</div>
