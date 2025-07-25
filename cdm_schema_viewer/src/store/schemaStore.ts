import { create } from 'zustand'
import { CDMSchema, CDMClass, EntityType } from '@/types/schema'
import { SchemaGraph } from '@/types/graph'

interface SchemaState {
  // Schema data
  schema: CDMSchema | null
  graph: SchemaGraph | null
  loading: boolean
  error: string | null

  // Actions
  loadSchema: (schemaData: CDMSchema) => void
  setGraph: (graph: SchemaGraph) => void
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void
  toggleNodeExpanded: (nodeId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useSchemaStore = create<SchemaState>((set) => ({
  schema: null,
  graph: null,
  loading: false,
  error: null,

  loadSchema: (schemaData) => set({ schema: schemaData, error: null }),
  
  setGraph: (graph) => set({ graph }),
  
  updateNodePosition: (nodeId, position) =>
    set((state) => {
      if (!state.graph) return state
      
      const updatedNodes = state.graph.nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      )
      
      return {
        graph: {
          ...state.graph,
          nodes: updatedNodes,
        },
      }
    }),
  
  toggleNodeExpanded: (nodeId) =>
    set((state) => {
      if (!state.graph) return state
      
      const updatedNodes = state.graph.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: { ...node.data, isExpanded: !node.data.isExpanded },
            }
          : node
      )
      
      return {
        graph: {
          ...state.graph,
          nodes: updatedNodes,
        },
      }
    }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({ schema: null, graph: null, loading: false, error: null }),
}))

// Helper function to classify entity type
export function classifyEntityType(cdmClass: CDMClass): EntityType {
  if (cdmClass.represents_relationship) return 'relationship'
  
  const name = cdmClass.name.toLowerCase()
  
  // Core entities
  if (['contig', 'contigcollection', 'feature', 'protein', 'sample'].includes(name)) {
    return 'core'
  }
  
  // Metadata entities
  if (['contributor', 'publication', 'project', 'datasource'].includes(name)) {
    return 'metadata'
  }
  
  // Experimental entities
  if (['experiment', 'protocol', 'event'].includes(name)) {
    return 'experimental'
  }
  
  return 'core' // default
}