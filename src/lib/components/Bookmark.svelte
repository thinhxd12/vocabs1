<script>
  import Icon from "@iconify/svelte";
</script>

<section class="flex-1 h-full pt-[48px] px-[48px] flex flex-col">
  <div class="w-full flex-1 layout-light rounded-6 flex overflow-hidden">
    <div class="bg-black/15 w-[240px] h-full"></div>
    <div class="flex-1 h-full bg-[#dcd8d1]"></div>
  </div>
  <div class="h-[48px] flex justify-center items-center">
    <div class="flex flex-col items-center justify-center mr-6 pt-14">
      <button class="btn-heart">
        <Icon icon="bi:heart-fill" width="21" height="21" />
      </button>
      <span class="text-9 text-white w-full text-center">123</span>
    </div>

    <button class="btn-menu">
      <Icon icon="solar:copy-outline" width="15" height="15" />
    </button>

    <button class="btn-menu">
      <Icon icon="meteor-icons:dice" width="15" height="15" />
    </button>

    <button class="btn-menu">
      <Icon icon="hugeicons:book-edit" width="15" height="15" />
    </button>

    <button class="btn-menu">
      <Icon icon="hugeicons:row-insert" width="15" height="15" />
    </button>

    <button class="btn-menu">
      <Icon icon="hugeicons:property-search" width="15" height="15" />
    </button>

    <button class="btn-menu">
      <Icon icon="hugeicons:delete-throw" width="15" height="15" />
    </button>

    <button class="btn-menu">
      <Icon icon="icon-park-outline:left" width="15" height="15" />
    </button>

    <button class="btn-menu">
      <Icon icon="icon-park-outline:right" width="15" height="15" />
    </button>
  </div>
</section>

<style>
  .btn-heart {
    @apply flex size-21 items-center justify-center rounded-full text-white outline-none hover:scale-110;
  }

  .btn-menu {
    @apply mr-6 flex size-27 items-center justify-center rounded-full text-white shadow shadow-black/30 outline-none backdrop-blur-md transition duration-100 hover:shadow;
  }
</style>
