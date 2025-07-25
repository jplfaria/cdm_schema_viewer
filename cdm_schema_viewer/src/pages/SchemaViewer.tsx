import { useEffect } from 'react'
import SchemaCanvas from '@/components/Canvas/SchemaCanvas'
import Sidebar from '@/components/Layout/Sidebar'
import { useSchemaStore } from '@/store/schemaStore'
import { useSchemaLoader } from '@/hooks/useSchemaLoader'

export default function SchemaViewer() {
  const { loading, error } = useSchemaStore()
  const { loadCDMSchema } = useSchemaLoader()

  useEffect(() => {
    // Load schema on mount
    loadCDMSchema()
  }, [loadCDMSchema])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-muted-foreground">Loading CDM Schema...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-red-500">Error loading schema</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1">
        <SchemaCanvas />
      </div>
    </div>
  )
}