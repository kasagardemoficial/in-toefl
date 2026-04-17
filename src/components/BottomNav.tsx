'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', icon: '/mascot/main.png', label: 'Home' },
  { href: '/simulado', icon: '/mascot/card_simulados.png', label: 'Simulados' },
  { href: '/badges', icon: '/mascot/card_conquistas.png', label: 'Conquistas' },
  { href: '/progress', icon: '/mascot/card_progresso.png', label: 'Perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="jolingo-nav">
      <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: '400px', margin: '0 auto', padding: '4px 0' }}>
        {navItems.map((nav) => {
          const active = pathname === nav.href
          return (
            <Link key={nav.href} href={nav.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', textDecoration: 'none', color: active ? '#8CB369' : '#999', fontSize: '0.6rem', fontWeight: 600 }}>
              <img src={nav.icon} alt={nav.label} style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px', opacity: active ? 1 : 0.5 }} />
              <span>{nav.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
