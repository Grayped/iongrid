import { serve, type CSRFGenerateOptions } from 'bun'
import { prisma } from 'lib/prisma'
import index from './index.html'
import { login, register } from './actions'
import { create, getAll, getOne, remove, update } from './actions-array-storage'
import { withAuth, withAuthAndCSRF, withHttpLogging } from './middleware'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { format, createLogger, transports } from 'winston'

const customLayout = format.printf(({ level, message, timestamp }) => {
  return `${level.toUpperCase()}: ${message} || ${timestamp}`
})

const httpCustomLayout = format.printf(
  ({ level, message, timestamp, duration, ip, status }) => {
    const info = (value: any) => `\x1b[36m${value}\x1b[0m`
    const success = (value: any) => `\x1b[32m${value}\x1b[0m`
    const error = (value: any) => `\x1b[31m${value}\x1b[0m`
    return (
      `[${level}]: ${message}` +
      (duration
        ? ` || ${status === 200 ? success(status) : error(status)} || ${info(duration)} || ${ip}`
        : '') +
      ` || ${timestamp}`
    )
  }
)

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ' }),
    customLayout
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
})

// if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS ZZ' }),
        httpCustomLayout
      ),
      level: 'http',
    })
  )
// }

const REG_CODE = process.env.REG_CODE || 'iongrid2026';
if (!process.env.REG_CODE) console.info('process.env.REG_CODE not defined, using default REG_CODE');

const opts = {
  points: 3,
  duration: 60, // Per second
}

const rateLimiter = new RateLimiterMemory(opts)

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,

    '/api/logout': withHttpLogging((req) => {
      req.cookies.delete('token', {
        path: '/',
      })
      req.cookies.delete('csrftoken', {
        path: '/',
      })
      return Response.redirect('/logout')
    }),

    '/api/logout/everywhere': withAuth(async (req, session) => {
      await prisma.session.updateMany({
        where: {
          userId: session.userId,
        },
        data: {
          expiresAt: new Date(),
        },
      })
      return Response.json({ message: 'All your sessions have been closed' })
    }),

    '/api/login': {
      POST: withHttpLogging(async (req) => {
        const cookies = req.cookies
        const formData = await req.formData()
        const username = formData.get('username')?.toString()
        const password = formData.get('password')?.toString()
        if (!username || !password)
          throw new Error('Bad request - missing username or password')

        const loginResponse = await login(username, password)
        if (
          loginResponse.success &&
          loginResponse.token &&
          loginResponse.sessionId
        ) {
          cookies.set('token', loginResponse.token, {
            maxAge: Number(process.env.MAX_AGE_MS),
            httpOnly: true,
            secure: true,
            path: '/',
          })

          const bufferId = Buffer.from(loginResponse.sessionId)
          const base64String = bufferId.toString('base64url')

          const csrftoken = Bun.CSRF.generate(process.env.CSRF_SECRET, {
            sessionId: base64String,
            encoding: 'hex',
          } as CSRFGenerateOptions)

          cookies.set('csrftoken', csrftoken, {
            maxAge: Number(process.env.MAX_AGE_MS),
            httpOnly: false,
            secure: true,
            path: '/',
          })
          return Response.json({ success: true })
        }
        return new Response('An error occured', { status: 500 })
      }),
    },
    '/api/register': {
      POST: withHttpLogging(async (req) => {
        const socketAddress = server.requestIP(req)
        const clientIP = socketAddress?.address
        const formData = await req.formData()
        const name = formData.get('name')?.toString()
        const code = formData.get('code')?.toString()
        const username = formData.get('username')?.toString()
        const email = formData.get('email')?.toString()
        const password = formData.get('password')?.toString()
        if ((!username && !email) || !password)
          throw new Error('Bad request - missing username, email or password')

        const candidate = {
          name,
          username,
          email,
          password,
        }

        if (clientIP) {
          return rateLimiter
            .consume(clientIP, 1)
            .then(async (rateLimiterRes) => {
              if (code?.toLowerCase() !== REG_CODE.toLowerCase())
                return new Response('Invalid registration code', {
                  status: 401,
                })
              const user = await register(candidate)
              return new Response(
                `${user.success ? 'Registered' : 'An error occured while creating the user'}`,
                { status: user.success ? 200 : 400 }
              )
            })
            .catch((rateLimiterRes) => {
              return new Response(
                'Too many requests. Please try again later.',
                {
                  status: 429,
                }
              )
            })
        } else {
          return new Response('Failed rate-limiter test: no ip detected', {
            status: 500,
          })
        }
      }),
    },
    '/api/middleware': {
      GET: withAuth(async (req, session) => {
        return Response.json({ valid: true })
      }),
    },
    '/api/name': {
      GET: withAuth(async (req, session) => {
        if (session) {
          const user = await prisma.user.findFirst({
            where: {
              id: session.userId,
            },
          })
          if (user) return Response.json({ name: user.name })
        }
        return new Response('No session', { status: 401 })
      }),
    },
    '/api/array-storage': {
      GET: withAuth(async (req, session) => {
        if (session) {
          const collection = await getAll(session.userId)
          return Response.json({ collection })
        }
        return Response.json({ status: 401, items: [] })
      }),
      POST: withAuthAndCSRF(async (req, session) => {
        const formData = await req.formData()
        const name = formData.get('name')?.toString()
        const items = formData.get('items')?.toString()
        if (session && items) {
          const createResponse = await create(
            session.userId,
            name || '',
            JSON.parse(items)
          )
          if (createResponse.success) {
            return Response.json({
              success: createResponse.success,
              id: createResponse.id,
            })
          } else
            return new Response('Error creating array storage', { status: 500 })
        }
        return new Response('Bad request or no session', { status: 401 })
      }),
      PUT: withAuthAndCSRF(async (req, session) => {
        const formData = await req.formData()
        const arrayId = formData.get('arrayId')?.toString()
        const items = formData.get('items')?.toString()
        if (session && arrayId && items) {
          const createResponse = await update(arrayId, JSON.parse(items))
          return new Response(`success: ${createResponse.success}`, {
            status: createResponse.success ? 200 : 400,
          })
        }
        return new Response('No session or arrayId or items', { status: 401 })
      }),
      DELETE: withAuthAndCSRF(async (req, session) => {
        const formData = await req.formData()
        const arrayId = formData.get('arrayId')?.toString()
        if (session && arrayId) {
          const createResponse = await remove(arrayId)
          return new Response(`success: ${createResponse.success}`, {
            status: createResponse.success ? 200 : 400,
          })
        }
        return new Response('No session or arrayId', { status: 401 })
      }),
    },
    '/api/array-storage/:id': {
      GET: withAuth(async (req, session, params) => {
        if (session) {
          const id = params?.id
          if (!id) {
            return Response.json(
              { status: 400, error: 'Missing ID parameter' },
              { status: 400 }
            )
          }
          const findOne = await getOne(id)
          return Response.json({
            name: findOne?.name,
            items: findOne?.items,
          })
        }
        return new Response('No session', { status: 401 })
      }),
    },
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

logger.info(`🚀 Server running at ${server.url}`)
