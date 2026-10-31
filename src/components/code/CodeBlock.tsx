'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  variant?: 'default' | 'incorrect' | 'correct'
  className?: string
}

export default function CodeBlock({
  code,
  language = 'javascript',
  filename,
  showLineNumbers = false,
  variant = 'default',
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const variantBorderColor = {
    default: '#343843',
    incorrect: 'rgba(240,113,120,0.3)',
    correct: 'rgba(72,199,142,0.3)',
  }

  const variantHeaderBg = {
    default: '#191B22',
    incorrect: 'rgba(240,113,120,0.05)',
    correct: 'rgba(72,199,142,0.05)',
  }

  const variantLabel = {
    default: null,
    incorrect: { text: 'Incorrect', color: '#F07178' },
    correct: { text: 'Corrected', color: '#48C78E' },
  }

  const label = variantLabel[variant]
  const lines = code.split('\n')

  return (
    <div
      className={cn('rounded-xl overflow-hidden', className)}
      style={{
        border: `1px solid ${variantBorderColor[variant]}`,
        backgroundColor: '#13151A',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b gap-3"
        style={{
          backgroundColor: variantHeaderBg[variant],
          borderColor: variantBorderColor[variant],
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {label && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{
                color: label.color,
                backgroundColor: `${label.color}15`,
                border: `1px solid ${label.color}30`,
              }}
            >
              {label.text}
            </span>
          )}
          {filename && (
            <span
              className="text-[12px] truncate"
              style={{
                color: '#A1A5B0',
                fontFamily: 'var(--font-jetbrains-mono)',
              }}
            >
              {filename}
            </span>
          )}
          {!filename && (
            <span
              className="text-[11px]"
              style={{ color: '#747986', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-all duration-150 shrink-0"
          style={{
            color: copied ? '#48C78E' : '#747986',
            backgroundColor: copied ? 'rgba(72,199,142,0.1)' : 'transparent',
          }}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre
          className="p-4 text-[13px] leading-relaxed m-0"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), Consolas, monospace',
            color: '#E7E9EE',
            minWidth: 'max-content',
          }}
        >
          {showLineNumbers ? (
            <table className="border-collapse w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td
                      className="select-none pr-4 text-right align-top"
                      style={{
                        color: '#4A5060',
                        fontSize: '12px',
                        minWidth: '2.5rem',
                        userSelect: 'none',
                      }}
                    >
                      {i + 1}
                    </td>
                    <td className="align-top">
                      <code>{line || '\u200B'}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  )
}
