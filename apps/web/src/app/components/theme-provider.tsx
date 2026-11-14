import { ThemeProvider as NextThemes, useTheme } from 'next-themes'
import { useEffect, type ReactNode } from 'react'
import { setThemeCookie, type Theme } from '@/lib/shared/theme'

/**
 * Light / dark / system via next-themes (the `dark` class on <html>, as crazy-ui expects). The choice is
 * also written to Quackback's `theme` cookie, so the server renders the next document in it.
 */
export function ThemeProvider({
  defaultTheme,
  children,
}: {
  defaultTheme: Theme
  children: ReactNode
}) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      <CookieSync />
      {children}
    </NextThemes>
  )
}

function CookieSync() {
  const { theme } = useTheme()
  useEffect(() => {
    if (theme === 'light' || theme === 'dark' || theme === 'system') setThemeCookie(theme)
  }, [theme])
  return null
}
