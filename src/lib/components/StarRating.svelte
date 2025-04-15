<script lang="ts">
  interface Props {
    rating: number;
    starColor?: string;
    inactiveColor?: string;
    totalStars?: number;
  }

  let {
    rating,
    starColor = "gold",
    inactiveColor = "lightgray",
    totalStars = 5,
  }: Props = $props();

  function getStarType(index: number) {
    if (index + 1 <= rating) return "full";
    else if (index + 0.5 <= rating) return "half";
    else return "empty";
  }
</script>

<div class="stars">
  {#each Array(totalStars) as _, index}
    {#if getStarType(index) === "full"}
      <svg fill={starColor} viewBox="0 0 24 24">
        <path
          d="M12 .587l3.668 7.568L24 9.75l-6 5.85L19.336 24 12 19.897 4.664 24 6 15.6 0 9.75l8.332-1.595z"
        />
      </svg>
    {:else if getStarType(index) === "half"}
      <svg viewBox="0 0 24 24">
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stop-color={starColor} />
            <stop offset="50%" stop-color={inactiveColor} />
          </linearGradient>
        </defs>
        <path
          fill="url(#half)"
          d="M12 .587l3.668 7.568L24 9.75l-6 5.85L19.336 24 12 19.897 4.664 24 6 15.6 0 9.75l8.332-1.595z"
        />
      </svg>
    {:else}
      <svg fill={inactiveColor} viewBox="0 0 24 24">
        <path
          d="M12 .587l3.668 7.568L24 9.75l-6 5.85L19.336 24 12 19.897 4.664 24 6 15.6 0 9.75l8.332-1.595z"
        />
      </svg>
    {/if}
  {/each}
</div>

<style>
  .stars {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  svg {
    width: 24px;
    height: 24px;
  }
</style>
