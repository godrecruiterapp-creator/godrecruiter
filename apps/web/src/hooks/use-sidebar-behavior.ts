'use client'

import { useState, useEffect } from 'react'

export type SidebarBehavior = 'expanded' | 'collapsed' | 'hover'

const KEY = 'sidebar-behavior'
const EVENT = 'sidebar-behavior-change'

export function useSidebarBehavior() {
  const [behavior, setBehaviorState] = useState<SidebarBehavior>('expanded')

  useEffect(() => {
    setBehaviorState((localStorage.getItem(KEY) as SidebarBehavior) ?? 'expanded')
    function handler() {
      setBehaviorState((localStorage.getItem(KEY) as SidebarBehavior) ?? 'expanded')
    }
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  function setBehavior(b: SidebarBehavior) {
    localStorage.setItem(KEY, b)
    window.dispatchEvent(new Event(EVENT))
    setBehaviorState(b)
  }

  return { behavior, setBehavior }
}
