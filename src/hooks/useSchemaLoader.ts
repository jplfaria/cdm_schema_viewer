import { useCallback } from 'react'
import yaml from 'js-yaml'
import { useSchemaStore } from '@/store/schemaStore'
import { CDMSchema } from '@/types/schema'
import { parseSchemaToGraph } from '@/services/schemaParser'

// GitHub repository configuration
const GITHUB_REPO = 'kbase/cdm-schema'
const GITHUB_BRANCH = 'main'
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}`
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`

// Schema files to load (based on GitHub API inspection)
const SCHEMA_FILES = [
  'cdm_schema.yaml',      // Main schema
  'cdm_base.yaml',        // Base classes
  'cdm_components.yaml',  // Components
  'cdm_enums.yaml',       // Enumerations
  'cdm_types.yaml',       // Type definitions
  'cdm_attr_value.yaml',  // Attribute values
  'cdm_links.yaml',       // Link definitions
  'cdm_ontology.yaml',    // Ontology mappings
]

interface SchemaMetadata {
  version: string
  lastUpdated: string
  commit: string
  source: 'remote' | 'fallback'
}

export function useSchemaLoader() {
  const { loadSchema, setGraph, setLoading, setError } = useSchemaStore()

  const fetchSchemaMetadata = useCallback(async (): Promise<SchemaMetadata> => {
    try {
      // Get latest commit info for the schema directory
      const response = await fetch(`${GITHUB_API_BASE}/commits?path=src/linkml&per_page=1`)
      if (!response.ok) throw new Error('Failed to fetch repository metadata')

      const commits = await response.json()
      const latestCommit = commits[0]

      return {
        version: 'latest',
        lastUpdated: latestCommit.commit.committer.date,
        commit: latestCommit.sha.substring(0, 7),
        source: 'remote'
      }
    } catch (error) {
      console.warn('Failed to fetch schema metadata, using fallback:', error)
      return {
        version: '0.0.1',
        lastUpdated: new Date().toISOString(),
        commit: 'unknown',
        source: 'fallback'
      }
    }
  }, [])

  const loadFromGitHub = useCallback(async (): Promise<{ schemas: any[], metadata: SchemaMetadata }> => {
    // Get metadata first
    const metadata = await fetchSchemaMetadata()

    // Construct URLs for schema files
    const schemaUrls = SCHEMA_FILES.map(filename =>
      `${GITHUB_RAW_BASE}/src/linkml/${filename}`
    )

    console.log('Loading schema from GitHub:', schemaUrls)

    // Fetch all schema files
    const responses = await Promise.all(
      schemaUrls.map(async (url) => {
        const response = await fetch(url)
        if (!response.ok) {
          console.warn(`Failed to fetch ${url}, skipping...`)
          return null
        }
        return response.text()
      })
    )

    // Parse YAML files (filter out failed fetches)
    const schemas = responses
      .filter(text => text !== null)
      .map((text) => yaml.load(text!) as any)
      .filter(schema => schema !== null)

    if (schemas.length === 0) {
      throw new Error('No schema files could be loaded from GitHub')
    }

    console.log(`Successfully loaded ${schemas.length}/${SCHEMA_FILES.length} schema files`)
    return { schemas, metadata }
  }, [fetchSchemaMetadata])

  const loadFromFallback = useCallback(async (): Promise<{ schemas: any[], metadata: SchemaMetadata }> => {
    console.log('Loading schema from local fallback files...')

    // Fallback to local files
    const baseUrl = import.meta.env.BASE_URL
    const fallbackFiles = [
      `${baseUrl}cdm-schema/src/linkml/cdm_schema.yaml`,
      `${baseUrl}cdm-schema/src/linkml/cdm_components.yaml`,
      `${baseUrl}cdm-schema/src/linkml/cdm_base.yaml`,
      `${baseUrl}cdm-schema/src/linkml/cdm_enums.yaml`,
    ]

    const responses = await Promise.all(
      fallbackFiles.map((file) =>
        fetch(file).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch ${file}`)
          return res.text()
        })
      )
    )

    const schemas = responses.map((text) => yaml.load(text) as any)

    return {
      schemas,
      metadata: {
        version: '0.0.1',
        lastUpdated: new Date().toISOString(),
        commit: 'local',
        source: 'fallback'
      }
    }
  }, [])

  const loadCDMSchema = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let schemaData: { schemas: any[], metadata: SchemaMetadata }

      try {
        // Try to load from GitHub first
        schemaData = await loadFromGitHub()
      } catch (githubError) {
        console.warn('GitHub loading failed, falling back to local files:', githubError)
        try {
          schemaData = await loadFromFallback()
        } catch (fallbackError) {
          throw new Error(`Both GitHub and fallback loading failed. GitHub: ${githubError}. Fallback: ${fallbackError}`)
        }
      }

      const { schemas, metadata } = schemaData

      // Merge schemas
      const mergedSchema = mergeSchemas(schemas, metadata)

      // Load schema into store
      loadSchema(mergedSchema)

      // Convert to graph representation
      const graph = parseSchemaToGraph(mergedSchema)
      setGraph(graph)

      console.log(`Schema loaded successfully from ${metadata.source}:`, {
        version: metadata.version,
        lastUpdated: metadata.lastUpdated,
        commit: metadata.commit,
        entities: Object.keys(mergedSchema.classes).length,
        slots: Object.keys(mergedSchema.slots).length
      })

    } catch (error) {
      console.error('Error loading schema:', error)
      setError(error instanceof Error ? error.message : 'Failed to load schema')
    } finally {
      setLoading(false)
    }
  }, [loadSchema, setGraph, setLoading, setError, loadFromGitHub, loadFromFallback])

  return { loadCDMSchema, fetchSchemaMetadata }
}

// Helper function to merge multiple schema files
function mergeSchemas(schemas: any[], metadata: SchemaMetadata): CDMSchema {
  const merged: CDMSchema = {
    id: schemas[0]?.id || 'cdm-schema',
    name: schemas[0]?.name || 'KBase CDM Schema',
    description: schemas[0]?.description || 'KBase Common Data Model - Dynamically loaded from GitHub',
    version: metadata.version,
    classes: {},
    slots: {},
    enums: {},
    // Add metadata fields
    metadata: {
      lastUpdated: metadata.lastUpdated,
      commit: metadata.commit,
      source: metadata.source,
      loadedAt: new Date().toISOString()
    }
  }

  // Merge classes, slots, and enums from all schemas
  for (const schema of schemas) {
    if (schema?.classes) {
      Object.assign(merged.classes, schema.classes)
    }
    if (schema?.slots) {
      Object.assign(merged.slots, schema.slots)
    }
    if (schema?.enums) {
      Object.assign(merged.enums || {}, schema.enums)
    }
  }

  return merged
}