// middleware.ts
import { type BunRequest, type CSRFGenerateOptions, type Server } from 'bun'
import { prisma } from '../lib/prisma' // Adjust this import path to your Prisma client setup
import { validateDecodeToken } from './actions'
import { logger } from './index'

// Define types for session and handlers
interface SessionContext {
  id: string
  userId: Uint8Array<ArrayBuffer>
}

type AuthenticatedHandler = (
  req: BunRequest,
  session: SessionContext,
  params?: Record<string, string>
) => Promise<Response>

type BunFetchHandler = (this: Server<any>, request: Request, server: Server<any>) => Response | Promise<Response>


export function withHttpLogging(fetchHandler: BunFetchHandler): BunFetchHandler {
  return async function (this: Server<any>, request: Request, server: Server<any>) {
    const startTime = performance.now()
    const url = new URL(request.url)

    try {
      const response = await fetchHandler.call(this, request, server)

      // Log successful responses
      const duration = (performance.now() - startTime).toFixed(2)
      logger.http(`${request.method} ${url.pathname}`, {
        status: response.status,
        duration: `${duration}ms`,
        ip: server?.requestIP?.(request)?.address || 'unknown',
      })

      return response
    } catch (error) {
      // Log application crashes or unhandled exceptions
      const duration = (performance.now() - startTime).toFixed(2)
      logger.error(`Critical error on ${request.method} ${url.pathname}`, {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : String(error),
      })
      
      return new Response('Internal Server<any> Error', { status: 500 })
    }
  }
}


/**
 * Shared helper to extract token, validate it, and find the database session.
 */
async function authenticateRequest(req: BunRequest): Promise<{ session: SessionContext; errorResponse?: never } | { session?: never; errorResponse: Response }> {
  try {
    const cookies = (req as any).cookies
    const token = await cookies?.get('token')
    const validate = await validateDecodeToken(token || '')

    if (!validate.success || !validate.data?.sessionId) {
      return {
        errorResponse: Response.json(
          { status: 401, success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const session = await prisma.session.findFirst({
      where: {
        id: validate.data.sessionId,
        expiresAt: {
          gte: new Date(),
        },
      },
    })

    if (!session) {
      return {
        errorResponse: Response.json(
          { status: 401, success: false, error: 'Session not found' },
          { status: 401 }
        )
      }
    }

    return { session }
  } catch (error: any) {
    console.error('Auth Validation Error:', error)
    return {
      errorResponse: Response.json(
        { status: 500, success: false, error: error.message || 'Server<any> Error' },
        { status: 500 }
      )
    }
  }
}


export function withAuth(handler: AuthenticatedHandler) {
  return async (req: BunRequest, server?: Server<any>): Promise<Response> => {
    // We wrap the internal route logic inside our logging middleware structure
    const loggingWrapper = withHttpLogging(async () => {
      const { session, errorResponse } = await authenticateRequest(req)
      if (errorResponse) return errorResponse

      const params = (req as any).params || {}
      return await handler(req, session, params)
    })

    // Execute the logging wrapper, passing along the server instance if available
    return await loggingWrapper.call(server!, req, server!)
  }
}

export function withAuthAndCSRF(handler: AuthenticatedHandler) {
  return async (req: BunRequest, server?: Server<any>): Promise<Response> => {
    const loggingWrapper = withHttpLogging(async () => {
      const { session, errorResponse } = await authenticateRequest(req)
      if (errorResponse) return errorResponse

      try {
        const cookies = (req as any).cookies
        const token = await cookies?.get('token')
        const validate = await validateDecodeToken(token || '')

        const bufferId = Buffer.from(validate.data!.sessionId)
        const base64String = bufferId.toString('base64url')

        const csrftoken = req.headers.get('X-CSRF-Token') || ''
        if (!process.env.CSRF_SECRET) logger.error('process.env.CSRF_SECRET is undefined');
        const isCsrfValid = Bun.CSRF.verify(csrftoken, {
          secret: process.env.CSRF_SECRET,
          sessionId: base64String,
          encoding: 'hex',
        } as CSRFGenerateOptions)

        if (!isCsrfValid) {
          return Response.json(
            { status: 403, success: false, error: 'CSRF verification failed' },
            { status: 403 }
          )
        }

        const params = (req as any).params || {}
        return await handler(req, session, params)
      } catch (error: any) {
        console.error('CSRF Middleware Error:', error)
        return Response.json(
          { status: 500, success: false, error: error.message || 'Server<any> Error' },
          { status: 500 }
        )
      }
    })

    return await loggingWrapper.call(server!, req, server!)
  }
}