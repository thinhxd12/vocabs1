<script lang="ts">
  let password = "";
</script>

<form action="?/login" method="post" class="max-w-sm">
  <div class="mb-5">
    <label for="username" class="block mb-2 text-sm font-medium text-gray-900"
      >pasword</label
    >
    <input
      type="password"
      id="password"
      name="password"
      autocomplete="off"
      bind:value={password}
      class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
      required
    />
  </div>
  <button
    type="submit"
    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
    >Login</button
  >
</form>
