# CDM Schema Viewer

An interactive visualization tool for the KBase Common Data Model (CDM) schema, providing a dbdiagram.io-style interface for exploring entity relationships and data structures.

## Features

- **Interactive Canvas**: Pan, zoom, and navigate through the schema with ease
- **Entity Visualization**: Color-coded entities with expandable details
- **Relationship Mapping**: Clear visualization of connections between entities
- **Search & Filter**: Find entities quickly with real-time search
- **Multiple View Modes**: Overview, detailed, domain-based, and compact views
- **Export Options**: Export diagrams as PNG, SVG, or JSON
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and tablet devices

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

- **Select**: Click on an entity
- **Expand/Collapse**: Double-click on an entity
- **View Details**: Hover over an entity for tooltips

### Filtering

- Use the sidebar to:
  - Search for specific entities
  - Filter by entity type
  - Toggle relationship visibility

### View Modes

- **Overview**: Simplified view focusing on relationships
- **Detailed**: Full attribute lists and descriptions
- **Domain**: Entities grouped by scientific domain
- **Compact**: Minimal view for large schemas

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