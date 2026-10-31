'use client'

import { useEffect, useState } from 'react'
import type { TOCItem } from '@/types'

export function useTOC(contentId: string = 'article-content') {
  const [items, setItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const content = document.getElementById(contentId)
    if (!content) return

    const headings = Array.from(content.querySelectorAll('h2, h3'))
    const tocItems: TOCItem[] = headings.map(h => ({
      id: h.id || '',
      text: h.textContent || '',
      level: parseInt(h.tagName.charAt(1), 10),
    })).filter(item => item.id)

    const timeout = window.setTimeout(() => setItems(tocItems), 0)
    return () => window.clearTimeout(timeout)
  }, [contentId])

  useEffect(() => {
    const headingIds = items.map(item => item.id)
    if (headingIds.length === 0) return

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .map(e => e.target.id)
        if (visible.length > 0) setActiveId(visible[0])
      },
      { rootMargin: '-60px 0% -70% 0%', threshold: 0 }
    )

    headingIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return { items, activeId }
}
