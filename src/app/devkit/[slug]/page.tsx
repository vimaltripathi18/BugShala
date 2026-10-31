import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import DevToolShell from '@/components/devkit/DevToolShell'
import DevKitTool from '@/components/devkit/DevKitTool'
import { devTools } from '@/lib/devkit'

export function generateStaticParams() {
  return devTools.map(tool => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tool = devTools.find(item => item.slug === slug)
  return tool ? { title: tool.name, description: tool.description, alternates: { canonical: `/devkit/${slug}` } } : {}
}

export const instant = false

export default async function DevKitToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!devTools.some(tool => tool.slug === slug)) notFound()

  return (
    <PageLayout>
      <DevToolShell slug={slug}>
        <DevKitTool slug={slug} />
      </DevToolShell>
    </PageLayout>
  )
}
