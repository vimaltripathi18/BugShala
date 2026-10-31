'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, RefreshCw, Trash2 } from 'lucide-react'
import { copyText, downloadText } from './ToolControls'

const buttonClass = 'rounded-md border border-border px-3 py-2 text-sm hover:border-lime disabled:cursor-not-allowed disabled:opacity-50'
const inputClass = 'min-h-[220px] w-full resize-y rounded-card border border-border bg-[#101116] p-4 font-mono text-sm outline-none focus:border-lime'
const outputClass = 'min-h-[220px] w-full resize-y rounded-card border border-border bg-bg-surface p-4 font-mono text-sm outline-none'

function Button({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button type="button" className={buttonClass} onClick={onClick} disabled={disabled}>{children}</button>
}

function jsonLineColumn(input: string, error: SyntaxError) {
  const match = error.message.match(/position (\d+)/i)
  if (!match) return ''
  const position = Number(match[1])
  const prefix = input.slice(0, position)
  const lines = prefix.split('\n')
  return `Line ${lines.length}, column ${lines.at(-1)!.length + 1}`
}

function typeName(value: string) {
  const result = value.replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase()).replace(/^[^a-zA-Z]+/, '')
  return result ? result[0].toUpperCase() + result.slice(1) : 'Root'
}

function jsonToType(value: unknown, name = 'Root', seen = new Set<string>(), mode: 'interface' | 'type' = 'interface'): string {
  if (Array.isArray(value)) {
    if (!value.length) return `${name}: unknown[]`
    const types = [...new Set(value.map(item => jsonToType(item, name, seen, mode)))]
    return types.length === 1 ? `${name}: ${types[0]}[]` : `${name}: Array<${types.join(' | ')}> `
  }
  if (value === null) return `${name}: null`
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    return entries.map(([key, item]) => {
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key)
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const nested = jsonToType(item, typeName(key), seen, mode)
        return `${safeKey}${nested.startsWith('null') ? '?' : ''}: ${nested}`
      }
      if (Array.isArray(item)) return `${safeKey}: ${(item.length ? jsonToType(item[0], typeName(key), seen, mode) : 'unknown')}[]`
      return `${safeKey}: ${item === null ? 'unknown' : typeof item}`
    }).join('\n  ')
      .replace(/\n  /g, '\n  ')
  }
  return typeof value
}

function makeTypeScript(value: unknown, rootName: string, mode: 'interface' | 'type') {
  function render(value: unknown, depth = 0, optionalKeys: Set<string> = new Set(), name = 'Root'): string {
    if (Array.isArray(value)) {
      if (!value.length) return 'unknown[]'
      const objects = value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
      let item: unknown
      if (objects.length === value.length && objects.length) {
        item = objects.reduce<Record<string, unknown>>((merged, object) => {
          Object.keys(object).forEach(key => {
            merged[key] = merged[key] === undefined ? object[key] : [merged[key], object[key]]
          })
          return merged
        }, {})
      } else {
        item = [...new Set(value.map(entry => typeof entry))].length === 1 ? value[0] : value.filter(entry => entry !== null).map(entry => entry)[0] ?? value[0]
      }
      return `${render(item, depth, new Set(), name)}[]`
    }
    if (!value || typeof value !== 'object') return value === null ? 'unknown' : typeof value
    const indent = '  '.repeat(depth + 1)
    const entries = Object.entries(value as Record<string, unknown>)
    const lines = entries.map(([key, item]) => {
      const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key)
      const optional = optionalKeys.has(key) ? '?' : ''
      if (Array.isArray(item)) {
        const objects = item.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object' && !Array.isArray(entry))
        let itemType = 'unknown[]'
        if (objects.length === item.length && objects.length) {
          const merged = objects.reduce<Record<string, unknown>>((result, object) => {
            Object.keys(object).forEach(objectKey => {
              if (!(objectKey in result)) result[objectKey] = object[objectKey]
            })
            return result
          }, {})
          const optionalItems = new Set(Object.keys(merged).filter(objectKey => objects.some(object => !(objectKey in object))))
          itemType = `{\n${render(merged, depth + 1, optionalItems).split('\n').map(line => `${indent}${line}`).join('\n')}\n${indent}}[]`
        } else if (item.length) {
          itemType = `${render(item[0], depth + 1)}[]`
        }
        return `${indent}${safeKey}${optional}: ${itemType}`
      }
      if (item && typeof item === 'object') return `${indent}${safeKey}: ${render(item, depth + 1)}`
      return `${indent}${safeKey}${optional}: ${item === null ? 'unknown' : typeof item}`
    })
    return lines.join('\n')
  }
  const parsed = render(value)
  if (Array.isArray(value) || !value || typeof value !== 'object') return `${mode === 'interface' ? 'type' : 'type'} ${rootName} = ${parsed}`
  return mode === 'interface'
    ? `export interface ${rootName} {\n${parsed}\n}`
    : `export type ${rootName} = {\n${parsed}\n}`
}

