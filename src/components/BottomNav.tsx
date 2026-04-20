'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconTarget, IconTrophy, IconUser } from '@/components/Icons'

const navItems = [
  { href: '/', icon: IconHome, label: 'Home' },
  { href: '/simulado', icon: IconTarget, label: 'Simulados' },
  { href: '/badges', icon: IconTrophy, label: 'Conquistas' },
  { href: '/progress', icon: IconUser, label: 'Perfil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="jolingo-nav" aria-label="Navegação principal">
      <div className="jolingo-nav-inner">
        {navItems.map((nav) => {
          const active = pathname === nav.href
          const Icon = nav.icon

          return (
            <Link key={nav.href} href={nav.href} className={active ? 'active tap-feedback' : 'tap-feedback'}>
              <span
                style={active
                  ? {
                      width: '42px',
                      height: '42px',
                      borderRadius: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(180deg, rgba(168,208,141,0.28) 0%, rgba(140,179,105,0.12) 100%)',
                      border: '1px solid rgba(140,179,105,0.18)',
                    }
                  : {
                      width: '42px',
                      height: '42px',
                      borderRadius: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
              >
                <Icon size={22} color={active ? '#8CB369' : 'currentColor'} />
              </span>
              <span>{nav.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
