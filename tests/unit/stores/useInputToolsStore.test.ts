import { describe, it, expect, beforeEach } from 'vitest'
import { useInputToolsStore } from '../../../src/renderer/src/stores/useInputToolsStore'

describe('useInputToolsStore', () => {
  beforeEach(() => {
    // Reset to initial state by re-creating default tool orders
    const defaultVisible = [
      'attachment',
      'webSearch',
      'knowledgeBase',
      'mcpTools',
      'mentionModels',
      'thinking',
      'generateImage',
      'newTopic',
      'newContext',
      'clearTopic',
    ]
    const defaultHidden = [
      'toggleExpand',
      'slashCommands',
      'quickPhrases',
      'resource',
      'urlContext',
      'createSession',
    ]

    useInputToolsStore.setState({
      toolOrder: {
        chat: { visible: [...defaultVisible], hidden: [...defaultHidden] },
        session: { visible: [...defaultVisible], hidden: [...defaultHidden] },
        mini: {
          visible: defaultVisible.slice(0, 4),
          hidden: [...defaultVisible.slice(4), ...defaultHidden],
        },
      },
      isCollapsed: false,
    })
  })

  describe('toggleCollapsed', () => {
    it('toggles collapsed state from false to true', () => {
      useInputToolsStore.getState().toggleCollapsed()
      expect(useInputToolsStore.getState().isCollapsed).toBe(true)
    })

    it('toggles collapsed state back to false', () => {
      useInputToolsStore.getState().toggleCollapsed()
      useInputToolsStore.getState().toggleCollapsed()
      expect(useInputToolsStore.getState().isCollapsed).toBe(false)
    })
  })

  describe('moveToolToVisible', () => {
    it('moves a hidden tool to visible', () => {
      useInputToolsStore.getState().moveToolToVisible('chat', 'toggleExpand')

      const order = useInputToolsStore.getState().toolOrder.chat
      expect(order.visible).toContain('toggleExpand')
      expect(order.hidden).not.toContain('toggleExpand')
    })

    it('does not duplicate if tool is already visible', () => {
      const beforeCount = useInputToolsStore.getState().toolOrder.chat.visible.length
      useInputToolsStore.getState().moveToolToVisible('chat', 'attachment')

      const afterCount = useInputToolsStore.getState().toolOrder.chat.visible.length
      expect(afterCount).toBe(beforeCount)
    })

    it('appends tool to end of visible list', () => {
      useInputToolsStore.getState().moveToolToVisible('chat', 'slashCommands')

      const visible = useInputToolsStore.getState().toolOrder.chat.visible
      expect(visible[visible.length - 1]).toBe('slashCommands')
    })
  })

  describe('moveToolToHidden', () => {
    it('moves a visible tool to hidden', () => {
      useInputToolsStore.getState().moveToolToHidden('chat', 'attachment')

      const order = useInputToolsStore.getState().toolOrder.chat
      expect(order.visible).not.toContain('attachment')
      expect(order.hidden).toContain('attachment')
    })

    it('does not duplicate if tool is already hidden', () => {
      const beforeCount = useInputToolsStore.getState().toolOrder.chat.hidden.length
      useInputToolsStore.getState().moveToolToHidden('chat', 'toggleExpand')

      const afterCount = useInputToolsStore.getState().toolOrder.chat.hidden.length
      expect(afterCount).toBe(beforeCount)
    })
  })

  describe('reorderTool', () => {
    it('moves a tool from one index to another in visible list', () => {
      const visibleBefore = useInputToolsStore.getState().toolOrder.chat.visible
      const first = visibleBefore[0]
      const second = visibleBefore[1]

      useInputToolsStore.getState().reorderTool('chat', 0, 1)

      const visibleAfter = useInputToolsStore.getState().toolOrder.chat.visible
      expect(visibleAfter[0]).toBe(second)
      expect(visibleAfter[1]).toBe(first)
    })

    it('preserves all items after reorder', () => {
      const countBefore = useInputToolsStore.getState().toolOrder.chat.visible.length
      useInputToolsStore.getState().reorderTool('chat', 0, 4)

      const countAfter = useInputToolsStore.getState().toolOrder.chat.visible.length
      expect(countAfter).toBe(countBefore)
    })
  })

  describe('setToolOrder', () => {
    it('replaces the tool order for a given scope', () => {
      const newOrder = { visible: ['a', 'b'], hidden: ['c', 'd'] }
      useInputToolsStore.getState().setToolOrder('session', newOrder)

      expect(useInputToolsStore.getState().toolOrder.session).toEqual(newOrder)
    })

    it('does not affect other scopes', () => {
      const chatBefore = { ...useInputToolsStore.getState().toolOrder.chat }
      useInputToolsStore.getState().setToolOrder('session', { visible: ['x'], hidden: ['y'] })

      expect(useInputToolsStore.getState().toolOrder.chat).toEqual(chatBefore)
    })
  })

  describe('scope isolation', () => {
    it('changes to chat scope do not affect session scope', () => {
      const sessionBefore = useInputToolsStore.getState().toolOrder.session.visible.length
      useInputToolsStore.getState().moveToolToHidden('chat', 'attachment')

      expect(useInputToolsStore.getState().toolOrder.session.visible.length).toBe(sessionBefore)
    })
  })
})
