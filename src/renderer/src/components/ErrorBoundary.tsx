import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          fontFamily: 'monospace',
          backgroundColor: '#1a1a2e',
          color: '#e0e0e0',
          height: '100vh',
          overflow: 'auto',
        }}>
          <h1 style={{ color: '#ff6b6b', fontSize: '20px', marginBottom: '16px' }}>
            Application Error
          </h1>
          <div style={{
            backgroundColor: '#16213e',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #0f3460',
          }}>
            <strong style={{ color: '#e94560' }}>
              {this.state.error?.name}: {this.state.error?.message}
            </strong>
          </div>
          <details open style={{ marginBottom: '16px' }}>
            <summary style={{ cursor: 'pointer', color: '#53a8b6', marginBottom: '8px' }}>
              Stack Trace
            </summary>
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontSize: '12px',
              lineHeight: '1.5',
              backgroundColor: '#0a0a23',
              padding: '12px',
              borderRadius: '4px',
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
          {this.state.errorInfo && (
            <details style={{ marginBottom: '16px' }}>
              <summary style={{ cursor: 'pointer', color: '#53a8b6', marginBottom: '8px' }}>
                Component Stack
              </summary>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                fontSize: '12px',
                lineHeight: '1.5',
                backgroundColor: '#0a0a23',
                padding: '12px',
                borderRadius: '4px',
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e94560',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
