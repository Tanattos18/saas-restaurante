type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  module?: string
  context?: unknown
  error?: string
}

function log(level: LogLevel, message: string, module?: string, context?: unknown, error?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    module,
    context: context ?? undefined,
    error: error instanceof Error ? error.message : (error as string) ?? undefined,
  }

  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(entry))
  } else {
    const prefix = module ? `[${module}]` : ''
    const details = [entry.context, entry.error].filter(Boolean).join(' | ')
    console[level](`${prefix} ${message}${details ? ` — ${details}` : ''}`)
  }
}

export const logger = {
  info: (message: string, module?: string, context?: unknown) => log('info', message, module, context),
  warn: (message: string, module?: string, context?: unknown) => log('warn', message, module, context),
  error: (message: string, module?: string, error?: unknown) => log('error', message, module, undefined, error),
  debug: (message: string, module?: string, context?: unknown) => log('debug', message, module, context),
}
