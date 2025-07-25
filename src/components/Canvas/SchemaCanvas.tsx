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
  const { showMinimap, showGrid, mode } = useViewStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { applyLayout, applyGridLayout, applyDomainLayout } = useLayoutEngine()

  // Initialize nodes and edges from graph
  useEffect(() => {
    if (graph) {
      // Apply layout based on view mode
      let layoutedNodes: EntityNodeType[]
      
      switch (mode) {
        case 'domain':
          layoutedNodes = applyDomainLayout(graph.nodes, graph.edges)
          break
        case 'detailed':
        case 'compact':
          layoutedNodes = applyLayout(graph.nodes, graph.edges, 'TB')
          break
        case 'overview':
        default:
          // Use grid layout for better space utilization
          layoutedNodes = applyGridLayout(graph.nodes, graph.edges)
          break
      }
      
      setNodes(layoutedNodes)
      setEdges(graph.edges)
    }
  }, [graph, mode, setNodes, setEdges, applyLayout, applyGridLayout, applyDomainLayout])

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const { toggleNodeExpanded } = useSchemaStore.getState()
    toggleNodeExpanded(node.id)
  }, [])

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
        onNodeDoubleClick={onNodeDoubleClick}
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