function base64Encode(value: string) {
  return btoa(Array.from(new TextEncoder().encode(value), byte => String.fromCharCode(byte)).join(''))
}

function base64Decode(value: string) {
  const normalized = value.replace(/\s/g, '')
  if (!normalized || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) {
    throw new Error('Enter valid Base64 with groups of 4 characters.')
  }
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  return decoded
}

function decodeJwtPart(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return JSON.stringify(JSON.parse(new TextDecoder().decode(bytes)), null, 2)
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  const expanded = value.length === 3 ? value.split('').map(char => char + char).join('') : value
  if (!/^([0-9a-f]{6})$/i.test(expanded)) throw new Error('Enter a valid 3 or 6 digit HEX color.')
  return [0, 2, 4].map(index => parseInt(expanded.slice(index, index + 2), 16))
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255, green = g / 255, blue = b / 255
  const max = Math.max(red, green, blue), min = Math.min(red, green, blue)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const difference = max - min
    s = l > 0.5 ? difference / (2 - max - min) : difference / (max + min)
    switch (max) {
      case red: h = (green - blue) / difference + (green < blue ? 6 : 0); break
      case green: h = (blue - red) / difference + 2; break
      default: h = (red - green) / difference + 4
    }
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function parseCssColor(input: string): { r: number; g: number; b: number; a: number } {
  const value = input.trim().toLowerCase()
  if (value.startsWith('#')) {
    const [r, g, b] = hexToRgb(value)
    return { r, g, b, a: 1 }
  }
  const functional = value.match(/^((?:rgb|rgba|hsl|hsla))\(\s*(.+)\s*\)$/)
  if (!functional) throw new Error('Enter HEX, RGB(A), or HSL(A).')
  const kind = functional[1]
  const parts = functional[2].split(/[,\s\/]+/).filter(Boolean)
  if ((kind.startsWith('rgb')) && parts.length >= 3) {
    const numbers = parts.slice(0, 3).map(part => {
      const number = Number(part)
      if (!Number.isFinite(number) || number < 0 || number > 255) throw new Error('RGB channels must be between 0 and 255.')
      return number
    })
    const alpha = parts.length > 3 ? parseFloat(parts[3]) : 1
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) throw new Error('Alpha must be between 0 and 1.')
    return { r: numbers[0], g: numbers[1], b: numbers[2], a: alpha }
  }
  if (kind.startsWith('hsl') && parts.length >= 3) {
    const hue = parseFloat(parts[0])
    const saturation = parseFloat(parts[1])
    const lightness = parseFloat(parts[2])
    const alpha = parts.length > 3 ? parseFloat(parts[3]) : 1
    if (!Number.isFinite(hue) || hue < 0 || hue > 360 || !Number.isFinite(saturation) || saturation < 0 || saturation > 100 || !Number.isFinite(lightness) || lightness < 0 || lightness > 100 || !Number.isFinite(alpha) || alpha < 0 || alpha > 1) throw new Error('Use HSL hue 0-360, saturation/lightness 0-100, and alpha 0-1.')
    const h = hue / 360
    const s = saturation / 100
    const l = lightness / 100
    const hueToRgb = (p: number, q: number, t: number) => {
      let n = t
      if (n < 0) n += 1
      if (n > 1) n -= 1
      if (n < 1 / 6) return p + (q - p) * 6 * n
      if (n < 1 / 2) return q
      if (n < 2 / 3) return p + (q - p) * (2 / 3 - n) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    return { r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255), g: Math.round(hueToRgb(p, q, h) * 255), b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255), a: alpha }
  }
  throw new Error('Enter a valid RGB(A) or HSL(A) color.')
}

