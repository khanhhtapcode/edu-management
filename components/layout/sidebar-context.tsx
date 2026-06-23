"use client"

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react"

type SidebarContextType = {
  collapsed: boolean
  toggle: () => void
}

const STORAGE_KEY = "edu-sidebar-collapsed"
const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

function getCollapsedSnapshot() {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEY) === "true"
}

function getCollapsedServerSnapshot() {
  return false
}

function setCollapsedStore(value: boolean) {
  localStorage.setItem(STORAGE_KEY, String(value))
  listeners.forEach((listener) => listener())
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribe,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot
  )

  const toggle = useCallback(() => {
    setCollapsedStore(!getCollapsedSnapshot())
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
