import { useCallback } from 'react'
import yaml from 'js-yaml'
import { useSchemaStore } from '@/store/schemaStore'
import { CDMSchema } from '@/types/schema'
import { parseSchemaToGraph } from '@/services/schemaParser'

export function useSchemaLoader() {
  const { loadSchema, setGraph, setLoading, setError } = useSchemaStore()

  const loadCDMSchema = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all required schema files
      const schemaFiles = [
        '/cdm-schema/src/linkml/cdm_schema.yaml',
        '/cdm-schema/src/linkml/cdm_components.yaml',
        '/cdm-schema/src/linkml/cdm_base.yaml',
        '/cdm-schema/src/linkml/cdm_enums.yaml',
      ]

      const responses = await Promise.all(
        schemaFiles.map((file) => 
          fetch(file).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch ${file}`)
            return res.text()
          })
        )
      )

      // Parse YAML files
      const schemas = responses.map((text) => yaml.load(text) as any)
      
      // Merge schemas
      const mergedSchema = mergeSchemas(schemas)
      
      // Load schema into store
      loadSchema(mergedSchema)
      
      // Convert to graph representation
      const graph = parseSchemaToGraph(mergedSchema)
      setGraph(graph)
      
    } catch (error) {
      console.error('Error loading schema:', error)
      setError(error instanceof Error ? error.message : 'Failed to load schema')
    } finally {
      setLoading(false)
    }
  }, [loadSchema, setGraph, setLoading, setError])

  return { loadCDMSchema }
}

// Helper function to merge multiple schema files
function mergeSchemas(schemas: any[]): CDMSchema {
  const merged: CDMSchema = {
    id: schemas[0].id || 'cdm-schema',
    name: schemas[0].name || 'CDM Schema',
    description: schemas[0].description || 'KBase Common Data Model',
    version: schemas[0].version || '0.0.1',
    classes: {},
    slots: {},
    enums: {},
  }

  // Merge classes, slots, and enums from all schemas
  for (const schema of schemas) {
    if (schema.classes) {
      Object.assign(merged.classes, schema.classes)
    }
    if (schema.slots) {
      Object.assign(merged.slots, schema.slots)
    }
    if (schema.enums) {
      Object.assign(merged.enums || {}, schema.enums)
    }
  }

  return merged
}