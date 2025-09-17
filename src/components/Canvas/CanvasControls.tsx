import { useState } from 'react'
import { FiGrid, FiMap, FiMaximize, FiLayers, FiDownload, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { useReactFlow, getNodesBounds, getViewportForBounds } from 'reactflow'
import { useViewStore } from '@/store/viewStore'
import { useSchemaStore } from '@/store/schemaStore'
import { useSchemaLoader } from '@/hooks/useSchemaLoader'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import { toPng, toSvg } from 'html-to-image'
import { saveAs } from 'file-saver'

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error'

// Dynamic image dimensions based on content
const calculateImageDimensions = (nodesBounds: { x: number; y: number; width: number; height: number }) => {
  const padding = 100
  const width = Math.max(1920, nodesBounds.width + padding * 2)
  const height = Math.max(1080, nodesBounds.height + padding * 2)
  return { width, height }
}

export default function CanvasControls() {
  const { fitView, getNodes, getEdges } = useReactFlow()
  const graph = useSchemaStore((state) => state.graph)
  const loading = useSchemaStore((state) => state.loading)
  const { loadCDMSchema } = useSchemaLoader()
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

  // Export handlers - Fixed version
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

    // Get the bounds of all nodes
    const nodesBounds = getNodesBounds(nodes)
    
    // Calculate dynamic image dimensions based on content
    const { width: imageWidth, height: imageHeight } = calculateImageDimensions(nodesBounds)
    
    // Calculate the viewport for the bounds with padding
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.1, // minZoom - reduced to capture more content
      2,   // maxZoom
      0.2  // padding - increased for better spacing
    )

    try {
      // Get the actual React Flow wrapper element (not the viewport)
      const reactFlowWrapper = document.querySelector('.react-flow') as HTMLElement
      if (!reactFlowWrapper) {
        throw new Error('React Flow element not found. Please ensure the diagram is loaded.')
      }

      // Apply the calculated viewport transform temporarily
      const reactFlowViewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
      if (!reactFlowViewport) {
        throw new Error('React Flow viewport not found. The diagram structure may be invalid.')
      }

      // Ensure nodes are visible
      const visibleNodes = nodes.filter(node => node.width && node.height)
      if (visibleNodes.length === 0) {
        throw new Error('No visible nodes found. Nodes may still be rendering.')
      }

      // Store original transform
      const originalTransform = reactFlowViewport.style.transform
      const originalTransition = reactFlowViewport.style.transition

      // Apply new transform without transition
      reactFlowViewport.style.transition = 'none'
      reactFlowViewport.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`

      // Wait for render - use requestAnimationFrame for better timing
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve)
        })
      })

      // Get current theme
      const isDarkMode = document.documentElement.classList.contains('dark')

      // Export the image
      const dataUrl = await toPng(reactFlowWrapper, {
        backgroundColor: isDarkMode ? '#020817' : '#ffffff',
        width: imageWidth,
        height: imageHeight,
        filter: (node) => {
          return !node.classList?.contains('react-flow__minimap') && 
                 !node.classList?.contains('react-flow__controls') &&
                 !node.classList?.contains('react-flow__background') &&
                 !node.classList?.contains('react-flow__attribution')
        },
        style: {
          width: imageWidth + 'px',
          height: imageHeight + 'px',
        }
      })

      // Restore original transform
      reactFlowViewport.style.transform = originalTransform
      reactFlowViewport.style.transition = originalTransition

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

    try {
      // Get the React Flow wrapper
      const reactFlowWrapper = document.querySelector('.react-flow') as HTMLElement
      if (!reactFlowWrapper) {
        throw new Error('React Flow element not found. Please ensure the diagram is loaded.')
      }

      // Ensure nodes are visible
      const visibleNodes = nodes.filter(node => node.width && node.height)
      if (visibleNodes.length === 0) {
        throw new Error('No visible nodes found. Nodes may still be rendering.')
      }

      // Get bounds and viewport
      const nodesBounds = getNodesBounds(nodes)
      const { width: imageWidth, height: imageHeight } = calculateImageDimensions(nodesBounds)
      const viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.1,
        2,
        0.2
      )

      // Get the viewport element
      const reactFlowViewport = reactFlowWrapper.querySelector('.react-flow__viewport') as HTMLElement
      if (!reactFlowViewport) {
        throw new Error('React Flow viewport not found')
      }

      // Store and apply transform
      const originalTransform = reactFlowViewport.style.transform
      const originalTransition = reactFlowViewport.style.transition
      
      reactFlowViewport.style.transition = 'none'
      reactFlowViewport.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`

      // Wait for render - use requestAnimationFrame for better timing
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve)
        })
      })

      // Get current theme
      const isDarkMode = document.documentElement.classList.contains('dark')

      // Export as SVG
      const dataUrl = await toSvg(reactFlowWrapper, {
        backgroundColor: isDarkMode ? '#020817' : '#ffffff',
        width: imageWidth,
        height: imageHeight,
        filter: (node) => {
          return !node.classList?.contains('react-flow__minimap') && 
                 !node.classList?.contains('react-flow__controls') &&
                 !node.classList?.contains('react-flow__background') &&
                 !node.classList?.contains('react-flow__attribution')
        },
        style: {
          width: imageWidth + 'px',
          height: imageHeight + 'px',
        }
      })

      // Restore transform
      reactFlowViewport.style.transform = originalTransform
      reactFlowViewport.style.transition = originalTransition

      // Convert data URL to blob
      let blob: Blob
      if (dataUrl.startsWith('data:image/svg+xml;base64,')) {
        // Base64 encoded
        const svgString = atob(dataUrl.split(',')[1])
        blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      } else if (dataUrl.startsWith('data:image/svg+xml,')) {
        // URL encoded
        const svgString = decodeURIComponent(dataUrl.split(',')[1])
        blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      } else {
        // Fallback: try to fetch the data URL
        const response = await fetch(dataUrl)
        blob = await response.blob()
      }
      
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

        {/* Refresh Schema */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={loadCDMSchema}
              disabled={loading}
              className={`rounded-md border bg-background p-2 shadow-sm hover:bg-muted ${
                loading ? 'opacity-50 cursor-wait' : ''
              }`}
              aria-label="Refresh schema"
            >
              <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md"
              sideOffset={5}
            >
              Refresh schema from GitHub
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

      {/* Stats and Schema Info */}
      {graph && (
        <div className="ml-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{graph.nodes.length} entities</span>
          <span>{graph.edges.length} relationships</span>
          {graph.metadata?.source && (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
                  <span className={`w-2 h-2 rounded-full ${
                    graph.metadata.source === 'remote' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-xs">
                    {graph.metadata.source === 'remote' ? 'Live' : 'Local'} Schema
                  </span>
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-50 max-w-xs rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-md"
                  sideOffset={5}
                >
                  <div className="space-y-1">
                    <div><strong>Source:</strong> {graph.metadata.source === 'remote' ? 'GitHub Repository' : 'Local Files'}</div>
                    <div><strong>Version:</strong> {graph.metadata.source === 'remote' ? 'latest' : 'v0.0.1'}</div>
                    <div><strong>Last Updated:</strong> {new Date(graph.metadata.lastUpdated).toLocaleDateString()}</div>
                    {graph.metadata.commit && graph.metadata.commit !== 'local' && (
                      <div><strong>Commit:</strong> {graph.metadata.commit}</div>
                    )}
                  </div>
                  <Tooltip.Arrow className="fill-foreground" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}
        </div>
      )}
    </div>
  )
}