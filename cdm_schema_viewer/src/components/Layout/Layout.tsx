import { Outlet } from 'react-router-dom'
import Header from './Header'
import { useViewStore } from '@/store/viewStore'
import clsx from 'clsx'

export default function Layout() {
  const theme = useViewStore((state) => state.theme)

  return (
    <div
      className={clsx(
        'flex h-screen flex-col overflow-hidden',
        theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'dark'
          : ''
      )}
    >
      <Header />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}