import type { Root, Element } from 'hast'
import { visit } from 'unist-util-visit'
import { toString } from 'hast-util-to-string'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

export default function rehypeHeadingIds() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (HEADING_TAGS.has(node.tagName)) {
        const text = toString(node)
        if (text) {
          node.properties ??= {}
          if (!node.properties.id) {
            node.properties.id = slugify(text)
          }
        }
      }
    })
  }
}
