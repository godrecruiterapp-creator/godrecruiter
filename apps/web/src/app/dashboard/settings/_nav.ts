export type NavItem = { label: string; href: string }
export type NavGroup = { group: string; items: NavItem[] }

export const SETTINGS_NAV: NavGroup[] = [
  {
    group: 'Account',
    items: [
      { label: 'Organization',       href: '/dashboard/settings/organization' },
      { label: 'Users & Teams',      href: '/dashboard/settings/users' },
      { label: 'Roles & Permissions',href: '/dashboard/settings/roles' },
    ],
  },
  {
    group: 'Recruitment',
    items: [
      { label: 'Recruitment',   href: '/dashboard/settings/recruitment' },
      { label: 'Communication', href: '/dashboard/settings/communication' },
      { label: 'AI Settings',   href: '/dashboard/settings/ai' },
      { label: 'Automation',    href: '/dashboard/settings/automation' },
    ],
  },
  {
    group: 'Platform',
    items: [
      { label: 'Integrations',   href: '/dashboard/settings/integrations' },
      { label: 'Branding',       href: '/dashboard/settings/branding' },
      { label: 'Career Portal',  href: '/dashboard/settings/career-portal' },
    ],
  },
  {
    group: 'Security & Compliance',
    items: [
      { label: 'Security',    href: '/dashboard/settings/security' },
      { label: 'Compliance',  href: '/dashboard/settings/compliance' },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Billing',          href: '/dashboard/settings/billing' },
      { label: 'Reports',          href: '/dashboard/settings/reports' },
      { label: 'Notifications',    href: '/dashboard/settings/notifications' },
      { label: 'Files & Storage',  href: '/dashboard/settings/files' },
      { label: 'System',           href: '/dashboard/settings/system' },
    ],
  },
]

// flat list for search
export const ALL_ITEMS: NavItem[] = SETTINGS_NAV.flatMap(g => g.items)
