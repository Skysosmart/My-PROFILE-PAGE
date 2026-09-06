import Portfolio from '@/components/Portfolio'
import { getWriteups } from '@/lib/writeups'

/**
 * NONTHANAPHONG.EXE - Academic Quest Portfolio
 * All content lives in data/portfolio.ts. All UI is composed inside Portfolio.
 *
 * The two things only the server knows are handed down as props: the
 * writeup index (read from disk) and whether the mail key exists (so the
 * footer knows to show the form rather than the mailto link).
 */
export default async function Home() {
  const writeups = (await getWriteups()).slice(0, 3)
  return <Portfolio writeups={writeups} formEnabled={Boolean(process.env.RESEND_API_KEY)} />
}
