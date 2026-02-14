<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Top nav -->
    <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <!-- Brand -->
        <RouterLink to="/" class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-indigo-600"></div>
          <div class="leading-tight">
            <div class="text-sm font-semibold text-slate-900">Transcripto</div>
            <div class="text-xs text-slate-500">Audio / Video → Text</div>
          </div>
        </RouterLink>

        <!-- Links -->
        <nav class="flex items-center gap-1">
          <RouterLink
            to="/"
            class="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
            exact-active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
          >
            Home
          </RouterLink>

          <RouterLink
            to="/transcript"
            class="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
          >
            Transcript
          </RouterLink>

          <RouterLink
            to="/about"
            class="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            active-class="bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
          >
            About
          </RouterLink>
        </nav>
      </div>
    </header>

    <!-- Page content -->
    <main class="mx-auto max-w-5xl px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>








<!-- <script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header style="display: flex; justify-content: center;">
    <div class="wrapper">
      <nav class="padding2" >
        <RouterLink class="padding1"   to="/">Home</RouterLink>
        <RouterLink class="padding1" to="/transcript">Transcript</RouterLink>
        <RouterLink class="padding1" to="/about">About</RouterLink>
      </nav>
    </div>
  </header>
  <RouterView />
</template>

<style scoped>
.padding1{
  padding: 1vw;
}
.padding2{
  padding: 2vw;
}
header {
  /* line-height: 1.5;
  max-height: 100vh; */
}

.logo {
  /* display: block;
  margin: 0 auto 2rem; */
}

nav {
  /* width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 0vh; */
}

nav a.router-link-exact-active {
  /* color: var(--color-text); */
}

nav a.router-link-exact-active:hover {
  /* background-color: transparent; */
}

nav a {
  /* display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border); */
}

nav a:first-of-type {
  /* border: 0; */
}

@media (min-width: 1024px) {
  header {
    /* display: flex;
    place-items: center; */
    /* padding-right: calc(var(--section-gap) / 2); */
  }

  .logo {
    /* margin: 0 2rem 0 0; */
  }

  header .wrapper {
    /* display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
    height: 50vh; */
  }

  nav {
    /* text-align: left;
    margin-left: -1rem;
    font-size: 1rem; */

    /* padding: 1rem 0; */
    /* margin-top: 1rem; */
  }
}
</style> -->
