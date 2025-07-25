import { FiGrid, FiMap, FiMaximize, FiLayers, FiDownload } from 'react-icons/fi'
import { useReactFlow } from 'reactflow'
import { useViewStore } from '@/store/viewStore'
import { useSchemaStore } from '@/store/schemaStore'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'

export default function CanvasControls() {
  const { fitView } = useReactFlow()
  const graph = useSchemaStore((state) => state.graph)
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
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm hover:bg-muted"
              aria-label="Export"
            >
              <FiDownload size={16} />
              <span>Export</span>
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
                onClick={() => {/* TODO: Implement PNG export */}}
              >
                PNG Image
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
                onClick={() => {/* TODO: Implement SVG export */}}
              >
                SVG Vector
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-muted"
                onClick={() => {/* TODO: Implement JSON export */}}
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