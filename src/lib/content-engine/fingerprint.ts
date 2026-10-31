import { createHash } from 'node:crypto'

export function createDiscoveryFingerprint(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  return createHash('sha256').update(normalized).digest('hex')
}
