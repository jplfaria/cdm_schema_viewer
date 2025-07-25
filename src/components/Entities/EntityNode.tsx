import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { EntityNodeData } from '@/types/graph'
import { useViewStore } from '@/store/viewStore'
import clsx from 'clsx'

const EntityNode = memo(({ data, selected }: NodeProps<EntityNodeData>) => {
  const { fontSize } = useViewStore()

  const sizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }

  // Sort attributes: identifiers first, then required, then optional
  const sortedAttributes = [...data.attributes].sort((a, b) => {
    if (a.isIdentifier && !b.isIdentifier) return -1
    if (!a.isIdentifier && b.isIdentifier) return 1
    if (a.required && !b.required) return -1
    if (!a.required && b.required) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div
        className={clsx(
          'min-w-[250px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-sm',
          sizeClasses[fontSize],
          selected && 'ring-2 ring-blue-500',
          'font-mono'
        )}
      >
        {/* Table Header */}
        <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 px-3 py-2">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{data.label}</h3>
        </div>

        {/* Table Columns */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedAttributes.map((attr) => (
            <div
              key={attr.name}
              className="flex items-center px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              {/* Column Name with Key Indicators */}
              <div className="flex items-center gap-2 flex-1">
                {attr.isIdentifier && (
                  <span className="text-xs font-bold text-yellow-600">PK</span>
                )}
                {/* Check if this attribute is a foreign key (ends with _id or contains fk_) */}
                {(attr.name.endsWith('_id') || attr.name.includes('fk_')) && !attr.isIdentifier && (
                  <span className="text-xs font-bold text-blue-600">FK</span>
                )}
                <span className={clsx(
                  attr.required ? 'font-semibold' : 'font-normal',
                  attr.isIdentifier && 'underline',
                  'text-gray-900 dark:text-gray-100'
                )}>
                  {attr.name}
                </span>
              </div>
              
              {/* Data Type */}
              <div className="text-right">
                <span className="text-gray-600 dark:text-gray-400">
                  {attr.type.toLowerCase()}
                  {attr.isMultivalued && '[]'}
                  {!attr.required && '?'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </>
  )
})

EntityNode.displayName = 'EntityNode'

export default EntityNode