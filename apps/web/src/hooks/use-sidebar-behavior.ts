'use client'

import { useState, useEffect } from 'react'
import { updateSidebarBehaviorAction } from '@/app/dashboard/profile/actions'

export type SidebarBehavior = 'expanded' | 'collapsed' | 'hover'

const KEY = 'sidebar-behavior'
const EVENT = 'sidebar-behavior-change'

export function useSidebarBehavior(serverValue?: SidebarBehavior) {
  const [behavior, setBehaviorState] = useState<SidebarBehavior>(serverValue ?? 'expanded')

  useEffect(() => {
    // Seed from server value, fallback to localStorage
    const stored = localStorage.getItem(KEY) as SidebarBehavior | null
    const resolved = serverValue ?? stored ?? 'expanded'
    setBehaviorState(resolved)
    localStorage.setItem(KEY, resolved)

    function handler() {
      setBehaviorState((localStorage.getItem(KEY) as SidebarBehavior) ?? 'expanded')
    }
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [serverValue])

  function setBehavior(b: SidebarBehavior) {
    localStorage.setItem(KEY, b)
    window.dispatchEvent(new Event(EVENT))
    setBehaviorState(b)
    updateSidebarBehaviorAction(b) // fire-and-forget, localStorage gives instant feedback
  }

  return { behavior, setBehavior }
}
