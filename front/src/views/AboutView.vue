<template>
  <main class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-5xl px-4 py-12">
      <!-- Hero -->
      <section class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">
              About Transcripto
            </h1>
            <p class="mt-3 max-w-2xl text-slate-600">
              Transcripto is a lightweight SaaS-style tool that turns audio and video into readable text.
              Upload a file, get a transcript, and use it to summarize calls, extract action items, or search
              conversations quickly.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <RouterLink
              to="/transcript"
              class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Start Transcribing
            </RouterLink>
            <RouterLink
              to="/"
              class="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-300
                     hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Back to Home
            </RouterLink>
          </div>
        </div>

        <!-- Badges -->
        <div class="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
          <span class="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">MP3 / MP4 / M4A</span>
          <span class="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">Hebrew & English</span>
          <span class="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">Fast workflow</span>
          <span class="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">Built with Vue + Tailwind</span>
        </div>
      </section>

      <!-- Value props -->
      <section class="mt-8 grid gap-4 md:grid-cols-3">
        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-sm font-semibold text-slate-900">Simple workflow</h3>
          <p class="mt-2 text-sm text-slate-600">
            Choose a file → upload → receive the transcript. No clutter, no distractions.
          </p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-sm font-semibold text-slate-900">Practical output</h3>
          <p class="mt-2 text-sm text-slate-600">
            Copy, search, and reuse the transcript for summaries, tasks, CRM notes, and documentation.
          </p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 class="text-sm font-semibold text-slate-900">SaaS-ready</h3>
          <p class="mt-2 text-sm text-slate-600">
            Designed like a SaaS product: clean UI, clear actions, and room to grow into features like history,
            accounts, and billing.
          </p>
        </div>
      </section>

      <!-- How it works -->
      <section class="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">How it works</h2>
        <p class="mt-2 text-sm text-slate-600">
          The app uploads your media file to your backend, where it’s processed by transcription services.
          The result is returned as plain text and rendered on the Transcript page.
        </p>

        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p class="text-sm font-semibold text-slate-900">1) Upload</p>
            <p class="mt-1 text-sm text-slate-600">Pick an MP3/MP4/M4A file and send it to the server.</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p class="text-sm font-semibold text-slate-900">2) Transcribe</p>
            <p class="mt-1 text-sm text-slate-600">Speech is converted into text with language support.</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p class="text-sm font-semibold text-slate-900">3) Use</p>
            <p class="mt-1 text-sm text-slate-600">Copy the transcript, summarize it, or extract tasks.</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">FAQ</h2>

        <div class="mt-6 space-y-5">
          <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p class="text-sm font-semibold text-slate-900">What file types are supported?</p>
            <p class="mt-1 text-sm text-slate-600">
              Common formats like MP3, MP4, and M4A. If your backend supports more, the UI can be extended easily.
            </p>
          </div>

          <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p class="text-sm font-semibold text-slate-900">Is the transcript accurate?</p>
            <p class="mt-1 text-sm text-slate-600">
              Accuracy depends on recording quality, background noise, and language clarity. Clear audio produces
              the best results.
            </p>
          </div>

          <div class="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p class="text-sm font-semibold text-slate-900">What’s next for this app?</p>
            <p class="mt-1 text-sm text-slate-600">
              Typical SaaS upgrades: user accounts, transcript history, sharing, summaries, action items, and
              integrations (CRM, Notion, Slack).
            </p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="mt-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-slate-900 p-8 text-white shadow-sm">
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-xl font-semibold">Ready to try it?</h2>
            <p class="mt-2 text-sm text-white/90">
              Go to the Transcript page and upload your first file.
            </p>
          </div>
          <RouterLink
            to="/transcript"
            class="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900
                    shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-indigo-700"
          >
            Open Transcript
          </RouterLink>
        </div>
      </section>

      <footer class="mt-10 text-center text-xs text-slate-500">
        © {{ new Date().getFullYear() }} Transcripto • Built as a SaaS-style UI on Vue 3 + Tailwind
      </footer>
    </div>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>