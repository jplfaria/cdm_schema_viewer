import { useCallback } from 'react'
import dagre from 'dagre'
import { EntityNode, RelationshipEdge } from '@/types/graph'

export function useLayoutEngine() {
  const applyLayout = useCallback(
    (nodes: EntityNode[], edges: RelationshipEdge[], direction = 'TB') => {
      const dagreGraph = new dagre.graphlib.Graph()
      dagreGraph.setDefaultEdgeLabel(() => ({}))
      
      const nodeWidth = 250
      const nodeHeight = 150
      
      dagreGraph.setGraph({
        rankdir: direction,
        align: 'UL',
        nodesep: 80,
        ranksep: 120,
        marginx: 50,
        marginy: 50,
      })
      
      // Add nodes to dagre
      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
      })
      
      // Add edges to dagre
      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
      })
      
      // Calculate layout
      dagre.layout(dagreGraph)
      
      // Apply calculated positions to nodes
      const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
          },
        }
      })
      
      return layoutedNodes
    },
    []
  )
  
  const applyForceLayout = useCallback((nodes: EntityNode[], edges: RelationshipEdge[]) => {
    // Simple force-directed layout implementation
    const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]))
    const iterations = 50
    const k = 100 // Ideal spring length
    const c = 0.01 // Repulsion constant
    
    for (let i = 0; i < iterations; i++) {
      // Apply repulsive forces between all nodes
      nodes.forEach((node1) => {
        nodes.forEach((node2) => {
          if (node1.id !== node2.id) {
            const dx = node2.position.x - node1.position.x
            const dy = node2.position.y - node1.position.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance > 0) {
              const force = (k * k) / distance
              const fx = (dx / distance) * force * c
              const fy = (dy / distance) * force * c
              
              const n1 = nodeMap.get(node1.id)!
              n1.position.x -= fx
              n1.position.y -= fy
            }
          }
        })
      })
      
      // Apply attractive forces along edges
      edges.forEach((edge) => {
        const source = nodeMap.get(edge.source)
        const target = nodeMap.get(edge.target)
        
        if (source && target) {
          const dx = target.position.x - source.position.x
          const dy = target.position.y - source.position.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 0) {
            const force = (distance * distance) / k
            const fx = (dx / distance) * force * 0.01
            const fy = (dy / distance) * force * 0.01
            
            source.position.x += fx
            source.position.y += fy
            target.position.x -= fx
            target.position.y -= fy
          }
        }
      })
    }
    
    return Array.from(nodeMap.values())
  }, [])
  
  const applyDomainLayout = useCallback((nodes: EntityNode[], edges: RelationshipEdge[]) => {
    // Group nodes by domain
    const domains = new Map<string, EntityNode[]>()
    
    nodes.forEach((node) => {
      const domain = node.data.domain || 'general'
      if (!domains.has(domain)) {
        domains.set(domain, [])
      }
      domains.get(domain)!.push(node)
    })
    
    // Layout each domain separately
    const domainLayouts = new Map<string, EntityNode[]>()
    let xOffset = 0
    
    domains.forEach((domainNodes, domain) => {
      // Apply hierarchical layout to each domain
      const layoutedNodes = applyLayout(domainNodes, edges.filter((e) => {
        const sourceNode = domainNodes.find((n) => n.id === e.source)
        const targetNode = domainNodes.find((n) => n.id === e.target)
        return sourceNode && targetNode
      }))
      
      // Offset each domain horizontally
      const offsetNodes = layoutedNodes.map((node) => ({
        ...node,
        position: {
          x: node.position.x + xOffset,
          y: node.position.y,
        },
      }))
      
      domainLayouts.set(domain, offsetNodes)
      
      // Calculate next offset
      const maxX = Math.max(...offsetNodes.map((n) => n.position.x)) + 300
      xOffset = maxX
    })
    
    // Combine all domain layouts
    return Array.from(domainLayouts.values()).flat()
  }, [applyLayout])
  
  const applyGridLayout = useCallback((nodes: EntityNode[], edges: RelationshipEdge[]) => {
    // First, identify which nodes have connections
    const connectedNodeIds = new Set<string>()
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source)
      connectedNodeIds.add(edge.target)
    })
    
    // Separate connected and unconnected nodes
    const connectedNodes = nodes.filter(node => connectedNodeIds.has(node.id))
    const unconnectedNodes = nodes.filter(node => !connectedNodeIds.has(node.id))
    
    // Calculate grid dimensions
    const nodeWidth = 250
    const nodeHeight = 150
    const horizontalSpacing = 120
    const verticalSpacing = 100
    
    const layoutedNodes: EntityNode[] = []
    
    // First, layout connected nodes using dagre
    if (connectedNodes.length > 0) {
      const dagreGraph = new dagre.graphlib.Graph()
      dagreGraph.setDefaultEdgeLabel(() => ({}))
      
      dagreGraph.setGraph({
        rankdir: 'TB',
        align: 'UL',
        nodesep: 80,
        ranksep: 120,
        marginx: 50,
        marginy: 50,
      })
      
      // Add connected nodes to dagre
      connectedNodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
      })
      
      // Add edges to dagre
      edges.forEach((edge) => {
        if (connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)) {
          dagreGraph.setEdge(edge.source, edge.target)
        }
      })
      
      // Calculate layout
      dagre.layout(dagreGraph)
      
      // Apply calculated positions to connected nodes
      connectedNodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        layoutedNodes.push({
          ...node,
          position: {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
          },
        })
      })
    }
    
    // Now layout unconnected nodes in a grid to the right
    if (unconnectedNodes.length > 0) {
      // Find the rightmost position of connected nodes
      const maxX = connectedNodes.length > 0 
        ? Math.max(...layoutedNodes.map(n => n.position.x + nodeWidth)) + 200
        : 0
      
      // Calculate grid for unconnected nodes
      const unconnectedColumns = Math.ceil(Math.sqrt(unconnectedNodes.length))
      
      // Group unconnected nodes by domain
      const domainGroups = new Map<string, EntityNode[]>()
      unconnectedNodes.forEach((node) => {
        const domain = node.data.domain || 'general'
        if (!domainGroups.has(domain)) {
          domainGroups.set(domain, [])
        }
        domainGroups.get(domain)!.push(node)
      })
      
      // Sort domains by node count
      const sortedDomains = Array.from(domainGroups.entries())
        .sort((a, b) => b[1].length - a[1].length)
      
      let currentIndex = 0
      
      sortedDomains.forEach(([, domainNodes]) => {
        domainNodes.forEach((node) => {
          const row = Math.floor(currentIndex / unconnectedColumns)
          const col = currentIndex % unconnectedColumns
          
          layoutedNodes.push({
            ...node,
            position: {
              x: maxX + col * (nodeWidth + horizontalSpacing),
              y: row * (nodeHeight + verticalSpacing),
            },
          })
          
          currentIndex++
        })
      })
    }
    
    return layoutedNodes
  }, [])
  
  return {
    applyLayout,
    applyForceLayout,
    applyDomainLayout,
    applyGridLayout,
  }
}