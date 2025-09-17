import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  BackgroundVariant,
} from 'reactflow'
import { useSchemaStore } from '@/store/schemaStore'
import { useViewStore } from '@/store/viewStore'
import EntityNode from '@/components/Entities/EntityNode'
import RelationshipEdge from '@/components/Edges/RelationshipEdge'
import EdgeMarkers from '@/components/Edges/EdgeMarkers'
import { useLayoutEngine } from '@/hooks/useLayoutEngine'
import CanvasControls from './CanvasControls'
import type { EntityNode as EntityNodeType } from '@/types/graph'

const nodeTypes: NodeTypes = {
  default: EntityNode,
}

const edgeTypes: EdgeTypes = {
  default: RelationshipEdge,
}

export default function SchemaCanvas() {
  const graph = useSchemaStore((state) => state.graph)
  const {
    showMinimap,
    showGrid,
    mode,
    selectedTypes,
    showRelationships,
    selectedNodes,
    selectNode,
    clearSelection,
    searchQuery
  } = useViewStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { applyLayout, applyGridLayout, applyDomainLayout } = useLayoutEngine()

  // Initialize nodes and edges from graph with filters
  useEffect(() => {
    if (graph) {
      // Filter nodes based on type and search
      let filteredNodes = graph.nodes.filter((node) => {
        // Type filter
        if (!selectedTypes.includes(node.data.type)) return false

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            node.data.label.toLowerCase().includes(query) ||
            node.data.description?.toLowerCase().includes(query) ||
            node.data.attributes.some((attr) => attr.name.toLowerCase().includes(query))
          )
        }

        return true
      })

      // Filter edges based on relationship visibility and connected nodes
      let filteredEdges = showRelationships
        ? graph.edges.filter((edge) => {
            const sourceVisible = filteredNodes.some(n => n.id === edge.source)
            const targetVisible = filteredNodes.some(n => n.id === edge.target)
            return sourceVisible && targetVisible
          })
        : []

      // Apply selection styling
      const styledNodes = filteredNodes.map((node) => ({
        ...node,
        selected: selectedNodes.includes(node.id),
        data: {
          ...node.data,
          isSelected: selectedNodes.includes(node.id),
        }
      }))

      // Apply layout based on view mode
      let layoutedNodes: EntityNodeType[]

      switch (mode) {
        case 'domain':
          layoutedNodes = applyDomainLayout(styledNodes, filteredEdges)
          break
        case 'detailed':
        case 'compact':
          layoutedNodes = applyLayout(styledNodes, filteredEdges, 'TB')
          break
        case 'overview':
        default:
          // Use grid layout for better space utilization
          layoutedNodes = applyGridLayout(styledNodes, filteredEdges)
          break
      }

      setNodes(layoutedNodes)
      setEdges(filteredEdges)
    }
  }, [graph, mode, selectedTypes, showRelationships, selectedNodes, searchQuery, setNodes, setEdges, applyLayout, applyGridLayout, applyDomainLayout])

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Select node
      selectNode(node.id, event.ctrlKey || event.metaKey)
    },
    [selectNode]
  )

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const { toggleNodeExpanded } = useSchemaStore.getState()
    toggleNodeExpanded(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    // Clear selection when clicking on empty space
    clearSelection()
  }, [clearSelection])

  if (!graph) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No schema loaded</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
        }}
      >
        <EdgeMarkers />
        {showGrid && (
          <Background
            variant={BackgroundVariant.Lines}
            gap={20}
            lineWidth={0.5}
            className="stroke-gray-200 dark:stroke-gray-700"
          />
        )}
        
        <Controls position="bottom-right" />
        
        {showMinimap && (
          <MiniMap
            position="top-right"
            nodeColor={() => '#E5E7EB'}
            nodeStrokeColor={() => '#6B7280'}
            nodeStrokeWidth={1}
            pannable
            zoomable
          />
        )}
      </ReactFlow>
      
      <CanvasControls />
    </div>
  )
}