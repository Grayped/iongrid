import type { Session, User } from 'generated/prisma/client'
import { prisma } from 'lib/prisma'
import jwt from 'jsonwebtoken'
import { logger } from '.'

export async function login(username: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  })
  if (user && (await Bun.password.verify(password, user.password))) {
    return await getToken(user)
  }
  return { success: false, token: undefined, sessionId: undefined };
}

async function getToken(user: User) {
  const today = new Date() // Get the current date and time
  const expiryDate = new Date(today) // Create a new object to avoid mutating the original
  expiryDate.setDate(today.getDate() + 7) // Add one to the current day of the month

  const newSession = {
    id: Bun.randomUUIDv7('base64url'),
    userId: user.id,
    expiresAt: new Date(expiryDate),
  } as any

  try {
    await prisma.session.create({ data: newSession })
  } catch (e: any) {
    console.log('Error creating session: ', e.message)
    return { success: false, token: '', sessionId: ''}
  }
  // const buffer = Buffer.from(newSession.id)
  // const base64String = buffer.toString('base64url')
 if (!process.env.JWT_SECRET) {
  logger.error('No process.env.JWT_SECRET');
  return { success: false, token: '', sessionId: ''}
 }
  const jwtToken = await jwt.sign(
    {
      sessionId: newSession.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: Number(process.env.MAX_AGE_MS) || '1w'}
  )
  return { success: true, token: jwtToken, sessionId: newSession.id };
}

export async function register(newUser: any) {
  const candidate = { ...newUser } as any
  candidate.password = await Bun.password.hash(newUser.password)
  candidate.id = Bun.randomUUIDv7('buffer')

  try {
    await prisma.user.create({ data: candidate })
    return {
      success: true,
    }
  } catch (e: any) {
    logger.error('Error creating user: ' + e.message)
    return {
      success: false,
    }
  }
}

export async function middleware(token: string) {
  if (!token) return false
  try {
    const tokenResponse = await validateDecodeToken(token)

    if (tokenResponse.success && tokenResponse.data) {
      const session = await prisma.session.findFirst({
        where: {
          id: tokenResponse.data.sessionId,
        },
      })
      const today = Date.now()
      return session && session.expiresAt > new Date(today)
    } else {
      return false
    }
  } catch (e: any) {
    console.log('Middleware: ', e.message)
    return false
  }
}

export async function validateDecodeToken(token: string) {
  if (!token || !process.env.JWT_SECRET) {
    if (!process.env.JWT_SECRET) logger.error('process.env.JWT_SECRET is undefined');
    return { success: false, data: {} }
  }
  const decodedToken = (await jwt.verify(token, process.env.JWT_SECRET)) as any
  return { success: true, data: decodedToken }
}
