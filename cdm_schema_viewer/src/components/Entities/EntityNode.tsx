import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { EntityNodeData } from '@/types/graph'
import { useViewStore } from '@/store/viewStore'
import clsx from 'clsx'
import { FiChevronDown, FiChevronRight, FiKey, FiList } from 'react-icons/fi'

const EntityNode = memo(({ data, selected }: NodeProps<EntityNodeData>) => {
  const { showDescriptions, fontSize, showLabels } = useViewStore()

  const colorClasses = {
    core: 'border-entity-core bg-entity-core/10',
    relationship: 'border-entity-relationship bg-entity-relationship/10',
    metadata: 'border-entity-metadata bg-entity-metadata/10',
    experimental: 'border-entity-experimental bg-entity-experimental/10',
    enum: 'border-entity-enum bg-entity-enum/10',
  }

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }

  const identifierAttributes = data.attributes.filter((attr) => attr.isIdentifier)
  const requiredAttributes = data.attributes.filter((attr) => attr.required && !attr.isIdentifier)
  const optionalAttributes = data.attributes.filter((attr) => !attr.required && !attr.isIdentifier)

  return (
    <>
      <Handle type="target" position={Position.Top} />
      
      <div
        className={clsx(
          'min-w-[200px] rounded-lg border-2 bg-background p-3 shadow-sm transition-all',
          colorClasses[data.type],
          sizeClasses[fontSize],
          selected && 'ring-2 ring-blue-500 ring-offset-2',
          'hover:shadow-md'
        )}
      >
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="hover:bg-muted rounded p-0.5">
              {data.isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            </button>
            <h3 className="font-semibold">{data.label}</h3>
          </div>
          {data.isRelationship && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">Join</span>
          )}
        </div>

        {/* Description */}
        {showDescriptions && data.description && (
          <p className="mb-2 text-xs text-muted-foreground line-clamp-2">{data.description}</p>
        )}

        {/* Domain badge */}
        {data.domain && (
          <div className="mb-2">
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
              {data.domain}
            </span>
          </div>
        )}

        {/* Attributes (when expanded) */}
        {data.isExpanded && showLabels && (
          <div className="mt-3 space-y-2 border-t pt-2">
            {/* Identifiers */}
            {identifierAttributes.length > 0 && (
              <div>
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <FiKey size={12} />
                  <span>Identifiers</span>
                </div>
                <div className="space-y-1">
                  {identifierAttributes.map((attr) => (
                    <div key={attr.name} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{attr.name}</span>
                      <span className="text-muted-foreground">{attr.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Attributes */}
            {requiredAttributes.length > 0 && (
              <div>
                <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <FiList size={12} />
                  <span>Required</span>
                </div>
                <div className="space-y-1">
                  {requiredAttributes.slice(0, 5).map((attr) => (
                    <div key={attr.name} className="flex items-center justify-between text-xs">
                      <span>{attr.name}</span>
                      <span className="text-muted-foreground">{attr.type}</span>
                    </div>
                  ))}
                  {requiredAttributes.length > 5 && (
                    <div className="text-xs text-muted-foreground">
                      +{requiredAttributes.length - 5} more...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional Attributes (collapsed by default) */}
            {optionalAttributes.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {optionalAttributes.length} optional attributes
              </div>
            )}
          </div>
        )}

        {/* Attribute count (when collapsed) */}
        {!data.isExpanded && (
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{data.attributes.length} attributes</span>
            {identifierAttributes.length > 0 && (
              <span className="flex items-center gap-1">
                <FiKey size={10} />
                {identifierAttributes.length}
              </span>
            )}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </>
  )
})

EntityNode.displayName = 'EntityNode'

export default EntityNode