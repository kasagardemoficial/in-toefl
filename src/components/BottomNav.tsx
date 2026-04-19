'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconTarget, IconTrophy, IconUser } from './Icons'

const navItems = [
  { href: '/', icon: IconHome, label: 'Home' },
  { href: '/simulado', icon: IconTarget, label: 'Simulados' },
  { href: '/badges', icon: IconTrophy, label: 'Conquistas' },
  { href: '/progress', icon: IconUser, label: 'Perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="jolingo-nav">
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: '500px', width: '100%', height: '100%', margin: '0 auto' }}>
        {navItems.map((nav) => {
          const active = pathname === nav.href
          const Icon = nav.icon
          return (
            <Link key={nav.href} href={nav.href} className={active ? 'active' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textDecoration: 'none', color: active ? '#8CB369' : '#AFAFAF', fontSize: '10px', fontWeight: 600, minWidth: '64px', height: '100%' }}>
              <div style={active ? { background: '#F0F7EA', borderRadius: '16px', padding: '4px 20px', transition: 'all 0.3s' } : { padding: '4px 8px' }}>
                <Icon size={22} color={active ? '#8CB369' : '#AFAFAF'} />
              </div>
              <span>{nav.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
