export abstract class AbstractException extends Error {
  readonly code: string
  readonly metadata?: Record<string, unknown>

  constructor(message: string, name: string, metadata?: Record<string, unknown>) {
    super(message)
    this.code = name
    this.name = name
    this.metadata = metadata
  }

  toJSON(): string {
    return JSON.stringify({ message: this.message, code: this.code, metadata: this.metadata })
  }
}

export interface AbstractExceptionMetadata {
  originalError?: Error
}
