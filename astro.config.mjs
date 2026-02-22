import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://carlwrites.dev',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
})
