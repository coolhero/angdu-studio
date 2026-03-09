import React from 'react'

interface ArgsTableProps {
  args: Record<string, unknown>
}

const ArgsTable: React.FC<ArgsTableProps> = ({ args }) => {
  const entries = Object.entries(args)

  if (entries.length === 0) return null

  return (
    <table className="w-full text-xs">
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td className="whitespace-nowrap pr-3 py-0.5 align-top font-medium text-zinc-500 dark:text-zinc-400">
              {key}
            </td>
            <td className="break-all py-0.5 text-zinc-700 dark:text-zinc-300">
              {typeof value === 'string'
                ? value
                : JSON.stringify(value, null, 2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default React.memo(ArgsTable)
