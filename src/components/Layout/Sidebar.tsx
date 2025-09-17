import { useState } from 'react'
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useReactFlow } from 'reactflow'
import { useViewStore } from '@/store/viewStore'
import { useSchemaStore } from '@/store/schemaStore'
import clsx from 'clsx'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const graph = useSchemaStore((state) => state.graph)
  const { fitView } = useReactFlow()
  const {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    toggleEntityType,
    showRelationships,
    toggleRelationships,
    clearFilters,
    selectNode,
    setFocusedNode,
  } = useViewStore()

  if (!graph) return null

  const entityTypes = [
    { id: 'core', label: 'Core Entities', color: 'bg-entity-core' },
    { id: 'relationship', label: 'Relationships', color: 'bg-entity-relationship' },
    { id: 'metadata', label: 'Metadata', color: 'bg-entity-metadata' },
    { id: 'experimental', label: 'Experimental', color: 'bg-entity-experimental' },
    { id: 'enum', label: 'Enumerations', color: 'bg-entity-enum' },
  ]

  const filteredNodes = graph.nodes.filter((node) => {
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

  return (
    <div
      className={clsx(
        'relative flex h-full flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-12' : 'w-80'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 z-10 rounded-full border bg-background p-1 shadow-sm hover:bg-muted"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>

      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="border-b p-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border bg-background py-2 pl-10 pr-10 text-sm outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="border-b p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <FiFilter size={14} />
                Filters
              </h3>
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {entityTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.id as any)}
                    onChange={() => toggleEntityType(type.id)}
                    className="rounded"
                  />
                  <span className={clsx('h-3 w-3 rounded', type.color)} />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showRelationships}
                  onChange={toggleRelationships}
                  className="rounded"
                />
                <span>Show connections</span>
              </label>
            </div>
          </div>

          {/* Entity List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Entities ({filteredNodes.length}/{graph.nodes.length})
              </h3>
            </div>

            <div className="space-y-2">
              {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  className="cursor-pointer rounded-md border p-2 text-sm hover:bg-muted"
                  onClick={() => {
                    // Select and focus on the node
                    selectNode(node.id)
                    setFocusedNode(node.id)

                    // Focus on the node in the canvas
                    fitView({
                      nodes: [{ id: node.id }],
                      duration: 800,
                      padding: 0.3,
                    })
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'h-2 w-2 rounded-full',
                        {
                          'bg-entity-core': node.data.type === 'core',
                          'bg-entity-relationship': node.data.type === 'relationship',
                          'bg-entity-metadata': node.data.type === 'metadata',
                          'bg-entity-experimental': node.data.type === 'experimental',
                          'bg-entity-enum': node.data.type === 'enum',
                        }
                      )}
                    />
                    <span className="font-medium">{node.data.label}</span>
                  </div>
                  {node.data.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {node.data.description}
                    </p>
                  )}
                  <div className="mt-1 text-xs text-muted-foreground">
                    {node.data.attributes.length} attributes
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}