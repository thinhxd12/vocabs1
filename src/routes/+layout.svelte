<script lang="ts">
  import "../app.css";
  let { data, children } = $props();
</script>

<main>
  <header>
    <nav>
      <a href="/">Home</a>
      <a href="/vocab">vocab</a>
      <a href="/login">Login</a>
      <a href="/about">about</a>
    </nav>
    <!-- <h1>{data.username}</h1> -->
  </header>
  <section>
    {@render children()}
  </section>
  <footer>
    <p>&copy; {new Date().getFullYear()} My Svelte App. All rights reserved.</p>
  </footer>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  header {
    background: #333;
    color: #fff;
    padding: 1rem;
  }
  nav a {
    color: #fff;
    margin-right: 1rem;
    text-decoration: none;
  }
  section {
    flex: 1;
    padding: 1rem;
  }
  footer {
    background: #333;
    color: #fff;
    text-align: center;
    padding: 1rem;
  }
</style>
