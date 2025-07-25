import { create } from 'zustand'
import { ViewState, ViewMode, FilterState, SelectionState, UIPreferences } from '@/types/ui'

interface ViewStore extends ViewState, FilterState, SelectionState, UIPreferences {
  // View actions
  setViewMode: (mode: ViewMode) => void
  setZoom: (zoom: number) => void
  setCenter: (center: { x: number; y: number }) => void
  toggleMinimap: () => void
  toggleGrid: () => void
  toggleLabels: () => void

  // Filter actions
  setSearchQuery: (query: string) => void
  toggleEntityType: (type: string) => void
  toggleDomain: (domain: string) => void
  toggleRelationships: () => void
  clearFilters: () => void

  // Selection actions
  selectNode: (nodeId: string, multi?: boolean) => void
  clearSelection: () => void
  setHoveredNode: (nodeId: string | null) => void
  setFocusedNode: (nodeId: string | null) => void

  // UI preference actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void
  setColorScheme: (scheme: 'default' | 'colorblind' | 'highContrast') => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  toggleDescriptions: () => void
  toggleAnimations: () => void
}

const initialState = {
  // View state
  mode: 'overview' as ViewMode,
  zoom: 1,
  center: { x: 0, y: 0 },
  showMinimap: true,
  showGrid: true,
  showLabels: true,

  // Filter state
  searchQuery: '',
  selectedTypes: ['core', 'relationship', 'metadata', 'experimental', 'enum'] as any[],
  selectedDomains: [],
  showRelationships: true,

  // Selection state
  selectedNodes: [],
  hoveredNode: null,
  focusedNode: null,

  // UI preferences
  theme: 'light' as const,
  colorScheme: 'default' as const,
  fontSize: 'medium' as const,
  showDescriptions: true,
  animateTransitions: true,
}

export const useViewStore = create<ViewStore>((set) => ({
  ...initialState,

  // View actions
  setViewMode: (mode) => set({ mode }),
  setZoom: (zoom) => set({ zoom }),
  setCenter: (center) => set({ center }),
  toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  // Filter actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleEntityType: (type) =>
    set((state) => {
      const types = state.selectedTypes.includes(type as any)
        ? state.selectedTypes.filter((t) => t !== type)
        : [...state.selectedTypes, type as any]
      return { selectedTypes: types }
    }),
  toggleDomain: (domain) =>
    set((state) => {
      const domains = state.selectedDomains.includes(domain)
        ? state.selectedDomains.filter((d) => d !== domain)
        : [...state.selectedDomains, domain]
      return { selectedDomains: domains }
    }),
  toggleRelationships: () =>
    set((state) => ({ showRelationships: !state.showRelationships })),
  clearFilters: () =>
    set({
      searchQuery: '',
      selectedTypes: ['core', 'relationship', 'metadata', 'experimental', 'enum'] as any[],
      selectedDomains: [],
      showRelationships: true,
    }),

  // Selection actions
  selectNode: (nodeId, multi = false) =>
    set((state) => {
      if (multi) {
        const isSelected = state.selectedNodes.includes(nodeId)
        return {
          selectedNodes: isSelected
            ? state.selectedNodes.filter((id) => id !== nodeId)
            : [...state.selectedNodes, nodeId],
        }
      }
      return { selectedNodes: [nodeId] }
    }),
  clearSelection: () => set({ selectedNodes: [], focusedNode: null }),
  setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }),
  setFocusedNode: (nodeId) => set({ focusedNode: nodeId }),

  // UI preference actions
  setTheme: (theme) => set({ theme }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setFontSize: (fontSize) => set({ fontSize }),
  toggleDescriptions: () => set((state) => ({ showDescriptions: !state.showDescriptions })),
  toggleAnimations: () => set((state) => ({ animateTransitions: !state.animateTransitions })),
}))