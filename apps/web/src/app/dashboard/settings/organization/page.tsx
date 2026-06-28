'use client'

import { useState } from 'react'
import { Plus, Trash2, MapPin } from 'lucide-react'
import { Breadcrumb, PageHeader, SettingCard, SummaryGrid, CardRow, Toggle } from '../_components'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function OrganizationPage() {
  const [name, setName]         = useState('God Recruiter Inc.')
  const [industry, setIndustry] = useState('Staffing & Recruiting')
  const [size, setSize]         = useState('11–50 employees')
  const [website, setWebsite]   = useState('https://godrecruiter.com')
  const [timezone, setTimezone] = useState('America/Chicago (CST)')
  const [language, setLanguage] = useState('English (US)')

  const [phone, setPhone]       = useState('+1 713 555 0100')
  const [email, setEmail]       = useState('info@godrecruiter.com')
  const [address, setAddress]   = useState('1234 Main Street')
  const [city, setCity]         = useState('Houston')
  const [state, setState]       = useState('TX')
  const [zip, setZip]           = useState('77002')

  const [locations, setLocations] = useState([
    { id: '1', name: 'Houston HQ',     address: '1234 Main St, Houston, TX' },
    { id: '2', name: 'Dallas Office',  address: '500 Commerce St, Dallas, TX' },
    { id: '3', name: 'Austin Office',  address: '301 Congress Ave, Austin, TX' },
  ])

  const [hours, setHours] = useState(
    DAYS.map((d, i) => ({ day: d, open: i < 5, start: '08:00', end: '18:00' }))
  )

  return (
    <div className="px-8 py-10">
      <Breadcrumb />
      <PageHeader title="Organization" description="Manage company information, locations, and operating preferences." />

      <div className="space-y-4">
        {/* Company Profile */}
        <SettingCard
          title="Company Profile"
          description="Basic information about your organization"
          summary={
            <SummaryGrid items={[
              { label: 'Company name',  value: name },
              { label: 'Industry',      value: industry },
              { label: 'Size',          value: size },
              { label: 'Website',       value: website },
              { label: 'Timezone',      value: timezone },
              { label: 'Language',      value: language },
            ]} />
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Staffing & Recruiting</option>
                <option>Healthcare Staffing</option>
                <option>IT Staffing</option>
                <option>Executive Search</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company size</label>
              <select value={size} onChange={e => setSize(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>1–10 employees</option>
                <option>11–50 employees</option>
                <option>51–200 employees</option>
                <option>201–500 employees</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>America/Chicago (CST)</option>
                <option>America/New_York (EST)</option>
                <option>America/Denver (MST)</option>
                <option>America/Los_Angeles (PST)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
        </SettingCard>

        {/* Contact Information */}
        <SettingCard
          title="Contact Information"
          description="Primary contact details for your organization"
          summary={
            <SummaryGrid items={[
              { label: 'Phone',    value: phone },
              { label: 'Email',    value: email },
              { label: 'Address',  value: `${address}, ${city}, ${state} ${zip}` },
            ]} />
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Street address</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">City</label>
              <input value={city} onChange={e => setCity(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">State</label>
                <input value={state} onChange={e => setState(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">ZIP</label>
                <input value={zip} onChange={e => setZip(e.target.value)}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Locations */}
        <SettingCard
          title="Office Locations"
          description={`${locations.length} offices`}
          summary={
            <div className="space-y-2.5">
              {locations.map(l => (
                <div key={l.id} className="flex items-center gap-2.5 text-sm">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{l.name}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground text-xs">{l.address}</span>
                </div>
              ))}
            </div>
          }
          action={
            <button
              onClick={() => setLocations(p => [...p, { id: Date.now().toString(), name: 'New Office', address: '' }])}
              className="h-8 px-3 text-xs rounded-lg border border-border hover:bg-muted/60 transition-colors flex items-center gap-1.5">
              <Plus className="size-3.5" />Add
            </button>
          }
        >
          <div className="space-y-3">
            {locations.map((l, i) => (
              <div key={l.id} className="flex items-center gap-2">
                <input value={l.name} onChange={e => setLocations(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                  placeholder="Office name"
                  className="w-36 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                <input value={l.address} onChange={e => setLocations(p => p.map((x, j) => j === i ? { ...x, address: e.target.value } : x))}
                  placeholder="Address"
                  className="flex-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={() => setLocations(p => p.filter((_, j) => j !== i))}
                  className="p-2 text-muted-foreground hover:text-red-600 transition-colors">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Business Hours */}
        <SettingCard
          title="Business Hours"
          description="When your team is available for work and scheduling"
          summary={
            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
              {hours.filter(h => h.open).map(h => (
                <div key={h.day} className="flex items-center gap-1.5 text-xs">
                  <span className="font-medium w-8">{h.day.slice(0, 3)}</span>
                  <span className="text-muted-foreground">{h.start} – {h.end}</span>
                </div>
              ))}
              {hours.filter(h => !h.open).length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Closed: {hours.filter(h => !h.open).map(h => h.day.slice(0, 3)).join(', ')}
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {hours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-4">
                <Toggle checked={h.open} onChange={v => setHours(p => p.map((x, j) => j === i ? { ...x, open: v } : x))} />
                <span className="text-sm w-24">{h.day}</span>
                {h.open ? (
                  <div className="flex items-center gap-2 text-sm">
                    <input type="time" value={h.start}
                      onChange={e => setHours(p => p.map((x, j) => j === i ? { ...x, start: e.target.value } : x))}
                      className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                    <span className="text-muted-foreground text-xs">to</span>
                    <input type="time" value={h.end}
                      onChange={e => setHours(p => p.map((x, j) => j === i ? { ...x, end: e.target.value } : x))}
                      className="h-8 px-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Closed</span>
                )}
              </div>
            ))}
          </div>
        </SettingCard>

        {/* Default Preferences */}
        <SettingCard
          title="Default Preferences"
          description="System-wide defaults applied across the platform"
          summary={
            <SummaryGrid items={[
              { label: 'Currency',      value: 'USD ($)' },
              { label: 'Date format',   value: 'MM/DD/YYYY' },
              { label: 'Fiscal year',   value: 'January' },
              { label: 'Work week',     value: 'Monday – Friday' },
            ]} />
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Currency</label>
              <select defaultValue="USD" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Date format</label>
              <select defaultValue="mdy" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="mdy">MM/DD/YYYY</option>
                <option value="dmy">DD/MM/YYYY</option>
                <option value="ymd">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Fiscal year starts</label>
              <select defaultValue="jan" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                  <option key={m} value={m.toLowerCase()}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Work week starts</label>
              <select defaultValue="mon" className="w-full h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="mon">Monday</option>
                <option value="sun">Sunday</option>
              </select>
            </div>
          </div>
          <div className="border-t border-border/40 pt-4 space-y-3">
            <CardRow label="Show public holidays" description="Highlight public holidays in calendars and scheduling">
              <Toggle checked={true} onChange={() => {}} />
            </CardRow>
            <CardRow label="24-hour time format" description="Use 24h clock instead of AM/PM">
              <Toggle checked={false} onChange={() => {}} />
            </CardRow>
          </div>
        </SettingCard>
      </div>
    </div>
  )
}
