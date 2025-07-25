import { Node, Edge } from 'reactflow'
import { EntityType } from './schema'

// Extended node data for schema entities
export interface EntityNodeData {
  label: string
  description?: string
  type: EntityType
  domain?: string
  isExpanded: boolean
  attributes: AttributeInfo[]
  isRelationship?: boolean
  parentClass?: string
}

export interface AttributeInfo {
  name: string
  type: string
  required: boolean
  isIdentifier?: boolean
  isMultivalued?: boolean
  description?: string
}

// Custom node type
export type EntityNode = Node<EntityNodeData>

// Relationship edge data
export interface RelationshipEdgeData {
  label?: string
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many'
  sourceHandle?: string
  targetHandle?: string
}

// Custom edge type
export type RelationshipEdge = Edge<RelationshipEdgeData>

// Graph representation
export interface SchemaGraph {
  nodes: EntityNode[]
  edges: RelationshipEdge[]
  metadata: GraphMetadata
}

export interface GraphMetadata {
  entityCount: number
  relationshipCount: number
  domains: string[]
  lastUpdated: Date
}

// Layout configuration
export interface LayoutConfig {
  type: 'hierarchical' | 'force' | 'grid' | 'domain'
  direction?: 'TB' | 'BT' | 'LR' | 'RL'
  spacing?: {
    nodeWidth: number
    nodeHeight: number
    rankSep: number
    nodeSep: number
  }
}

// Position helpers
export interface NodePosition {
  x: number
  y: number
}

export interface NodeDimensions {
  width: number
  height: number
}