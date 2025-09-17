# Connection Accumulation Fix Recommendations

## Problem Statement
Connections (edges) are accumulating at single points on nodes, making the diagram difficult to read and understand relationships.

## Root Causes

1. **Single Connection Point**: All edges connect to the center of nodes
2. **Straight Line Routing**: No path optimization or edge bundling
3. **No Anchor Points**: Edges don't use different connection points based on direction

## Recommended Solutions

### 1. Implement Multiple Connection Points (Anchors)

```typescript
// In EntityNode.tsx, define connection handles
import { Handle, Position } from 'reactflow'

const EntityNode = ({ data }) => {
  return (
    <div className="entity-node">
      {/* Top handle for incoming inheritance */}
      <Handle
        type="target"
        position={Position.Top}
        id="inheritance-in"
        style={{ top: '0%' }}
      />
      
      {/* Left handles for relationships */}
      <Handle
        type="target"
        position={Position.Left}
        id="relation-in-1"
        style={{ top: '25%' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="relation-in-2"
        style={{ top: '75%' }}
      />
      
      {/* Right handles for outgoing relationships */}
      <Handle
        type="source"
        position={Position.Right}
        id="relation-out-1"
        style={{ top: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="relation-out-2"
        style={{ top: '75%' }}
      />
      
      {/* Bottom handle for outgoing inheritance */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="inheritance-out"
        style={{ bottom: '0%' }}
      />
      
      {/* Node content */}
      <div className="node-content">
        {/* ... */}
      </div>
    </div>
  )
}
```

### 2. Update Edge Creation with Specific Handles

```typescript
// In schemaParser.ts, specify source and target handles
function createEdgeWithHandles(edge: RelationshipEdge, edgeType: string) {
  const handles = getHandlesForEdgeType(edgeType)
  
  return {
    ...edge,
    sourceHandle: handles.source,
    targetHandle: handles.target,
  }
}

function getHandlesForEdgeType(edgeType: string) {
  switch (edgeType) {
    case 'inheritance':
      return { source: 'inheritance-out', target: 'inheritance-in' }
    case 'foreign-key':
      return { source: 'relation-out-1', target: 'relation-in-1' }
    case 'many-to-many':
      return { source: 'relation-out-2', target: 'relation-in-2' }
    default:
      return { source: 'relation-out-1', target: 'relation-in-1' }
  }
}
```

### 3. Implement Smart Edge Routing

```typescript
// In RelationshipEdge.tsx, use smooth step edges
import { getSmoothStepPath, getEdgeCenter } from 'reactflow'

const RelationshipEdge = (props) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    borderRadius: 8,
  })
  
  // Rest of component
}
```

### 4. Edge Bundling for Multiple Connections

```typescript
// Create an edge bundling utility
function bundleEdges(edges: RelationshipEdge[]) {
  const edgeGroups = new Map<string, RelationshipEdge[]>()
  
  // Group edges by source-target pairs
  edges.forEach(edge => {
    const key = `${edge.source}-${edge.target}`
    const reverseKey = `${edge.target}-${edge.source}`
    
    if (edgeGroups.has(key)) {
      edgeGroups.get(key)!.push(edge)
    } else if (edgeGroups.has(reverseKey)) {
      edgeGroups.get(reverseKey)!.push(edge)
    } else {
      edgeGroups.set(key, [edge])
    }
  })
  
  // Offset multiple edges between same nodes
  const bundledEdges: RelationshipEdge[] = []
  
  edgeGroups.forEach(group => {
    group.forEach((edge, index) => {
      bundledEdges.push({
        ...edge,
        data: {
          ...edge.data,
          offset: (index - (group.length - 1) / 2) * 20,
        },
      })
    })
  })
  
  return bundledEdges
}
```

### 5. Update Default Edge Options

```typescript
// In SchemaCanvas.tsx
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  pathOptions: {
    borderRadius: 8,
    offset: 10,
  },
  style: {
    strokeWidth: 1.5,
    stroke: '#64748b',
  },
}
```

### 6. Implement Edge Path Optimization

```typescript
// Add orthogonal routing for cleaner paths
function optimizeEdgePaths(nodes: EntityNode[], edges: RelationshipEdge[]) {
  // Calculate optimal paths avoiding node overlaps
  const optimizedEdges = edges.map(edge => {
    const source = nodes.find(n => n.id === edge.source)
    const target = nodes.find(n => n.id === edge.target)
    
    if (!source || !target) return edge
    
    // Determine best connection sides
    const dx = target.position.x - source.position.x
    const dy = target.position.y - source.position.y
    
    let sourcePos = Position.Right
    let targetPos = Position.Left
    
    if (Math.abs(dy) > Math.abs(dx)) {
      sourcePos = dy > 0 ? Position.Bottom : Position.Top
      targetPos = dy > 0 ? Position.Top : Position.Bottom
    }
    
    return {
      ...edge,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
    }
  })
  
  return optimizedEdges
}
```

## Implementation Priority

1. **Immediate Fix**: Switch from straight to smoothstep edges
2. **Quick Win**: Add multiple connection handles to nodes
3. **Medium Term**: Implement edge bundling
4. **Long Term**: Full orthogonal routing with obstacle avoidance

## Expected Results

- Edges will connect at different points on nodes
- Multiple relationships won't overlap
- Clearer visual distinction between relationship types
- Improved readability of complex schemas