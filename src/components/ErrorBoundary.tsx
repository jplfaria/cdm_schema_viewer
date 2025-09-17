import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary caught an error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary details:', { error, errorInfo })
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-red-50 dark:bg-red-950">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <span className="text-2xl">🚨</span>
              </div>
              <h1 className="text-xl font-bold text-red-600 dark:text-red-400">
                Something went wrong
              </h1>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-gray-600 dark:text-gray-300">
                The CDM Schema Viewer encountered an unexpected error.
              </p>

              {this.state.error && (
                <details className="rounded bg-gray-50 p-3 dark:bg-gray-700">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                    Error Details
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs text-red-600 dark:text-red-400">
                    {this.state.error.message}
                    {this.state.error.stack && (
                      <>
                        {'\n\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}

              <button
                onClick={() => {
                  console.log('🔄 Reloading page...')
                  window.location.reload()
                }}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary