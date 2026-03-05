/**
 * Standardized error handling for server actions
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Authentication errors
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
  }
}

// Validation errors
export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

// Resource errors
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 'NOT_FOUND', 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

// Database errors
export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: unknown) {
    super(message, 'DATABASE_ERROR', 500)
  }
}

/**
 * Standard action result type
 */
export type ActionResult<T = void> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: {
        message: string
        code: string
        errors?: Record<string, string[]>
      }
    }

/**
 * Wrap an async function with standardized error handling
 */
export async function handleActionError<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    console.error('Action error:', error)

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          errors: error instanceof ValidationError ? error.errors : undefined,
        },
      }
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: Record<string, unknown> }

      if (prismaError.code === 'P2002') {
        // Unique constraint violation
        const meta = prismaError.meta as { target?: string[] }
        const field = meta?.target?.[0] || 'field'
        return {
          success: false,
          error: {
            message: `A record with this ${field} already exists`,
            code: 'CONFLICT',
          },
        }
      }

      if (prismaError.code === 'P2025') {
        // Record not found
        return {
          success: false,
          error: {
            message: 'Record not found',
            code: 'NOT_FOUND',
          },
        }
      }

      if (prismaError.code === 'P2003') {
        // Foreign key constraint violation
        return {
          success: false,
          error: {
            message: 'Related record not found',
            code: 'NOT_FOUND',
          },
        }
      }
    }

    // Generic error
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
    }
  }
}

/**
 * Format Zod validation errors
 */
export function formatZodErrors(errors: Array<{ path: string[]; message: string }>) {
  const formatted: Record<string, string[]> = {}

  for (const error of errors) {
    const field = error.path.join('.')
    if (!formatted[field]) {
      formatted[field] = []
    }
    formatted[field].push(error.message)
  }

  return formatted
}
