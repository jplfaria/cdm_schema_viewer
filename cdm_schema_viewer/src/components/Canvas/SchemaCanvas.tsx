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
  BackgroundVariant,
} from 'reactflow'
import { useSchemaStore } from '@/store/schemaStore'
import { useViewStore } from '@/store/viewStore'
import EntityNode from '@/components/Entities/EntityNode'
import { useLayoutEngine } from '@/hooks/useLayoutEngine'
import CanvasControls from './CanvasControls'

const nodeTypes: NodeTypes = {
  default: EntityNode,
}

export default function SchemaCanvas() {
  const graph = useSchemaStore((state) => state.graph)
  const { showMinimap, showGrid } = useViewStore()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { applyLayout } = useLayoutEngine()

  // Initialize nodes and edges from graph
  useEffect(() => {
    if (graph) {
      // Apply initial layout
      const layoutedNodes = applyLayout(graph.nodes, graph.edges)
      setNodes(layoutedNodes)
      setEdges(graph.edges)
    }
  }, [graph, setNodes, setEdges, applyLayout])

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
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
      >
        {showGrid && (
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            className="bg-muted/20"
          />
        )}
        
        <Controls position="bottom-right" />
        
        {showMinimap && (
          <MiniMap
            position="top-right"
            nodeColor={(node) => {
              const colors = {
                core: '#3B82F6',
                relationship: '#10B981',
                metadata: '#F59E0B',
                experimental: '#8B5CF6',
                enum: '#6B7280',
              }
              return colors[node.data?.type as keyof typeof colors] || '#6B7280'
            }}
            nodeStrokeWidth={3}
            pannable
            zoomable
          />
        )}
      </ReactFlow>
      
      <CanvasControls />
    </div>
  )
}