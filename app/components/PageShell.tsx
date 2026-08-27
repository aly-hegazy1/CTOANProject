'use client'

import { usePathname } from 'next/navigation'
import Chatbot from './Chatbot'

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isSpecialist = pathname?.startsWith('/specialist-dashboard')

  return (
    <>
      {/* Home button — fixed top-left on every page */}
      <a
        href="/"
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/90 px-4 py-2 text-xs font-medium text-[var(--foreground)] shadow-sm backdrop-blur transition hover:bg-white hover:shadow-md"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </a>

      {children}

      {/* Chatbot — hidden on specialist dashboard */}
      {!isSpecialist && <Chatbot />}
    </>
  )
}
