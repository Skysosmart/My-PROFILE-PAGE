import type { Metadata } from 'next'
import { player } from '@/data/portfolio'
import CertArchive from './CertArchive'

export const metadata: Metadata = {
  title: `Certificates - ${player.name}`,
  description: `All certificates, awards and training records earned by ${player.name}.`,
  alternates: { canonical: '/certificates' },
}

export default function CertificatesPage() {
  return <CertArchive />
}
