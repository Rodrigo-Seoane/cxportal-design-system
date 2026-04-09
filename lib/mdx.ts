import { readFile } from 'fs/promises'
import { join } from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import { getMDXComponents } from '@/components/mdx/MDXComponents'

// ─── Frontmatter shape ────────────────────────────────────────────────────────

export type ComponentFrontmatter = {
  title?: string
  description?: string
  figmaNodeId?: string
  status?: 'stable' | 'wip' | 'deprecated'
}

// ─── Loader ───────────────────────────────────────────────────────────────────
// Returns null if the MDX file does not exist — callers can fall back to the
// registry-only view.

export async function getComponentDoc(slug: string) {
  const filePath = join(process.cwd(), 'content', 'components', `${slug}.mdx`)

  try {
    const source = await readFile(filePath, 'utf-8')

    const { content, frontmatter } = await compileMDX<ComponentFrontmatter>({
      source,
      components: getMDXComponents(),
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: 'one-dark-pro',
                keepBackground: false,
              },
            ],
          ],
        },
      },
    })

    return { content, frontmatter }
  } catch (err) {
    console.error(`[mdx] Failed to load docs for "${slug}":`, err)
    return null
  }
}
