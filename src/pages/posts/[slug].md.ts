import type { APIRoute, GetStaticPaths } from 'astro'

// The source of every post, served as-is at /posts/<slug>.md.
// Rendered HTML is a view of the file; this is the file.
const sources = import.meta.glob<string>('./*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const slugOf = (path: string) => path.replace(/^\.\//, '').replace(/\.md$/, '')

// `layout:` names the Astro component that renders this file — build wiring, not writing.
// Everything else in the frontmatter is content and stays. Scoped to the opening block so a
// body line beginning with "layout:" survives.
const stripLayout = (src: string) =>
  src.replace(
    /^(---\n)([\s\S]*?)(\n---\n)/,
    (_match, open: string, body: string, close: string) =>
      open + body.split('\n').filter(line => !/^layout:/.test(line)).join('\n') + close,
  )

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(sources).map(path => ({ params: { slug: slugOf(path) } }))

export const GET: APIRoute = ({ params }) => {
  const src = sources[`./${params.slug}.md`]
  if (!src) return new Response('Not found\n', { status: 404 })

  return new Response(stripLayout(src), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
