import {
  Binary,
  Braces,
  Code2,
  Fingerprint,
  Hash,
  KeyRound,
  Palette,
  Regex,
  Timer,
  Type,
  WandSparkles,
} from 'lucide-react'

export interface DevTool {
  slug: string
  name: string
  description: string
  category: string
  icon: typeof Braces
}

export const devTools: DevTool[] = [
  { slug: 'json-formatter', name: 'JSON Formatter', description: 'Format, minify, and validate JSON.', category: 'JSON and Data', icon: Braces },
  { slug: 'json-to-typescript', name: 'JSON to TypeScript', description: 'Generate TypeScript types from JSON.', category: 'JSON and Data', icon: Type },
  { slug: 'base64', name: 'Base64 Encoder', description: 'Encode and decode Unicode text safely.', category: 'Encoding and Decoding', icon: Binary },
  { slug: 'url-encoder', name: 'URL Encoder', description: 'Encode and decode URL components.', category: 'Encoding and Decoding', icon: WandSparkles },
  { slug: 'jwt-decoder', name: 'JWT Decoder', description: 'Inspect decoded JWT headers and claims.', category: 'Security and Tokens', icon: KeyRound },
  { slug: 'regex-tester', name: 'Regex Tester', description: 'Test patterns and inspect capture groups.', category: 'Text and Regex', icon: Regex },
  { slug: 'hash-generator', name: 'Hash Generator', description: 'Generate SHA hashes with Web Crypto.', category: 'Security and Tokens', icon: Hash },
  { slug: 'timestamp', name: 'Timestamp Converter', description: 'Convert Unix timestamps and dates.', category: 'Date and Time', icon: Timer },
  { slug: 'uuid-generator', name: 'UUID Generator', description: 'Create secure UUID v4 identifiers.', category: 'Developer Utilities', icon: Fingerprint },
  { slug: 'code-formatter', name: 'Code Formatter', description: 'Format HTML, CSS, JavaScript, and JSON.', category: 'Developer Utilities', icon: Code2 },
  { slug: 'css-gradient', name: 'CSS Gradient Generator', description: 'Build and copy linear or radial gradients.', category: 'CSS and Design', icon: Palette },
  { slug: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, and HSL.', category: 'CSS and Design', icon: Palette },
]
