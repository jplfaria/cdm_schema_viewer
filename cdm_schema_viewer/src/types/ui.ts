// UI State Types

export interface ViewState {
  mode: ViewMode
  zoom: number
  center: { x: number; y: number }
  showMinimap: boolean
  showGrid: boolean
  showLabels: boolean
}

export type ViewMode = 'overview' | 'detailed' | 'domain' | 'compact'

export interface FilterState {
  searchQuery: string
  selectedTypes: EntityTypeFilter[]
  selectedDomains: string[]
  showRelationships: boolean
}

export type EntityTypeFilter = 'core' | 'relationship' | 'metadata' | 'experimental' | 'enum'

export interface SelectionState {
  selectedNodes: string[]
  hoveredNode: string | null
  focusedNode: string | null
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto'
  colorScheme: ColorScheme
  fontSize: 'small' | 'medium' | 'large'
  showDescriptions: boolean
  animateTransitions: boolean
}

export type ColorScheme = 'default' | 'colorblind' | 'highContrast'

// Export formats
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'json' | 'sql' | 'plantuml'

export interface ExportOptions {
  format: ExportFormat
  includeMetadata: boolean
  scale?: number
  quality?: number
}