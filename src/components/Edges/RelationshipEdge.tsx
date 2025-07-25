import { FC } from 'react'
import { EdgeProps, getStraightPath, EdgeLabelRenderer, BaseEdge } from 'reactflow'
import { RelationshipEdgeData } from '@/types/graph'

const RelationshipEdge: FC<EdgeProps<RelationshipEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
  style,
}) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  // Define crow's foot notation markers based on cardinality
  const getMarkerEnd = () => {
    switch (data?.cardinality) {
      case 'one-to-many':
        return 'url(#crow-foot-many)'
      case 'many-to-many':
        return 'url(#crow-foot-many)'
      case 'one-to-one':
        return 'url(#crow-foot-one)'
      default:
        return markerEnd
    }
  }

  const getMarkerStart = () => {
    switch (data?.cardinality) {
      case 'many-to-many':
        return 'url(#crow-foot-many)'
      case 'one-to-many':
        return 'url(#crow-foot-one)'
      case 'one-to-one':
        return 'url(#crow-foot-one)'
      default:
        return undefined
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={getMarkerEnd()}
        markerStart={getMarkerStart()}
        style={{
          ...style,
          strokeWidth: 1.5,
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-white dark:bg-gray-800 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-sm text-xs font-mono text-gray-700 dark:text-gray-300"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default RelationshipEdge