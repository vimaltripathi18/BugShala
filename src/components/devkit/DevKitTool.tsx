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
  function render(value: unknown, name: string, depth = 0): string {
    if (Array.isArray(value)) {
      if (!value.length) return 'unknown[]'
      return `${render(value[0], name, depth)}[]`
    }
    if (!value || typeof value !== 'object') return value === null ? 'unknown' : typeof value
    const indent = '  '.repeat(depth + 1)
    const entries = Object.entries(value as Record<string, unknown>)
    const lines = entries.map(([key, item]) => {
      const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key)
      const nestedName = `${typeName(name)}${typeName(key)}`
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const nested = render(item, nestedName, depth + 1)
        return `${indent}${safeKey}: {\n${nested.replace(/^/gm, indent)}\n${indent}}`
      }
      if (Array.isArray(item)) {
        const itemType = item.length ? render(item[0], nestedName, depth + 1) : 'unknown'
        return `${indent}${safeKey}: ${itemType}[]`
      }
      return `${indent}${safeKey}: ${item === null ? 'unknown' : typeof item}`
    })
    return lines.join('\n')
  }
  const parsed = render(value, rootName)
  if (Array.isArray(value) || !value || typeof value !== 'object') return `${mode === 'interface' ? 'type' : 'type'} ${rootName} = ${parsed}`
  return mode === 'interface'
    ? `export interface ${rootName} {\n${parsed}\n}`
    : `export type ${rootName} = {\n${parsed}\n}`
}

function base64Encode(value: string) {
  return btoa(Array.from(new TextEncoder().encode(value), byte => String.fromCharCode(byte)).join(''))
}

function base64Decode(value: string) {
  const binary = atob(value.replace(/\s/g, ''))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new TextDecoder().decode(bytes)
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
      const [r, g, b] = hexToRgb(color)
      const hsl = rgbToHsl(r, g, b)
      return { hex: color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, error: '' }
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
          setOutput(JSON.stringify(parsed, null, Number(indent) || 2))
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
          setOutput(encodeURIComponent(input))
          break
        }
        case 'regex-tester': {
          const WorkerSource = `
            self.onmessage = function(event) {
              const { pattern, flags, text } = event.data;
              try {
                const regex = new RegExp(pattern, flags);
                const matches = [...text.slice(0, 100000).matchAll(regex)].slice(0, 500).map(match => ({
                  value: match[0], index: match.index, groups: match.slice(1)
                }));
                self.postMessage({ matches });
              } catch (error) { self.postMessage({ error: error.message }); }
            };
          `
          const url = URL.createObjectURL(new Blob([WorkerSource], { type: 'text/javascript' }))
          const worker = new Worker(url)
          URL.revokeObjectURL(url)
          const timeout = window.setTimeout(() => {
            worker.terminate()
            setError('Regex execution timed out. Try a simpler pattern.')
          }, 500)
          worker.onmessage = event => {
            window.clearTimeout(timeout)
            worker.terminate()
            if (event.data.error) setError(event.data.error)
            else setRegexMatches(`${event.data.matches.length} match${event.data.matches.length === 1 ? '' : 'es'}\n${event.data.matches.map((match: { value: string; index: number; groups: string[] }) => `${match.index}: ${match.value}${match.groups.length ? ` — groups: ${match.groups.join(', ')}` : ''}`).join('\n')}`)
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
          const prettier = await import('prettier/standalone')
          const plugins: unknown[] = []
          let parser = language
          if (language === 'html') plugins.push((await import('prettier/plugins/html')).default)
          if (language === 'css') plugins.push((await import('prettier/plugins/postcss')).default)
          if (language === 'json') parser = 'json'
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
      if (action === 'decodeUrl') setOutput(decodeURIComponent(input))
      if (action === 'decodeJwt') {
        const parts = input.trim().split('.')
        if (parts.length !== 3) throw new Error('A JWT must contain three dot-separated parts.')
        setOutput(`HEADER\n${decodeJwtPart(parts[0])}\n\nPAYLOAD\n${decodeJwtPart(parts[1])}`)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Invalid input.')
    }
  }

  async function hashAlgorithm(algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512') {
    setError('')
    try {
      const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input))
      setOutput([...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join(''))
    } catch {
      setError('This browser does not support Web Crypto hashing.')
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
        <div className="mb-4 flex items-center gap-3 text-sm"><label>Indentation</label><select className="rounded-md border border-border bg-bg-surface px-3 py-2" value={indent} onChange={event => setIndent(event.target.value)}><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="\t">Tab</option></select></div>
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
            <div className="rounded-card border border-border bg-bg-surface p-4"><label className="text-xs text-text-muted">HEX color</label><input className="mt-2 w-full rounded-md border border-border bg-bg-elevated px-3 py-2 font-mono" value={color} onChange={e => setColor(e.target.value)} /><div className="mt-5 h-44 rounded-card border border-border" style={{ background: colorFormats.error ? 'transparent' : colorFormats.hex }} /></div>
            <div className="space-y-3">{['hex', 'rgb', 'hsl'].map(format => <div key={format} className="flex items-center justify-between rounded-card border border-border bg-bg-surface p-4"><div><p className="text-xs uppercase text-text-muted">{format}</p><code>{colorFormats[format as 'hex' | 'rgb' | 'hsl']}</code></div><Button onClick={() => copyText(colorFormats[format as 'hex' | 'rgb' | 'hsl'])}>Copy</Button></div>)}{colorFormats.error && <p className="text-sm text-red-300">{colorFormats.error}</p>}</div>
          </>}
        </div>
      ) : slug === 'timestamp' ? (
        <div className="grid gap-4 rounded-card border border-border bg-bg-surface p-5 md:grid-cols-2">
          <div><label className="text-sm">Unix timestamp</label><input className="mt-2 w-full rounded-md border border-border bg-bg-elevated px-3 py-2 font-mono" value={timestamp} onChange={e => setTimestamp(e.target.value)} /><Button onClick={() => { const number = Number(timestamp); const milliseconds = timestamp.length > 10 ? number : number * 1000; const date = new Date(milliseconds); setOutput(isNaN(date.getTime()) ? '' : `${date.toUTCString()}\n${date.toString()}`); setError(isNaN(date.getTime()) ? 'Invalid Unix timestamp.' : '') }}>Convert</Button></div>
          <div><label className="text-sm">Date and time</label><input className="mt-2 w-full rounded-md border border-border bg-bg-elevated px-3 py-2" type="datetime-local" value={dateValue} onChange={e => setDateValue(e.target.value)} /><Button onClick={() => { const date = new Date(dateValue); const value = date.getTime(); setOutput(isNaN(value) ? '' : `${Math.floor(value / 1000)} seconds\n${value} milliseconds`); setError(isNaN(value) ? 'Invalid date.' : '') }}>Convert</Button></div>
          <textarea readOnly aria-label="Timestamp result" className={`${outputClass} md:col-span-2`} value={output} />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div><label className="mb-2 block text-xs text-text-muted">Input</label><textarea className={inputClass} value={input} onChange={event => setInput(event.target.value)} spellCheck={false} /></div>
          <div><label className="mb-2 block text-xs text-text-muted">{slug === 'regex-tester' ? 'Matches' : 'Output'}</label><textarea readOnly className={outputClass} value={slug === 'regex-tester' ? regexMatches : output} spellCheck={false} /></div>
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
