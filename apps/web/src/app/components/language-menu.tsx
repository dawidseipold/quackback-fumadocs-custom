import { Button, DropdownMenu } from '@crazy-staff/ui'
import { Languages } from 'lucide-react'
import { getLocale, locales, setLocale, type Locale } from '../paraglide/runtime.js'
import { m } from '../paraglide/messages.js'

/** Each language in its own name, so anyone can find theirs. */
const names: Record<Locale, string> = { en: 'English', pl: 'Polski', de: 'Deutsch', ru: 'Русский' }

/** Picks the UI language (Paraglide: cookie, then the browser's languages, then English). */
export function LanguageMenu() {
  const current = getLocale()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={m.language()}
            title={m.language()}
            className="text-muted hover:text-foreground"
          />
        }
      >
        <Languages />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-40">
        <DropdownMenu.Group>
          <DropdownMenu.GroupLabel>{m.language()}</DropdownMenu.GroupLabel>
          <DropdownMenu.RadioGroup
            value={current}
            onValueChange={(value) => setLocale(value as Locale)}
          >
            {locales.map((locale) => (
              <DropdownMenu.RadioItem key={locale} value={locale} lang={locale}>
                {names[locale]}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
