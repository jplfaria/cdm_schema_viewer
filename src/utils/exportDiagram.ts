import { toPng, toSvg } from 'html-to-image'
import { saveAs } from 'file-saver'
import { EntityNode, RelationshipEdge } from '@/types/graph'

export async function exportDiagramAsPNG(element: HTMLElement, filename?: string) {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#ffffff',
      filter: (node) => {
        // Exclude controls and minimap from export
        return !node.classList?.contains('react-flow__controls') &&
               !node.classList?.contains('react-flow__minimap')
      },
    })
    
    saveAs(dataUrl, filename || `cdm-schema-${new Date().toISOString().split('T')[0]}.png`)
    return dataUrl
  } catch (error) {
    console.error('Error exporting PNG:', error)
    throw error
  }
}

export async function exportDiagramAsSVG(element: HTMLElement, filename?: string) {
  try {
    const dataUrl = await toSvg(element, {
      filter: (node) => {
        return !node.classList?.contains('react-flow__controls') &&
               !node.classList?.contains('react-flow__minimap')
      },
    })
    
    saveAs(dataUrl, filename || `cdm-schema-${new Date().toISOString().split('T')[0]}.svg`)
    return dataUrl
  } catch (error) {
    console.error('Error exporting SVG:', error)
    throw error
  }
}

export function exportDiagramAsJSON(nodes: EntityNode[], edges: RelationshipEdge[], filename?: string) {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    nodes: nodes.map(node => ({
      id: node.id,
      label: node.data.label,
      type: node.data.type,
      attributes: node.data.attributes,
      position: node.position,
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.data?.label,
      cardinality: edge.data?.cardinality,
    })),
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveAs(blob, filename || `cdm-schema-${new Date().toISOString().split('T')[0]}.json`)
  return data
}