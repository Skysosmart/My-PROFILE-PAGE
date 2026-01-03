import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import CertificateMenu from '@/components/sections/CertificateMenu'
import Inspiration from '@/components/sections/Inspiration'
import Contact from '@/components/sections/Contact'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen relative bg-black">
      <Navigation />
      <Hero />
      <About />
      <CertificateMenu />
      <Inspiration />
      <Contact />
    </main>
  )
}

