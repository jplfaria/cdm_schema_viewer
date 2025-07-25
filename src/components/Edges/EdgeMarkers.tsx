import { FC } from 'react'

const EdgeMarkers: FC = () => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* One relationship marker (single line) */}
        <marker
          id="crow-foot-one"
          markerWidth="20"
          markerHeight="20"
          refX="0"
          refY="10"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0,10 L 10,10"
            className="stroke-gray-700 dark:stroke-gray-300"
            strokeWidth="1.5"
            fill="none"
          />
        </marker>

        {/* Many relationship marker (crow's foot) */}
        <marker
          id="crow-foot-many"
          markerWidth="20"
          markerHeight="20"
          refX="0"
          refY="10"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0,10 L 10,10 M 10,5 L 10,15 M 10,5 L 15,10 M 10,15 L 15,10"
            className="stroke-gray-700 dark:stroke-gray-300"
            strokeWidth="1.5"
            fill="none"
          />
        </marker>

        {/* Zero or one marker (circle with line) */}
        <marker
          id="crow-foot-zero-or-one"
          markerWidth="20"
          markerHeight="20"
          refX="0"
          refY="10"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <circle
            cx="5"
            cy="10"
            r="3"
            className="stroke-gray-700 dark:stroke-gray-300"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M 8,10 L 15,10"
            className="stroke-gray-700 dark:stroke-gray-300"
            strokeWidth="1.5"
            fill="none"
          />
        </marker>

        {/* Zero or many marker (circle with crow's foot) */}
        <marker
          id="crow-foot-zero-or-many"
          markerWidth="25"
          markerHeight="20"
          refX="0"
          refY="10"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <circle
            cx="5"
            cy="10"
            r="3"
            className="stroke-gray-700 dark:stroke-gray-300"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M 8,10 L 15,10 M 15,5 L 15,15 M 15,5 L 20,10 M 15,15 L 20,10"
            className="stroke-gray-700 dark:stroke-gray-300"
            strokeWidth="1.5"
            fill="none"
          />
        </marker>
      </defs>
    </svg>
  )
}

export default EdgeMarkers