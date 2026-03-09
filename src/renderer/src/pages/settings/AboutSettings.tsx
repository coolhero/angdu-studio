import { useTranslation } from 'react-i18next'
import { useAppStore } from '../../stores/useAppStore'

export default function AboutSettings(): JSX.Element {
  const { t } = useTranslation()
  const appInfo = useAppStore((s) => s.appInfo)

  const version = appInfo?.version ?? '0.0.0'
  const electronVersion = appInfo?.electronVersion ?? 'unknown'

  return (
    <div className="space-y-6 p-6">
      {/* App Identity */}
      <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-8 dark:border-zinc-700 dark:bg-zinc-800/40">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Angdu Studio</h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">v{version}</span>
        <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-300">
          {t('settings.about.description', 'A powerful AI assistant desktop application')}
        </p>
      </div>

      {/* Built With */}
      <div className="rounded-lg border border-zinc-200 px-4 py-4 dark:border-zinc-700">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('settings.about.builtWith', 'Built with')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {['Electron', 'React', 'TypeScript', 'Tailwind CSS', 'Zustand'].map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Electron {electronVersion}
        </p>
      </div>

      {/* Links */}
      <div className="rounded-lg border border-zinc-200 px-4 py-4 dark:border-zinc-700">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('settings.about.links', 'Links')}
        </h2>
        <div className="space-y-2">
          <a
            href="https://github.com/angdu/angdu-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {t('settings.about.github', 'GitHub Repository')}
          </a>
          <a
            href="https://angdu-studio.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {t('settings.about.docs', 'Documentation')}
          </a>
        </div>
      </div>
    </div>
  )
}
