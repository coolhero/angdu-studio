import { useTranslation } from 'react-i18next'
import { ExternalLink, ShoppingBag } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { ScrollArea } from '@renderer/components/ui/scroll-area'

interface MarketEntry {
  name: string
  url: string
  descriptionKey: string
}

const mcpMarkets: MarketEntry[] = [
  {
    name: 'mcp.so',
    url: 'https://mcp.so/',
    descriptionKey: 'settings.mcp.more.mcpso',
  },
  {
    name: 'smithery.ai',
    url: 'https://smithery.ai/',
    descriptionKey: 'settings.mcp.more.smithery',
  },
  {
    name: 'glama.ai',
    url: 'https://glama.ai/mcp/servers',
    descriptionKey: 'settings.mcp.more.glama',
  },
  {
    name: 'pulsemcp.com',
    url: 'https://www.pulsemcp.com',
    descriptionKey: 'settings.mcp.more.pulsemcp',
  },
  {
    name: 'mcp.composio.dev',
    url: 'https://mcp.composio.dev/',
    descriptionKey: 'settings.mcp.more.composio',
  },
  {
    name: 'Model Context Protocol Servers',
    url: 'https://github.com/modelcontextprotocol/servers',
    descriptionKey: 'settings.mcp.more.github',
  },
]

export default function McpMarketList(): JSX.Element {
  const { t } = useTranslation()

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-zinc-500" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t('settings.mcp.marketplaces', 'MCP Marketplaces')}
          </h3>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t(
            'settings.mcp.marketplaces.description',
            'Browse MCP server marketplaces to discover and install servers.',
          )}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {mcpMarkets.map((market) => (
            <div
              key={market.url}
              className="rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
            >
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {market.name}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => window.api.shell.openExternal(market.url)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {t(market.descriptionKey, market.name)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
