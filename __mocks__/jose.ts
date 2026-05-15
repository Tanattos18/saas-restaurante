const { TextEncoder, TextDecoder } = require('util')

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) base64 += '='
  return Buffer.from(base64, 'base64')
}

class SignJWTMock {
  private _payload: object
  private _secret: Buffer | null = null

  constructor(payload: object) {
    this._payload = payload
  }

  setProtectedHeader(header: { alg: string }): this {
    return this
  }

  setIssuedAt(): this {
    return this
  }

  setExpirationTime(exp: string): this {
    return this
  }

  async sign(secret: Buffer | string): Promise<string> {
    const header = base64UrlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
    const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(this._payload)))
    const signature = base64UrlEncode(Buffer.from('mock-signature-' + Date.now()))
    return `${header}.${payloadB64}.${signature}`
  }
}

export class SignJWT extends SignJWTMock {}

export async function jwtVerify(token: string, _secret: Buffer | string) {
  const parts = token.split('.')
  if (parts.length !== 3) return { payload: null }
  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]).toString())
    return { payload } as any
  } catch {
    return { payload: null }
  }
}

export type JWTPayload = {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: unknown
}