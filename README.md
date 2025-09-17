# CDM Schema Viewer

An interactive visualization tool for the KBase Common Data Model (CDM) schema, providing a dbdiagram.io-style interface for exploring entity relationships and data structures.

## Features

### 🖼️ **Interactive Visualization**
- **Interactive Canvas**: Pan, zoom, and navigate through the schema with ease
- **Entity Visualization**: Color-coded entities displayed as SQL-style table diagrams
- **Relationship Mapping**: Clear visualization of connections between entities with cardinality
- **Node Selection**: Click to select entities, Ctrl/Cmd+click for multi-selection
- **Entity Focus**: Click entities in sidebar to zoom and focus on them in the canvas

### 🔍 **Advanced Filtering & Search**
- **Real-time Search**: Find entities by name, description, or attribute names
- **Entity Type Filtering**: Toggle visibility of Core, Relationship, Metadata, Experimental, and Enum entities
- **Relationship Visibility**: Show/hide connection lines between entities
- **Smart Filtering**: Only shows relationships between visible entities

### 📊 **Multiple View Modes**
- **Overview**: Grid layout optimizing space utilization
- **Detailed**: Hierarchical layout showing full attribute lists
- **Domain**: Entities grouped by scientific domain (genomics, experimental, etc.)
- **Compact**: Minimal view for large schemas

### 🔄 **Dynamic Schema Management**
- **Live Schema Loading**: Automatically fetches latest schema from KBase GitHub repository
- **Schema Version Tracking**: Shows schema source, version, last updated date, and commit hash
- **Manual Refresh**: Force refresh to get the latest schema updates
- **Fallback Support**: Gracefully falls back to local schema files if GitHub is unavailable
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

### 📤 **Export & Sharing**
- **PNG Export**: High-quality raster images with dynamic sizing
- **SVG Export**: Scalable vector graphics for presentations
- **JSON Export**: Complete schema data with metadata for analysis
- **Theme-aware Export**: Exports respect current light/dark theme

### 🎨 **User Experience**
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and tablet devices
- **Collapsible Sidebar**: Expand/collapse for more canvas space
- **Grid & Minimap**: Optional visual aids for navigation

## Technology Stack

- **React 18** with TypeScript
- **React Flow** for diagram rendering
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Dagre** for automatic layout

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jplfaria/cdm_schema_viewer.git
cd cdm_schema_viewer

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch.

Visit the live demo at: https://jplfaria.github.io/cdm_schema_viewer/

## Usage

### Navigation

- **Pan**: Click and drag on the canvas
- **Zoom**: Use mouse wheel or pinch gesture
- **Fit to View**: Click the maximize button in the controls

### Entity Interaction

- **Select Single Entity**: Click on any entity to select it
- **Multi-Select**: Hold Ctrl/Cmd and click to select multiple entities
- **Focus on Entity**: Click any entity in the sidebar to zoom and focus on it
- **Clear Selection**: Click on empty canvas space to deselect all
- **Expand/Collapse**: Double-click on an entity (feature under development)

### Filtering & Search

#### Sidebar Controls
- **Search Bar**: Type to find entities by name, description, or attributes
- **Entity Type Checkboxes**:
  - ✅ Core Entities (blue) - Fundamental data types
  - ✅ Relationships (green) - Join tables and connections
  - ✅ Metadata (purple) - Supporting information
  - ✅ Experimental (orange) - Research-related entities
  - ✅ Enumerations (gray) - Controlled vocabularies
- **Show Connections**: Toggle relationship lines visibility
- **Clear All**: Reset all filters to default state

#### Interactive Features
- **Entity List**: Browse all entities with descriptions and attribute counts
- **Live Filtering**: Canvas updates immediately as you change filters
- **Smart Relationships**: Only shows connections between visible entities

### View Modes

- **Overview**: Grid layout optimizing space utilization for best overview
- **Detailed**: Hierarchical layout with full attribute lists and descriptions
- **Domain**: Entities grouped by scientific domain (genomics, experimental, metadata, etc.)
- **Compact**: Minimal view for large schemas (same as detailed currently)

### Canvas Controls

- **Fit to View**: 🔍 Automatically fit all visible entities in view
- **Toggle Grid**: ⊞ Show/hide background grid for alignment
- **Toggle Minimap**: 🗺️ Show/hide navigation minimap
- **Refresh Schema**: 🔄 Manually reload schema from GitHub
- **View Mode Selector**: 📋 Switch between Overview, Detailed, Domain, and Compact layouts
- **Export Options**: 📥 Export as PNG, SVG, or JSON with metadata

### Schema Information

The status bar shows:
- **Entity Count**: Number of visible entities
- **Relationship Count**: Number of visible connections
- **Schema Source**: Live indicator showing if loaded from GitHub (🟢 Live) or local files (🟡 Local)
- **Version Info**: Hover over indicator to see commit hash, last updated date, and source details

## Schema Structure

The CDM schema includes various entity types:

- **Core Entities**: Fundamental data types (Contig, Feature, Protein, Sample)
- **Relationships**: Join tables connecting entities
- **Metadata**: Supporting information (Contributor, Publication, Project)
- **Experimental**: Research-related entities (Experiment, Protocol)
- **Enumerations**: Controlled vocabularies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.