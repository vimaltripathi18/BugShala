import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CodeBlock from '@/components/code/CodeBlock'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import VerificationBadge from '@/components/ui/VerificationBadge'
import PageLayout from '@/components/layout/PageLayout'
import { getBugBySlug, getBugs, getRelatedBugs } from '@/lib/database/bugs'
import { getBugMetadata } from '@/lib/seo'
import { formatDate } from '@/lib/utils'

export const instant = false

interface Props {
  params: Promise<{ technology: string; slug: string }>
}

export async function generateStaticParams() {
  const { bugs } = await getBugs({})
  return bugs.map((bug) => ({ technology: bug.technology.slug, slug: bug.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { technology, slug } = await params
  const bug = await getBugBySlug(technology, slug)
  return bug ? getBugMetadata(bug) : {}
}

export default async function BugDetail({ params }: Props) {
  const { technology, slug } = await params
  const bug = await getBugBySlug(technology, slug)
  if (!bug?.technology) notFound()

  const related = await getRelatedBugs(bug.id, bug.technology_id, 3)

  return (
    <PageLayout>
      <article className="mx-auto max-w-5xl px-6 py-12">
        <Breadcrumb items={[
          { label: 'Bug Library', href: '/bugs' },
          { label: bug.technology.name, href: `/technology/${bug.technology.slug}` },
          { label: bug.title },
        ]} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_240px]">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <DifficultyBadge difficulty={bug.difficulty} />
              <VerificationBadge status={bug.verification_status} />
            </div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{bug.title}</h1>
            <p className="mt-4 text-lg text-text-secondary">{bug.short_description}</p>

            {bug.exact_error && (
              <div className="mt-8 rounded-card border border-border bg-bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Exact error</p>
                <code className="mt-2 block whitespace-pre-wrap text-sm text-red-300">{bug.exact_error}</code>
              </div>
            )}

            <section className="mt-8 rounded-card border border-lime/20 bg-lime/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-lime">Quick solution</p>
              <p className="mt-2 text-sm text-text-primary">{bug.quick_answer}</p>
            </section>

            <div className="prose mt-10">
              <div dangerouslySetInnerHTML={{
                __html: bug.content.split('\n').map((line) =>
                  line.startsWith('## ') ? `<h2>${line.slice(3)}</h2>` : line ? `<p>${line}</p>` : ''
                ).join(''),
              }} />
            </div>

            {bug.reproduction_steps && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">How to reproduce it</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">{bug.reproduction_steps}</p>
              </section>
            )}
            {bug.common_causes && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Root causes</h2>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{bug.common_causes}</p>
              </section>
            )}
            {bug.incorrect_code && (
              <section className="mt-8">
                <h2 className="mb-3 text-xl font-semibold">Incorrect example</h2>
                <CodeBlock code={bug.incorrect_code} language={bug.code_language} variant="incorrect" />
              </section>
            )}
            {bug.corrected_code && (
              <section className="mt-8">
                <h2 className="mb-3 text-xl font-semibold">Corrected example</h2>
                <CodeBlock code={bug.corrected_code} language={bug.code_language} variant="correct" />
              </section>
            )}
            {bug.alternatives && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Alternative solutions</h2>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{bug.alternatives}</p>
              </section>
            )}
            {bug.common_mistakes && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Common mistakes</h2>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{bug.common_mistakes}</p>
              </section>
            )}
            {bug.prevention_tips && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Prevention</h2>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{bug.prevention_tips}</p>
              </section>
            )}
            {bug.version_compatibility && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Version compatibility</h2>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{bug.version_compatibility}</p>
              </section>
            )}
            {(bug.faq?.length ?? 0) > 0 && (
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Frequently asked questions</h2>
                <div className="mt-4 space-y-4">
                  {bug.faq?.map((item) => (
                    <div key={item.question} className="rounded-card border border-border p-4">
                      <h3 className="font-medium">{item.question}</h3>
                      <p className="mt-2 text-sm text-text-secondary">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-card border border-border bg-bg-surface p-4 text-sm">
              <p className="text-xs uppercase tracking-wider text-text-muted">Guide details</p>
              <dl className="mt-4 space-y-3">
                <div><dt className="text-xs text-text-muted">Reading time</dt><dd>{bug.estimated_reading_time} minutes</dd></div>
                <div><dt className="text-xs text-text-muted">Updated</dt><dd>{formatDate(bug.updated_at)}</dd></div>
                <div><dt className="text-xs text-text-muted">Technology</dt><dd>{bug.technology.name}</dd></div>
              </dl>
            </div>
          </aside>
        </div>

        {(bug.references?.length ?? 0) > 0 && (
          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-xl font-semibold">Reliable references</h2>
            <ul className="mt-4 space-y-2">
              {bug.references?.map((reference) => (
                <li key={reference.id}>
                  <a href={reference.url} target="_blank" rel="noreferrer" className="text-sm text-lime hover:underline">
                    {reference.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="text-2xl font-semibold">Related guides</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {related.map((item) => (
                <a key={item.id} href={`/bugs/${item.technology.slug}/${item.slug}`} className="rounded-card border border-border bg-bg-surface p-4 text-sm hover:border-lime">
                  <span className="text-xs text-text-muted">{item.technology.name}</span>
                  <p className="mt-2 font-medium">{item.title}</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </PageLayout>
  )
}
