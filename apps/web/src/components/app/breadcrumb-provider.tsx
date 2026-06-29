'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface BreadcrumbCtx { title: string; setTitle: (t: string) => void }
const Ctx = createContext<BreadcrumbCtx>({ title: '', setTitle: () => {} })

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState('')
  return <Ctx.Provider value={{ title, setTitle }}>{children}</Ctx.Provider>
}

export function useBreadcrumbTitle() {
  return useContext(Ctx)
}

// Drop this anywhere in a page (server or client) to set the dynamic breadcrumb label
export function BreadcrumbTitle({ title }: { title: string }) {
  const { setTitle } = useContext(Ctx)
  useEffect(() => {
    setTitle(title)
    return () => setTitle('')
  }, [title, setTitle])
  return null
}
