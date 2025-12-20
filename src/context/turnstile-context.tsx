import { createContext, useContext, useState, type ReactNode } from 'react'

interface TurnstileContextType {
  token: string | null
  setToken: (token: string | null) => void
}

const TurnstileContext = createContext<TurnstileContextType | null>(null)

export function TurnstileProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  return (
    <TurnstileContext.Provider value={{ token, setToken }}>
      {children}
    </TurnstileContext.Provider>
  )
}

export function useTurnstile() {
  const context = useContext(TurnstileContext)
  if (!context) {
    throw new Error('useTurnstile must be used within a TurnstileProvider')
  }
  return context
}
