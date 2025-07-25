# CDM Schema Visualization Architecture

## Overview

This document outlines the architecture for an interactive schema visualization UI for the KBase CDM (Common Data Model) schema, similar to dbdiagram.io but optimized for scientific data models.

## Technology Stack Recommendation

### Frontend Framework: React 18 with TypeScript
- **Rationale**: Strong ecosystem, excellent TypeScript support, ideal for complex interactive UIs
- **State Management**: Zustand for global state (lightweight, TypeScript-friendly)
- **Routing**: React Router v6 for navigation between views

### Visualization Library: React Flow
- **Primary Choice**: React Flow (https://reactflow.dev/)
- **Rationale**: 
  - Built specifically for node-based editors and diagrams
  - Excellent performance with virtualization
  - Built-in zoom, pan, minimap
  - Customizable nodes and edges
  - Touch support out of the box
- **Alternative**: D3.js with custom React integration if more control needed

### Rendering Approach: SVG with Canvas fallback
- **Primary**: SVG for crisp rendering and easy styling
- **Performance Mode**: Canvas API for >100 entities
- **WebGL**: Consider for >500 entities (using PixiJS)

### Build Tools
- **Vite**: Fast build tool with excellent DX
- **TypeScript**: Type safety for complex schema data
- **Tailwind CSS**: Utility-first styling
- **Vitest**: Testing framework

### Deployment
- **GitHub Pages**: Static site deployment
- **GitHub Actions**: CI/CD pipeline

## Component Architecture

```
src/
├── components/
│   ├── Canvas/
│   │   ├── SchemaCanvas.tsx         # Main visualization canvas
│   │   ├── CanvasControls.tsx       # Zoom, pan, fit controls
│   │   └── Minimap.tsx              # Overview minimap
│   ├── Entities/
│   │   ├── EntityNode.tsx           # Base entity component
│   │   ├── TableEntity.tsx          # Table-specific entity
│   │   ├── RelationshipEntity.tsx   # Join table entity
│   │   └── EntityDetails.tsx        # Expandable details
│   ├── Relationships/
│   │   ├── RelationshipEdge.tsx     # Connection lines
│   │   ├── CardinalityLabel.tsx     # 1:1, 1:N, N:M labels
│   │   └── EdgeRouter.tsx           # Path calculation
│   ├── Controls/
│   │   ├── SearchBar.tsx            # Entity search
│   │   ├── FilterPanel.tsx          # Filter by type/domain
│   │   ├── ViewModeSelector.tsx     # Switch between views
│   │   └── ExportMenu.tsx           # Export options
│   ├── Layout/
│   │   ├── Header.tsx               # App header
│   │   ├── Sidebar.tsx              # Entity list/tree
│   │   └── StatusBar.tsx            # Connection info
│   └── Common/
│       ├── Tooltip.tsx              # Info tooltips
│       ├── ContextMenu.tsx          # Right-click menus
│       └── Modal.tsx                # Dialogs
├── hooks/
│   ├── useSchemaData.ts             # Schema loading/parsing
│   ├── useLayout.ts                 # Auto-layout algorithms
│   ├── useSelection.ts              # Multi-select handling
│   └── useKeyboardShortcuts.ts      # Keyboard navigation
├── services/
│   ├── schemaParser.ts              # LinkML to graph parser
│   ├── layoutEngine.ts              # Dagre/ELK layout
│   ├── exportService.ts             # Export functionality
│   └── searchService.ts             # Entity search
├── store/
│   ├── schemaStore.ts               # Schema data state
│   ├── viewStore.ts                 # View preferences
│   └── selectionStore.ts            # Selection state
├── types/
│   ├── schema.ts                    # CDM schema types
│   ├── graph.ts                     # Graph data types
│   └── ui.ts                        # UI state types
└── utils/
    ├── colorCoding.ts               # Entity color schemes
    ├── geometryHelpers.ts           # Layout calculations
    └── performance.ts               # Performance utils

```

## Data Flow Architecture

### 1. Schema Loading Pipeline
```typescript
LinkML YAML → Parser → Graph Model → Layout Engine → Render
```

### 2. State Management Flow
```typescript
User Action → Store Update → React Flow Update → Canvas Re-render
```

### 3. Graph Data Model
```typescript
interface SchemaGraph {
  nodes: Map<string, EntityNode>;
  edges: Map<string, RelationshipEdge>;
  domains: Map<string, Domain>;
  metadata: SchemaMetadata;
}

interface EntityNode {
  id: string;
  type: 'table' | 'relationship' | 'enum';
  position: { x: number; y: number };
  data: {
    name: string;
    description: string;
    attributes: Attribute[];
    domain?: string;
    isExpanded: boolean;
  };
}

interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  label?: string;
}
```

## Key Features Implementation

### 1. Interactive Canvas
- **Pan**: Mouse drag or touch drag
- **Zoom**: Mouse wheel, pinch gesture, or controls
- **Selection**: Click, Ctrl+click for multi-select, drag box
- **Navigation**: Keyboard arrows, Tab through entities

### 2. Entity Visualization
```typescript
// Color coding by entity type
const entityColors = {
  core: '#3B82F6',      // Blue - Core entities
  relationship: '#10B981', // Green - Join tables
  metadata: '#F59E0B',  // Amber - Metadata entities
  experimental: '#8B5CF6', // Purple - Experimental
  enum: '#6B7280'       // Gray - Enumerations
};
```

### 3. Layout Algorithms
- **Hierarchical**: Dagre for tree-like structures
- **Force-directed**: D3 force for organic layouts
- **Grid**: Manual grid snapping
- **Domain-based**: Group by scientific domain

### 4. Performance Optimizations
- **Virtualization**: Only render visible entities
- **LOD (Level of Detail)**: Simplified rendering when zoomed out
- **Web Workers**: Layout calculations off main thread
- **Memoization**: Cache expensive computations
- **Lazy Loading**: Load entity details on demand

### 5. Search Implementation
```typescript
// Fuzzy search with highlighting
const searchEntities = (query: string) => {
  return fuse.search(query).map(result => ({
    ...result.item,
    highlights: result.matches
  }));
};
```

### 6. Export Capabilities
- **PNG/SVG**: Canvas snapshot
- **PDF**: Print-optimized layout
- **JSON**: Graph data export
- **SQL DDL**: Schema definition
- **PlantUML**: Diagram code

## View Modes

### 1. Overview Mode
- All entities visible
- Simplified node representation
- Focus on relationships

### 2. Detailed Mode
- Full attribute lists
- Descriptions visible
- Type information

### 3. Domain Mode
- Grouped by scientific domain
- Collapsed cross-domain relationships
- Domain-specific coloring

### 4. Compact Mode
- Minimal entity boxes
- Optimized for large schemas
- Relationship focus

## User Interaction Patterns

### Entity Interactions
- **Click**: Select entity
- **Double-click**: Expand/collapse
- **Right-click**: Context menu
- **Hover**: Show tooltip
- **Drag**: Reposition (manual mode)

### Relationship Interactions
- **Hover**: Highlight connected entities
- **Click**: Show relationship details
- **Right-click**: Relationship options

### Canvas Interactions
- **Space + Drag**: Pan canvas
- **Scroll**: Zoom in/out
- **Ctrl+0**: Fit to screen
- **Ctrl+F**: Focus search

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through entities
   - Arrow keys for movement
   - Enter to expand/collapse
   - Escape to deselect

2. **Screen Reader Support**
   - ARIA labels for all entities
   - Relationship descriptions
   - Navigation announcements

3. **Visual Accessibility**
   - High contrast mode
   - Colorblind-friendly palettes
   - Adjustable font sizes
   - Focus indicators

## Mobile Responsiveness

### Touch Gestures
- **Tap**: Select entity
- **Double-tap**: Expand/collapse
- **Pinch**: Zoom
- **Drag**: Pan
- **Long press**: Context menu

### Responsive Layout
- Collapsible sidebar on small screens
- Touch-optimized controls
- Simplified toolbar
- Full-screen mode

## Performance Targets

- Initial load: <3s for full schema
- Pan/zoom: 60fps
- Search response: <100ms
- Layout calculation: <2s for 100 entities
- Export generation: <5s

## Security Considerations

- No backend required (static site)
- Client-side only processing
- No data persistence
- Safe SVG rendering
- XSS prevention in tooltips

## Development Workflow

1. **Local Development**
   ```bash
   npm run dev  # Vite dev server
   ```

2. **Testing**
   ```bash
   npm run test  # Vitest unit tests
   npm run e2e   # Playwright e2e tests
   ```

3. **Build & Deploy**
   ```bash
   npm run build  # Production build
   npm run deploy # GitHub Pages deploy
   ```

## Future Enhancements

1. **Collaboration Features**
   - Shareable diagram links
   - Comments on entities
   - Version history

2. **Advanced Visualization**
   - 3D view mode
   - Time-based animations
   - Data flow visualization

3. **Integration Options**
   - REST API for dynamic schemas
   - Plugin system
   - Embeddable widget

4. **AI Features**
   - Smart layout suggestions
   - Relationship inference
   - Natural language search