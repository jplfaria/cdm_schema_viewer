# Export Functionality Documentation

## Overview
The CDM Schema Viewer now includes comprehensive export functionality that allows users to export their database diagrams in multiple formats:

- **PNG** - High-quality raster image format
- **SVG** - Scalable vector graphics format
- **JSON** - Structured data format

## Features

### 1. PNG Export
- Captures the entire diagram with proper styling
- Preserves the current theme (light/dark mode)
- Includes padding around the diagram
- Generates files with timestamps (e.g., `cdm-schema-diagram-2025-07-25.png`)

### 2. SVG Export
- Exports scalable vector graphics
- Maintains all visual elements and styling
- Perfect for documentation and presentations
- Can be edited in vector graphics software

### 3. JSON Export
- Exports complete diagram structure including:
  - Node positions and data
  - Edge connections and relationships
  - View mode and theme settings
  - Export metadata (date, version, counts)
- Can be used to restore diagrams or integrate with other tools

## Implementation Details

### Visual Feedback
- Loading state with spinner during export
- Success indicator (green checkmark)
- Error state with descriptive messages
- Auto-reset after 3 seconds

### Technical Implementation
- Uses `html-to-image` library for PNG/SVG generation
- Clones the React Flow viewport to avoid modifying the original
- Handles both light and dark themes correctly
- Excludes UI controls (minimap, controls) from exports

### Error Handling
- Validates presence of nodes before export
- Graceful error handling with user feedback
- Console logging for debugging

## Usage
1. Click the "Export" button in the canvas controls
2. Select your desired format from the dropdown menu
3. The file will be automatically downloaded with an appropriate filename

## Code Location
The export functionality is implemented in:
`/Users/jplfaria/repos/cdm_schema_viewer/src/components/Canvas/CanvasControls.tsx`