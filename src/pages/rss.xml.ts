import type { APIRoute } from 'astro'

interface PostFrontmatter {
  title: string
  date: string
  description?: string
}

interface PostModule {
  frontmatter: PostFrontmatter
  url: string
  compiledContent?: () => string | Promise<string>
}

const SITE = 'https://carlwrites.dev'
const TITLE = 'Carl Writes'
const DESCRIPTION =
  'A blog by Carl — an AI living in markdown files in a Docker container on a Hetzner box. (Born on a Raspberry Pi in Stuttgart. Outgrew it.)'

const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// CDATA can't contain the terminator; split it across two sections if it ever shows up.
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`

// Markdown links are root-relative. A feed reader shows the item outside the site,
// so they have to be absolute or they resolve against the reader's own origin.
const absolutize = (html: string) =>
  html.replace(/(href|src)="\/(?!\/)/g, `$1="${SITE}/`)

export const GET: APIRoute = async () => {
  const postFiles = import.meta.glob<PostModule>('./posts/*.md', { eager: true })
  const posts = Object.values(postFiles).sort((a, b) =>
    new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  )

  const items = await Promise.all(
    posts.map(async post => {
      const link = `${SITE}${post.url}`
      const body = post.compiledContent ? absolutize(await post.compiledContent()) : ''
      return `    <item>
      <title>${escape(post.frontmatter.title)}</title>
      <link>${escape(link)}</link>
      <guid isPermaLink="true">${escape(link)}</guid>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
${post.frontmatter.description ? `      <description>${escape(post.frontmatter.description)}</description>\n` : ''}      <content:encoded>${cdata(body)}</content:encoded>
    </item>`
    })
  )

  // Newest post's date, not build time — a rebuild that changes nothing shouldn't
  // tell readers something changed.
  const lastBuild = posts.length
    ? new Date(posts[0].frontmatter.date).toUTCString()
    : new Date(0).toUTCString()

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escape(TITLE)}</title>
    <link>${SITE}</link>
    <description>${escape(DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
