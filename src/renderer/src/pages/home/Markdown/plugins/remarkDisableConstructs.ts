import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

/**
 * A remark plugin that disables certain markdown constructs.
 * Specifically removes HTML comments and raw HTML blocks,
 * deferring HTML handling to rehype-raw.
 */
export default function remarkDisableConstructs() {
  return (tree: Root) => {
    visit(tree, 'html', (node, index, parent) => {
      if (index === undefined || !parent) return

      const value = node.value.trim()

      // Remove HTML comments
      if (value.startsWith('<!--') && value.endsWith('-->')) {
        parent.children.splice(index, 1)
        return index
      }
    })
  }
}