export default function DevKitTool({ slug }: { slug: string }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState('2')
  const [rootName, setRootName] = useState('Root')
  const [typeMode, setTypeMode] = useState<'interface' | 'type'>('interface')
  const [regexFlags, setRegexFlags] = useState('gi')
  const [regexPattern, setRegexPattern] = useState('')
  const [regexMatches, setRegexMatches] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [timestampUnit, setTimestampUnit] = useState<'seconds' | 'milliseconds' | 'automatic'>('automatic')
  const [dateValue, setDateValue] = useState('')
  const [uuidCount, setUuidCount] = useState(5)
  const [language, setLanguage] = useState('json')
  const [gradientType, setGradientType] = useState('linear')
  const [angle, setAngle] = useState(135)
  const [colorOne, setColorOne] = useState('#C5F36A')
  const [colorTwo, setColorTwo] = useState('#3178C6')
  const [color, setColor] = useState('#C5F36A')

  const gradient = gradientType === 'linear'
    ? `linear-gradient(${angle}deg, ${colorOne}, ${colorTwo})`
    : `radial-gradient(circle, ${colorOne}, ${colorTwo})`

  const colorFormats = useMemo(() => {
    try {
      const { r, g, b, a } = parseCssColor(color)
      const hsl = rgbToHsl(r, g, b)
      const hex = `#${[r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`
      return {
        hex,
        rgb: a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`,
        hsl: a === 1 ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`,
        error: '',
      }
    } catch (caught) {
      return { hex: '', rgb: '', hsl: '', error: caught instanceof Error ? caught.message : 'Invalid color.' }
    }
  }, [color])

  async function run() {
    setError('')
    try {
      switch (slug) {
        case 'json-formatter': {
          if (!input.trim()) throw new Error('Enter JSON to format or validate.')
          const parsed = JSON.parse(input)
          setOutput(JSON.stringify(parsed, null, indent === '\t' ? '\t' : Number(indent) || 2))
          break
        }
        case 'json-to-typescript': {
          if (!input.trim()) throw new Error('Enter JSON to generate TypeScript.')
          setOutput(makeTypeScript(JSON.parse(input), rootName || 'Root', typeMode))
          break
        }
        case 'base64': {
          setOutput(base64Encode(input))
          break
        }
        case 'url-encoder': {
          if (!input.length) throw new Error('Enter text to URL-encode.')
          try {
            setOutput(encodeURIComponent(input))
          } catch {
            throw new Error('The input contains an incomplete Unicode surrogate and cannot be encoded.')
          }
          break
        }
        case 'regex-tester': {
          if (!regexPattern) throw new Error('Enter a regular expression.')
          const WorkerSource = `
            self.onmessage = function(event) {
              const { pattern, flags, text } = event.data;
              try {
                const regex = new RegExp(pattern, flags);
                const matches = [];
                let match;
                while ((match = regex.exec(text.slice(0, 100000))) && matches.length < 500) {
                  matches.push({
                    value: match[0], index: match.index, groups: match.slice(1),
                    namedGroups: match.groups ?? {}
                  });
                  if (!regex.global) break;
                  if (match[0] === '') regex.lastIndex += 1;
                }
                self.postMessage({ matches });
              } catch (error) { self.postMessage({ error: error.message }); }
            };
          `
          const url = URL.createObjectURL(new Blob([WorkerSource], { type: 'text/javascript' }))
          if (typeof Worker === 'undefined') {
            URL.revokeObjectURL(url)
            throw new Error('Web Workers are unavailable in this browser. Regex testing cannot run safely.')
          }
          const worker = new Worker(url)
          window.setTimeout(() => URL.revokeObjectURL(url), 0)
          const timeout = window.setTimeout(() => {
            worker.terminate()
            setRegexMatches('')
            setError('Regex execution timed out. Try a simpler pattern.')
          }, 500)
          worker.onmessage = event => {
            window.clearTimeout(timeout)
            worker.terminate()
            if (event.data.error) setError(event.data.error)
            else setRegexMatches(`${event.data.matches.length} match${event.data.matches.length === 1 ? '' : 'es'}${event.data.matches.length ? '\n' : ''}${event.data.matches.map((match: { value: string; index: number; groups: string[]; namedGroups: Record<string, string> }) => `${match.index}: ${match.value}${match.groups.length ? ` — groups: ${match.groups.join(', ')}` : ''}${Object.keys(match.namedGroups).length ? ` — named: ${JSON.stringify(match.namedGroups)}` : ''}`).join('\n')}`)
          }
          worker.postMessage({ pattern: regexPattern, flags: regexFlags, text: input })
          break
        }
        case 'hash-generator': {
          const encoded = new TextEncoder().encode(input)
          const digest = await crypto.subtle.digest('SHA-256', encoded)
          setOutput([...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''))
          break
        }
        case 'uuid-generator': {
          setOutput(Array.from({ length: Math.min(Math.max(uuidCount, 1), 100) }, () => crypto.randomUUID()).join('\n'))
          break
        }
        case 'code-formatter': {
          if (!input.trim()) throw new Error(`Enter ${language.toUpperCase()} code to format.`)
          const prettier = await import('prettier/standalone')
          const plugins: unknown[] = []
          let parser = language
          if (language === 'html') plugins.push((await import('prettier/plugins/html')).default)
          if (language === 'css') plugins.push((await import('prettier/plugins/postcss')).default)
          if (language === 'json') {
            parser = 'json'
            plugins.push((await import('prettier/plugins/babel')).default, (await import('prettier/plugins/estree')).default)
          }
          if (language === 'javascript') plugins.push((await import('prettier/plugins/babel')).default, (await import('prettier/plugins/estree')).default)
          setOutput(await prettier.format(input, { parser: parser === 'javascript' ? 'babel' : parser, plugins: plugins as never[], tabWidth: Number(indent) }))
          break
        }
      }
    } catch (caught) {
      setError(caught instanceof SyntaxError ? `${caught.message}. ${jsonLineColumn(input, caught)}` : caught instanceof Error ? caught.message : 'Invalid input.')
    }
  }

  async function decode(action: 'decodeBase64' | 'decodeUrl' | 'decodeJwt') {
    setError('')
    try {
      if (action === 'decodeBase64') setOutput(base64Decode(input))
      if (action === 'decodeUrl') {
        if (!input) throw new Error('Enter encoded text to URL-decode.')
        if (/%(?![0-9a-fA-F]{2})/.test(input)) throw new Error('Malformed percent escape. Use % followed by two hexadecimal digits.')
        setOutput(decodeURIComponent(input))
      }
      if (action === 'decodeJwt') {
        const parts = input.trim().split('.')
        if (parts.length !== 3) throw new Error('A JWT must contain three dot-separated parts.')
        const header = decodeJwtPart(parts[0])
        const payload = decodeJwtPart(parts[1])
        const claims = JSON.parse(payload) as { exp?: unknown; nbf?: unknown }
        const nowSeconds = Math.floor(Date.now() / 1000)
        const warnings = [
          claims.exp !== undefined && (!Number.isFinite(Number(claims.exp)) || Number(claims.exp) < nowSeconds)
            ? `Token is expired${Number.isFinite(Number(claims.exp)) ? ` (exp ${new Date(Number(claims.exp) * 1000).toISOString()})` : '.'}`
            : '',
          claims.nbf !== undefined && Number.isFinite(Number(claims.nbf)) && Number(claims.nbf) > nowSeconds
            ? 'Token is not yet valid (nbf is in the future).'
            : '',
        ].filter(Boolean)
        setOutput(`HEADER\n${header}\n\nPAYLOAD\n${payload}${warnings.length ? `\n\nCLAIM STATUS\n${warnings.join('\n')}` : ''}`)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Invalid input.')
    }
  }

  async function hashAlgorithm(algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512') {
    setError('')
    try {
      if (!globalThis.crypto?.subtle) throw new Error('Web Crypto hashing is unavailable in this browser or connection. Use a modern browser on HTTPS or localhost.')
      const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input))
      setOutput([...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'This browser does not support Web Crypto hashing.')
    }
  }

  const common = (
    <div className="flex flex-wrap gap-2 border-t border-border pt-4">
      <Button onClick={() => void run()}><RefreshCw className="mr-2 inline" size={14} />Run</Button>
      <Button onClick={() => void copyText(output)} disabled={!output}><Copy className="mr-2 inline" size={14} />Copy</Button>
      <Button onClick={() => { setInput(''); setOutput(''); setError('') }}><Trash2 className="mr-2 inline" size={14} />Clear</Button>
      <Button onClick={() => downloadText(`${slug}.txt`, output)} disabled={!output}><Download className="mr-2 inline" size={14} />Download</Button>
    </div>
  )

  return (
    <>
      {slug === 'json-formatter' && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm"><label htmlFor="json-indent">Indentation</label><select id="json-indent" className="rounded-md border border-border bg-bg-surface px-3 py-2" value={indent} onChange={event => setIndent(event.target.value)}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="\t">Tab</option></select><Button onClick={() => { try { if (!input.trim()) throw new Error('Enter JSON to format or validate.'); setOutput(JSON.stringify(JSON.parse(input))); setError('') } catch (caught) { setError(caught instanceof Error ? caught.message : 'Invalid JSON.') } }}>Minify JSON</Button></div>
      )}
      {slug === 'json-to-typescript' && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2"><input aria-label="Root type name" className="rounded-md border border-border bg-bg-surface px-3 py-2" value={rootName} onChange={event => setRootName(event.target.value)} /><select aria-label="Type style" className="rounded-md border border-border bg-bg-surface px-3 py-2" value={typeMode} onChange={event => setTypeMode(event.target.value as 'interface' | 'type')}><option value="interface">Interface</option><option value="type">Type alias</option></select></div>
      )}
      {slug === 'code-formatter' && (
        <div className="mb-4 flex gap-3"><select aria-label="Language" className="rounded-md border border-border bg-bg-surface px-3 py-2" value={language} onChange={event => setLanguage(event.target.value)}><option value="html">HTML</option><option value="css">CSS</option><option value="javascript">JavaScript</option><option value="json">JSON</option></select><select aria-label="Indentation" className="rounded-md border border-border bg-bg-surface px-3 py-2" value={indent} onChange={event => setIndent(event.target.value)}><option value="2">2 spaces</option><option value="4">4 spaces</option></select></div>
      )}
      {slug === 'regex-tester' && (
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]"><input aria-label="Regular expression" className="rounded-md border border-border bg-bg-surface px-3 py-2 font-mono" placeholder="Regular expression" value={regexPattern} onChange={event => setRegexPattern(event.target.value)} /><input aria-label="Regex flags" className="rounded-md border border-border bg-bg-surface px-3 py-2 font-mono" placeholder="Flags, for example gi" value={regexFlags} onChange={event => setRegexFlags(event.target.value)} /></div>
      )}
      {slug === 'uuid-generator' && (
        <div className="mb-4 flex items-center gap-3 text-sm"><label>Count</label><input className="w-24 rounded-md border border-border bg-bg-surface px-3 py-2" type="number" min="1" max="100" value={uuidCount} onChange={event => setUuidCount(Number(event.target.value))} /></div>
      )}
      {slug === 'jwt-decoder' && <p className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">Decoding a JWT does not verify its authenticity.</p>}
      {slug === 'base64' && <p className="mb-4 text-xs text-text-muted">Base64 is encoding, not encryption.</p>}
      {slug === 'hash-generator' && <p className="mb-4 text-xs text-text-muted">Hashing is not encryption and should not be treated as a password-storage solution.</p>}

      {(slug === 'css-gradient' || slug === 'color-converter') ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {slug === 'css-gradient' && <>
            <div className="rounded-card border border-border bg-bg-surface p-4">
              <div className="mb-4 flex gap-3"><select className="rounded-md border border-border bg-bg-elevated px-3 py-2" value={gradientType} onChange={e => setGradientType(e.target.value)}><option value="linear">Linear</option><option value="radial">Radial</option></select>{gradientType === 'linear' && <input className="w-full" type="range" min="0" max="360" value={angle} onChange={e => setAngle(Number(e.target.value))} />}</div>
              <label className="block text-xs text-text-muted">Start</label><input aria-label="Start color" className="mt-2 h-12 w-full" type="color" value={colorOne} onChange={e => setColorOne(e.target.value)} />
              <label className="mt-4 block text-xs text-text-muted">End</label><input aria-label="End color" className="mt-2 h-12 w-full" type="color" value={colorTwo} onChange={e => setColorTwo(e.target.value)} />
            </div>
            <div><div className="min-h-[220px] rounded-card border border-border" style={{ background: gradient }} /><textarea readOnly className={`${outputClass} mt-4`} value={`background: ${gradient};`} /><Button onClick={() => copyText(`background: ${gradient};`)}>Copy CSS</Button></div>
          </>}
          {slug === 'color-converter' && <>
            <div className="rounded-card border border-border bg-bg-surface p-4"><label htmlFor="color-input" className="text-xs text-text-muted">Color value</label><input id="color-input" aria-label="Color value" className="mt-2 w-full rounded-md border border-border bg-bg-elevated px-3 py-2 font-mono" value={color} onChange={e => setColor(e.target.value)} /><div className="mt-5 h-44 rounded-card border border-border" style={{ background: colorFormats.error ? 'transparent' : colorFormats.hex }} /></div>
            <div className="space-y-3">{['hex', 'rgb', 'hsl'].map(format => <div key={format} className="flex items-center justify-between rounded-card border border-border bg-bg-surface p-4"><div><p className="text-xs uppercase text-text-muted">{format}</p><code>{colorFormats[format as 'hex' | 'rgb' | 'hsl']}</code></div><Button onClick={() => copyText(colorFormats[format as 'hex' | 'rgb' | 'hsl'])}>Copy</Button></div>)}{colorFormats.error && <p className="text-sm text-red-300">{colorFormats.error}</p>}</div>
          </>}
        </div>
      ) : slug === 'timestamp' ? (
        <div className="grid gap-4 rounded-card border border-border bg-bg-surface p-5 md:grid-cols-2">
          <div>
            <label htmlFor="timestamp-unit" className="text-sm">Timestamp unit</label>
            <select id="timestamp-unit" aria-label="Timestamp unit" className="mt-2 mb-3 w-full rounded-md border border-border bg-bg-elevated px-3 py-2" value={timestampUnit} onChange={e => setTimestampUnit(e.target.value as typeof timestampUnit)}>
              <option value="seconds">Seconds</option>
              <option value="milliseconds">Milliseconds</option>
              <option value="automatic">Automatic detection (advisory)</option>
            </select>
            <label htmlFor="unix-timestamp" className="text-sm">Unix timestamp</label>
            <input id="unix-timestamp" className="mt-2 w-full rounded-md border border-border bg-bg-elevated px-3 py-2 font-mono" value={timestamp} onChange={e => setTimestamp(e.target.value)} />
            <Button onClick={() => {
              const text = timestamp.trim()
              if (!text) { setOutput(''); setError('Enter a Unix timestamp. Empty input is not the Unix epoch.'); return }
              if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) { setOutput(''); setError('Enter a numeric Unix timestamp.'); return }
              const number = Number(text)
              const milliseconds = timestampUnit === 'seconds' ? number * 1000 : timestampUnit === 'milliseconds' ? number : Math.abs(number) >= 100000000000 ? number : number * 1000
              const date = new Date(milliseconds)
              if (!Number.isFinite(date.getTime())) { setOutput(''); setError('The timestamp is outside JavaScript Date range.'); return }
              setOutput(`UTC: ${date.toISOString()}\nLocal: ${date.toString()}${timestampUnit === 'automatic' ? '\nAutomatic unit detection is advisory; choose the unit explicitly when known.' : ''}`)
              setError('')
            }}>Convert</Button>
          </div>
          <div><label className="text-sm">Date and time</label><input className="mt-2 w-full rounded-md border border-border bg-bg-elevated px-3 py-2" type="datetime-local" value={dateValue} onChange={e => setDateValue(e.target.value)} /><Button onClick={() => { if (!dateValue) { setOutput(''); setError('Choose a date and time.'); return } const date = new Date(dateValue); const value = date.getTime(); setOutput(isNaN(value) ? '' : `${Math.floor(value / 1000)} seconds\n${value} milliseconds`); setError(isNaN(value) ? 'Invalid date.' : '') }}>Convert</Button></div>
          <textarea readOnly aria-label="Timestamp result" className={`${outputClass} md:col-span-2`} value={output} />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div><label htmlFor="devkit-input" className="mb-2 block text-xs text-text-muted">Input</label><textarea id="devkit-input" aria-label="Input" className={inputClass} value={input} onChange={event => setInput(event.target.value)} spellCheck={false} /></div>
          <div><label htmlFor="devkit-output" className="mb-2 block text-xs text-text-muted">{slug === 'regex-tester' ? 'Matches' : 'Output'}</label><textarea id="devkit-output" aria-label={slug === 'regex-tester' ? 'Matches' : 'Output'} readOnly className={outputClass} value={slug === 'regex-tester' ? regexMatches : output} spellCheck={false} /></div>
          <div className="lg:col-span-2">
            {error && <p role="alert" className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            {slug === 'base64' && <div className="mb-4 flex gap-2"><Button onClick={() => void run()}>Encode</Button><Button onClick={() => void decode('decodeBase64')}>Decode</Button></div>}
            {slug === 'url-encoder' && <div className="mb-4 flex gap-2"><Button onClick={() => void run()}>Encode</Button><Button onClick={() => void decode('decodeUrl')}>Decode</Button></div>}
            {slug === 'jwt-decoder' && <div className="mb-4"><Button onClick={() => void decode('decodeJwt')}>Decode token</Button></div>}
            {slug === 'hash-generator' && <div className="mb-4 flex gap-2"><Button onClick={() => void hashAlgorithm('SHA-256')}>SHA-256</Button><Button onClick={() => void hashAlgorithm('SHA-384')}>SHA-384</Button><Button onClick={() => void hashAlgorithm('SHA-512')}>SHA-512</Button></div>}
            {slug === 'regex-tester' && <div className="mb-4"><Button onClick={() => void run()}>Test expression</Button></div>}
            {slug !== 'base64' && slug !== 'url-encoder' && slug !== 'jwt-decoder' && slug !== 'hash-generator' && slug !== 'regex-tester' && common}
          </div>
        </div>
      )}
    </>
  )
}
