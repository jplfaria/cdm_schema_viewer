import { FiSun, FiMoon, FiSettings, FiInfo, FiGithub } from 'react-icons/fi'
import { useViewStore } from '@/store/viewStore'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export default function Header() {
  const { theme, setTheme, colorScheme, setColorScheme, fontSize, setFontSize } = useViewStore()

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-3">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">CDM Schema Viewer</h1>
        <span className="text-sm text-muted-foreground">KBase Common Data Model</span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="rounded p-2 hover:bg-muted"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        {/* Settings Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="rounded p-2 hover:bg-muted" aria-label="Settings">
              <FiSettings size={18} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[220px] rounded-md border bg-background p-1 shadow-lg"
              sideOffset={5}
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
                Display Settings
              </DropdownMenu.Label>

              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              {/* Color Scheme */}
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted">
                  Color Scheme
                  <div className="ml-auto text-xs text-muted-foreground">
                    {colorScheme}
                  </div>
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="z-50 min-w-[160px] rounded-md border bg-background p-1 shadow-lg"
                    sideOffset={2}
                    alignOffset={-5}
                  >
                    {(['default', 'colorblind', 'highContrast'] as const).map((scheme) => (
                      <DropdownMenu.Item
                        key={scheme}
                        className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
                        onClick={() => setColorScheme(scheme)}
                      >
                        {scheme}
                        {colorScheme === scheme && <span className="ml-auto">✓</span>}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              {/* Font Size */}
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted">
                  Font Size
                  <div className="ml-auto text-xs text-muted-foreground">
                    {fontSize}
                  </div>
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    className="z-50 min-w-[160px] rounded-md border bg-background p-1 shadow-lg"
                    sideOffset={2}
                    alignOffset={-5}
                  >
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <DropdownMenu.Item
                        key={size}
                        className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
                        onClick={() => setFontSize(size)}
                      >
                        {size}
                        {fontSize === size && <span className="ml-auto">✓</span>}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Info */}
        <button className="rounded p-2 hover:bg-muted" aria-label="About">
          <FiInfo size={18} />
        </button>

        {/* GitHub */}
        <a
          href="https://github.com/jplfaria/cdm_schema_viewer"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded p-2 hover:bg-muted"
          aria-label="View on GitHub"
        >
          <FiGithub size={18} />
        </a>
      </div>
    </header>
  )
}