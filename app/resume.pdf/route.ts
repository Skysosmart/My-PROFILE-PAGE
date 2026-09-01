import { createElement, type ReactElement } from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { ResumeDoc } from './ResumeDoc'

/**
 * /resume.pdf - the one-page CV, rendered from data/portfolio.ts.
 *
 * Static: it is built once at deploy time and served as a file, so a
 * visitor never waits on a PDF renderer, and it can never drift from the
 * site because both are rendered from the same data in the same build.
 */
export const dynamic = 'force-static'

export async function GET() {
  const built = new Date().toISOString().slice(0, 10)
  // renderToBuffer wants the <Document> element's props; ours takes `built`
  // and renders one, which the types cannot see through
  const doc = createElement(ResumeDoc, { built }) as unknown as ReactElement<DocumentProps>
  const pdf = await renderToBuffer(doc)
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="nonthanaphong-saechua-cv.pdf"',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
