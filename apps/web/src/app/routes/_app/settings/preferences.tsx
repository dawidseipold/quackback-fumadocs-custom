import { Card, ToggleGroup } from '@crazy-staff/ui'
import { createFileRoute } from '@tanstack/react-router'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { m } from '../../../paraglide/messages.js'
import { getLocale, locales, setLocale, type Locale } from '../../../paraglide/runtime.js'
import { LOCALE_NAMES } from '../../../components/language-menu'

/** Language and theme. In-app notification preferences come with #11. */
export const Route = createFileRoute('/_app/settings/preferences')({
  component: Preferences,
})

function Preferences() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <div className="flex flex-col gap-6">
      <Card title={m.language()} description={m.settings_language_description()}>
        <ToggleGroup
          value={[getLocale()]}
          onValueChange={(value) => value[0] && setLocale(value[0] as Locale)}
          items={locales.map((l) => ({ value: l, label: LOCALE_NAMES[l] }))}
        />
      </Card>
      <Card title={m.settings_theme()} description={m.settings_theme_description()}>
        <ToggleGroup
          value={mounted && theme ? [theme] : []}
          onValueChange={(value) => value[0] && setTheme(value[0])}
          items={[
            { value: 'light', label: m.settings_theme_light() },
            { value: 'dark', label: m.settings_theme_dark() },
            { value: 'system', label: m.settings_theme_system() },
          ]}
        />
      </Card>
    </div>
  )
}
