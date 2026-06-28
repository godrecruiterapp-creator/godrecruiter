'use client'

import { useState } from 'react'
import { Plus, Trash2, MapPin, Users, Clock } from 'lucide-react'
import { SettingsHeader, SettingsSection, SettingRow, TabNav, Toggle, SaveBar, FieldInput, FieldSelect } from '../_components'

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
]

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
]

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
]

const TABS = ['Company Info', 'Locations', 'Departments', 'Business Hours', 'Calendar']

export default function OrganizationPage() {
  const [tab, setTab] = useState('Company Info')
  const [dirty, setDirty] = useState(false)
  const mark = () => setDirty(true)

  // Company Info state
  const [company, setCompany] = useState({
    name: 'God Recruiter Inc.',
    legalName: 'God Recruiter Inc.',
    website: 'https://godrecruiter.com',
    phone: '+1 (713) 555-0100',
    email: 'godrecruiterapp@gmail.com',
    address: '1234 Main St, Suite 100',
    city: 'Houston',
    state: 'TX',
    zip: '77001',
    country: 'United States',
    industry: 'Staffing & Recruiting',
    employees: '11–50',
    timezone: 'America/Chicago',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    fiscalYear: 'January',
    language: 'English',
  })

  function setField(k: keyof typeof company, v: string) {
    setCompany(p => ({ ...p, [k]: v }))
    mark()
  }

  // Locations
  const [locations, setLocations] = useState([
    { id: '1', name: 'Houston HQ', address: '1234 Main St, Houston TX 77001', type: 'Headquarters', phone: '+1 713 555 0100' },
    { id: '2', name: 'Dallas Office', address: '456 Commerce St, Dallas TX 75201', type: 'Branch', phone: '+1 214 555 0200' },
  ])

  // Departments
  const [departments, setDepartments] = useState(['Healthcare Recruitment', 'IT Staffing', 'Finance & Accounting', 'Executive Search', 'Operations'])
  const [newDept, setNewDept] = useState('')

  // Business hours
  const [hours, setHours] = useState({
    Mon: { open: true, start: '08:00', end: '18:00' },
    Tue: { open: true, start: '08:00', end: '18:00' },
    Wed: { open: true, start: '08:00', end: '18:00' },
    Thu: { open: true, start: '08:00', end: '18:00' },
    Fri: { open: true, start: '08:00', end: '17:00' },
    Sat: { open: false, start: '09:00', end: '13:00' },
    Sun: { open: false, start: '09:00', end: '13:00' },
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 max-w-3xl">
        <SettingsHeader title="Organization" description="Manage your company profile, locations, departments, and business hours." />
        <TabNav tabs={TABS} active={tab} onChange={setTab} />

        {tab === 'Company Info' && (
          <div className="space-y-5">
            <SettingsSection title="Company Profile">
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldInput label="Company Name" value={company.name} onChange={v => setField('name', v)} />
                <FieldInput label="Legal Name" value={company.legalName} onChange={v => setField('legalName', v)} />
                <FieldInput label="Website" value={company.website} onChange={v => setField('website', v)} />
                <FieldInput label="Company Phone" value={company.phone} onChange={v => setField('phone', v)} />
                <FieldInput label="Company Email" value={company.email} onChange={v => setField('email', v)} type="email" />
                <FieldSelect label="Industry" value={company.industry} onChange={v => setField('industry', v)} options={[
                  { value: 'Staffing & Recruiting', label: 'Staffing & Recruiting' },
                  { value: 'Healthcare Staffing', label: 'Healthcare Staffing' },
                  { value: 'IT Staffing', label: 'IT Staffing' },
                  { value: 'Executive Search', label: 'Executive Search' },
                ]} />
                <FieldSelect label="Company Size" value={company.employees} onChange={v => setField('employees', v)} options={[
                  { value: '1–10', label: '1–10 employees' },
                  { value: '11–50', label: '11–50 employees' },
                  { value: '51–200', label: '51–200 employees' },
                  { value: '201–500', label: '201–500 employees' },
                  { value: '500+', label: '500+ employees' },
                ]} />
              </div>
            </SettingsSection>

            <SettingsSection title="Primary Address">
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FieldInput label="Street Address" value={company.address} onChange={v => setField('address', v)} />
                </div>
                <FieldInput label="City" value={company.city} onChange={v => setField('city', v)} />
                <FieldInput label="State" value={company.state} onChange={v => setField('state', v)} />
                <FieldInput label="ZIP / Postal Code" value={company.zip} onChange={v => setField('zip', v)} />
                <FieldInput label="Country" value={company.country} onChange={v => setField('country', v)} />
              </div>
            </SettingsSection>

            <SettingsSection title="Locale & Format">
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldSelect label="Time Zone" value={company.timezone} onChange={v => setField('timezone', v)} options={TIMEZONES} />
                <FieldSelect label="Currency" value={company.currency} onChange={v => setField('currency', v)} options={CURRENCIES} />
                <FieldSelect label="Date Format" value={company.dateFormat} onChange={v => setField('dateFormat', v)} options={DATE_FORMATS} />
                <FieldSelect label="Language" value={company.language} onChange={v => setField('language', v)} options={[
                  { value: 'English', label: 'English' },
                  { value: 'Spanish', label: 'Spanish' },
                ]} />
                <FieldSelect label="Fiscal Year Start" value={company.fiscalYear} onChange={v => setField('fiscalYear', v)} options={['January','April','July','October'].map(m => ({ value: m, label: m }))} />
              </div>
            </SettingsSection>
          </div>
        )}

        {tab === 'Locations' && (
          <div className="space-y-4">
            <SettingsSection title="Office Locations" action={
              <button onClick={() => mark()} className="h-7 px-2.5 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                <Plus className="size-3.5" />Add Location
              </button>
            }>
              {locations.map(loc => (
                <div key={loc.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="size-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{loc.name}</p>
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{loc.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{loc.address}</p>
                    <p className="text-xs text-muted-foreground">{loc.phone}</p>
                  </div>
                  <button onClick={() => { setLocations(l => l.filter(x => x.id !== loc.id)); mark() }} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </SettingsSection>
          </div>
        )}

        {tab === 'Departments' && (
          <SettingsSection title="Departments" description="Organize your recruiters into departments for reporting and permissions.">
            <div className="px-5 py-4 flex gap-2">
              <input
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                placeholder="New department name…"
                className="flex-1 h-8 px-3 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={e => {
                  if (e.key === 'Enter' && newDept.trim()) {
                    setDepartments(d => [...d, newDept.trim()])
                    setNewDept('')
                    mark()
                  }
                }}
              />
              <button onClick={() => { if (newDept.trim()) { setDepartments(d => [...d, newDept.trim()]); setNewDept(''); mark() } }}
                className="h-8 px-3 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-1">
                <Plus className="size-3.5" />Add
              </button>
            </div>
            {departments.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  <span className="text-sm">{d}</span>
                </div>
                <button onClick={() => { setDepartments(deps => deps.filter((_, j) => j !== i)); mark() }} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </SettingsSection>
        )}

        {tab === 'Business Hours' && (
          <SettingsSection title="Business Hours" description="Set default working hours for SLA calculations and availability.">
            {(Object.keys(hours) as (keyof typeof hours)[]).map(day => {
              const h = hours[day]
              return (
                <div key={day} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-10 text-xs font-medium">{day}</div>
                  <Toggle checked={h.open} onChange={v => { setHours(p => ({ ...p, [day]: { ...p[day], open: v } })); mark() }} />
                  {h.open ? (
                    <div className="flex items-center gap-2 text-xs">
                      <input type="time" value={h.start} onChange={e => { setHours(p => ({ ...p, [day]: { ...p[day], start: e.target.value } })); mark() }}
                        className="h-7 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                      <span className="text-muted-foreground">to</span>
                      <input type="time" value={h.end} onChange={e => { setHours(p => ({ ...p, [day]: { ...p[day], end: e.target.value } })); mark() }}
                        className="h-7 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Closed</span>
                  )}
                </div>
              )
            })}
          </SettingsSection>
        )}

        {tab === 'Calendar' && (
          <SettingsSection title="Holiday Calendar" description="Add company holidays to exclude from SLA and business day calculations.">
            <div className="px-5 py-4 space-y-2 text-xs text-muted-foreground">
              {[
                'Jan 1 — New Year\'s Day',
                'May 26 — Memorial Day',
                'Jul 4 — Independence Day',
                'Sep 1 — Labor Day',
                'Nov 27 — Thanksgiving',
                'Dec 25 — Christmas Day',
              ].map(h => (
                <div key={h} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-sm">{h}</span>
                  </div>
                  <button className="hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
              <button onClick={mark} className="mt-2 h-7 px-3 text-xs rounded-md border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
                <Plus className="size-3.5" />Add Holiday
              </button>
            </div>
          </SettingsSection>
        )}
      </div>
      <SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />
    </div>
  )
}
