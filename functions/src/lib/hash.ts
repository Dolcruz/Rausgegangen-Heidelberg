import crypto from 'node:crypto'

export function sha1Hex(input: string): string {
  return crypto.createHash('sha1').update(input).digest('hex')
}


