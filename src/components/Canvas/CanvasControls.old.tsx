import { useState } from 'react'
import { FiGrid, FiMap, FiMaximize, FiLayers, FiDownload, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { useReactFlow, getNodesBounds } from 'reactflow'
import { useViewStore } from '@/store/viewStore'
import { useSchemaStore } from '@/store/schemaStore'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { toPng, toSvg } from 'html-to-image'
import { saveAs } from 'file-saver'

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error'

export default function CanvasControls() {
  const { fitView, getNodes, getEdges } = useReactFlow()
  const graph = useSchemaStore((state) => state.graph)
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle')
  const [exportType, setExportType] = useState<string>('')
  
  const {
    showGrid,
    toggleGrid,
    showMinimap,
    toggleMinimap,
    mode,
    setViewMode,
  } = useViewStore()

  const viewModes = [
    { id: 'overview', label: 'Overview', description: 'Simplified view' },
    { id: 'detailed', label: 'Detailed', description: 'Show all attributes' },
    { id: 'domain', label: 'By Domain', description: 'Group by domain' },
    { id: 'compact', label: 'Compact', description: 'Minimal view' },
  ]

  // Reset export status after timeout
  const resetExportStatus = () => {
    setTimeout(() => {
      setExportStatus('idle')
      setExportType('')
    }, 3000)
  }

  // Export handlers
  const exportAsPNG = async () => {
    const nodes = getNodes()
    if (nodes.length === 0) {
      setExportStatus('error')
      setExportType('No nodes to export')
      resetExportStatus()
      return
    }

    setExportStatus('exporting')
    setExportType('PNG')

    const nodesBounds = getNodesBounds(nodes)
    const padding = 50
    const imageWidth = nodesBounds.width + padding * 2
    const imageHeight = nodesBounds.height + padding * 2

    // Get the React Flow viewport element
    const reactFlowViewport = document.querySelector('.react-flow__viewport') as HTMLElement
    if (!reactFlowViewport) {
      setExportStatus('error')
      resetExportStatus()
      return
    }

    // Get current theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    const backgroundColor = isDarkMode ? '#020817' : '#ffffff'

    try {
      // Clone the viewport to avoid modifying the original
      const clonedViewport = reactFlowViewport.cloneNode(true) as HTMLElement
      
      // Create a temporary container
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '-9999px'
      container.style.width = `${imageWidth}px`
      container.style.height = `${imageHeight}px`
      container.style.backgroundColor = backgroundColor
      
      // Apply transform to fit all nodes
      clonedViewport.style.transform = `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px)`
      
      container.appendChild(clonedViewport)
      document.body.appendChild(container)

      const dataUrl = await toPng(container, {
        backgroundColor,
        width: imageWidth,
        height: imageHeight,
        filter: (node) => {
          // Exclude minimap and controls from export
          const className = node.className
          if (typeof className === 'string') {
            return !className.includes('react-flow__minimap') && 
                   !className.includes('react-flow__controls')
          }
          return true
        },
      })
      
      // Clean up
      document.body.removeChild(container)
      
      // Save the file
      saveAs(dataUrl, `cdm-schema-diagram-${new Date().toISOString().slice(0, 10)}.png`)
      
      setExportStatus('success')
      resetExportStatus()
    } catch (error) {
      console.error('Error exporting PNG:', error)
      setExportStatus('error')
      resetExportStatus()
    }
  }

  const exportAsSVG = async () => {
    const nodes = getNodes()
    if (nodes.length === 0) {
      setExportStatus('error')
      setExportType('No nodes to export')
      resetExportStatus()
      return
    }

    setExportStatus('exporting')
    setExportType('SVG')

    const nodesBounds = getNodesBounds(nodes)
    const padding = 50
    const imageWidth = nodesBounds.width + padding * 2
    const imageHeight = nodesBounds.height + padding * 2

    // Get the React Flow viewport element
    const reactFlowViewport = document.querySelector('.react-flow__viewport') as HTMLElement
    if (!reactFlowViewport) {
      setExportStatus('error')
      resetExportStatus()
      return
    }

    // Get current theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    const backgroundColor = isDarkMode ? '#020817' : '#ffffff'

    try {
      // Clone the viewport to avoid modifying the original
      const clonedViewport = reactFlowViewport.cloneNode(true) as HTMLElement
      
      // Create a temporary container
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '-9999px'
      container.style.width = `${imageWidth}px`
      container.style.height = `${imageHeight}px`
      container.style.backgroundColor = backgroundColor
      
      // Apply transform to fit all nodes
      clonedViewport.style.transform = `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px)`
      
      container.appendChild(clonedViewport)
      document.body.appendChild(container)

      const dataUrl = await toSvg(container, {
        backgroundColor,
        width: imageWidth,
        height: imageHeight,
        filter: (node) => {
          // Exclude minimap and controls from export
          const className = node.className
          if (typeof className === 'string') {
            return !className.includes('react-flow__minimap') && 
                   !className.includes('react-flow__controls')
          }
          return true
        },
      })
      
      // Clean up
      document.body.removeChild(container)
      
      // Convert data URL to blob for better SVG handling
      const svgString = decodeURIComponent(dataUrl.split(',')[1])
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      
      // Save the file
      saveAs(blob, `cdm-schema-diagram-${new Date().toISOString().slice(0, 10)}.svg`)
      
      setExportStatus('success')
      resetExportStatus()
    } catch (error) {
      console.error('Error exporting SVG:', error)
      setExportStatus('error')
      resetExportStatus()
    }
  }

  const exportAsJSON = () => {
    const nodes = getNodes()
    const edges = getEdges()
    
    if (nodes.length === 0) {
      setExportStatus('error')
      setExportType('No nodes to export')
      resetExportStatus()
      return
    }

    setExportStatus('exporting')
    setExportType('JSON')
    
    const exportData = {
      version: '1.0',
      metadata: {
        exportDate: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
        viewMode: mode,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      },
      diagram: {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: {
            ...node.data,
            // Include entity details if available
            entity: node.data.entity || null,
            isExpanded: node.data.isExpanded || false,
          },
          width: node.width,
          height: node.height,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || null,
          targetHandle: edge.targetHandle || null,
          type: edge.type || 'default',
          data: edge.data || {},
          label: edge.label || null,
        })),
      },
      // Include graph metadata if available
      ...(graph?.metadata && { graphMetadata: graph.metadata }),
    }
    
    try {
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
      
      // Save the file with timestamp
      saveAs(blob, `cdm-schema-diagram-${new Date().toISOString().slice(0, 10)}.json`)
      
      setExportStatus('success')
      resetExportStatus()
    } catch (error) {
      console.error('Error exporting JSON:', error)
      setExportStatus('error')
      resetExportStatus()
    }
  }

  return (
    <div className="absolute left-4 top-4 flex items-center gap-2">
      <Tooltip.Provider>
        {/* Fit View */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => fitView({ padding: 0.2 })}
              className="rounded-md border bg-background p-2 shadow-sm hover:bg-muted"
              aria-label="Fit to view"
            >
              <FiMaximize size={16} />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md"
              sideOffset={5}
            >
              Fit to view
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Toggle Grid */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={toggleGrid}
              className={`rounded-md border bg-background p-2 shadow-sm hover:bg-muted ${
                showGrid ? 'text-blue-600' : ''
              }`}
              aria-label="Toggle grid"
            >
              <FiGrid size={16} />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md"
              sideOffset={5}
            >
              Toggle grid
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Toggle Minimap */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={toggleMinimap}
              className={`rounded-md border bg-background p-2 shadow-sm hover:bg-muted ${
                showMinimap ? 'text-blue-600' : ''
              }`}
              aria-label="Toggle minimap"
            >
              <FiMap size={16} />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md"
              sideOffset={5}
            >
              Toggle minimap
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* View Mode Selector */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted"
              aria-label="Select view mode"
            >
              <FiLayers size={16} />
              <span className="capitalize">{mode}</span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[200px] rounded-md border bg-background p-1 shadow-lg"
              sideOffset={5}
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
                View Mode
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              {viewModes.map((viewMode) => (
                <DropdownMenu.Item
                  key={viewMode.id}
                  className="flex cursor-pointer flex-col rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
                  onClick={() => setViewMode(viewMode.id as any)}
                >
                  <div className="flex items-center justify-between">
                    <span>{viewMode.label}</span>
                    {mode === viewMode.id && <span className="text-blue-600">✓</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{viewMode.description}</span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Export */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={`flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted ${
                exportStatus === 'exporting' ? 'opacity-50 cursor-wait' : ''
              } ${exportStatus === 'success' ? 'border-green-500 text-green-600' : ''} ${
                exportStatus === 'error' ? 'border-red-500 text-red-600' : ''
              }`}
              aria-label="Export"
              disabled={exportStatus === 'exporting'}
            >
              {exportStatus === 'exporting' && (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  <span>Exporting {exportType}...</span>
                </>
              )}
              {exportStatus === 'success' && (
                <>
                  <FiCheck size={16} />
                  <span>Exported!</span>
                </>
              )}
              {exportStatus === 'error' && (
                <>
                  <FiAlertCircle size={16} />
                  <span>{exportType || 'Export Failed'}</span>
                </>
              )}
              {exportStatus === 'idle' && (
                <>
                  <FiDownload size={16} />
                  <span>Export</span>
                </>
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[160px] rounded-md border bg-background p-1 shadow-lg"
              sideOffset={5}
            >
              <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
                Export As
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />

              <DropdownMenu.Item
                className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
                onClick={exportAsPNG}
              >
                PNG Image
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
                onClick={exportAsSVG}
              >
                SVG Vector
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
                onClick={exportAsJSON}
              >
                JSON Data
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </Tooltip.Provider>

      {/* Stats */}
      {graph && (
        <div className="ml-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{graph.nodes.length} entities</span>
          <span>{graph.edges.length} relationships</span>
        </div>
      )}
    </div>
  )
}