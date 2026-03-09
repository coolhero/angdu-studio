import type { Root, Element } from 'hast'
import { visit } from 'unist-util-visit'

export default function rehypeScalableSvg() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'svg') return

      const props = node.properties ?? {}

      // Add viewBox from width/height if missing
      if (!props.viewBox && !props.viewbox) {
        const width = parseFloat(String(props.width ?? ''))
        const height = parseFloat(String(props.height ?? ''))
        if (width && height) {
          props.viewBox = `0 0 ${width} ${height}`
        }
      }

      // Remove fixed dimensions for responsive scaling
      delete props.width
      delete props.height

      // Add responsive classes
      const existing = String(props.className ?? '')
      props.className = [existing, 'max-w-full', 'h-auto'].filter(Boolean).join(' ')

      node.properties = props
    })
  }
}
