import { Component, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { SettingsSidebar } from './SettingsSidebar'

// Error Boundary specific to SettingsPage
class SettingsErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-lg font-bold text-foreground">Settings Error</h2>
          <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
          <button
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function SettingsPage() {
  return (
    <SettingsErrorBoundary>
      <div className="flex h-full flex-row">
        <SettingsSidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </SettingsErrorBoundary>
  )
}
