export const DEFAULT_VISIBLE_TOOLS = [
  'attachment', 'webSearch', 'knowledgeBase', 'mcpTools', 'mentionModels',
  'thinking', 'generateImage', 'newTopic', 'newContext', 'clearTopic',
]

export const DEFAULT_HIDDEN_TOOLS = [
  'toggleExpand', 'slashCommands', 'quickPhrases', 'resource', 'urlContext', 'createSession',
]

export const TOOL_LABELS: Record<string, { ko: string; en: string }> = {
  attachment: { ko: '파일 첨부', en: 'Attach File' },
  webSearch: { ko: '웹 검색', en: 'Web Search' },
  knowledgeBase: { ko: '지식 베이스', en: 'Knowledge Base' },
  mcpTools: { ko: 'MCP 도구', en: 'MCP Tools' },
  mentionModels: { ko: '모델 멘션', en: 'Mention Models' },
  thinking: { ko: '사고 과정', en: 'Thinking' },
  generateImage: { ko: '이미지 생성', en: 'Generate Image' },
  newTopic: { ko: '새 대화', en: 'New Topic' },
  newContext: { ko: '새 컨텍스트', en: 'New Context' },
  clearTopic: { ko: '대화 삭제', en: 'Clear Topic' },
  toggleExpand: { ko: '확장/축소', en: 'Toggle Expand' },
  slashCommands: { ko: '슬래시 명령어', en: 'Slash Commands' },
  quickPhrases: { ko: '빠른 문구', en: 'Quick Phrases' },
  resource: { ko: '리소스', en: 'Resource' },
  urlContext: { ko: 'URL 컨텍스트', en: 'URL Context' },
  createSession: { ko: '세션 생성', en: 'Create Session' },
}
