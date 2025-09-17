import { CDMSchema, CDMClass } from '@/types/schema'
import { SchemaGraph, EntityNode, RelationshipEdge, AttributeInfo } from '@/types/graph'
import { classifyEntityType } from '@/store/schemaStore'

export function parseSchemaToGraph(schema: CDMSchema, options?: { hideJunctionTables?: boolean }): SchemaGraph {
  const nodes: EntityNode[] = []
  const edges: RelationshipEdge[] = []
  const nodeMap = new Map<string, EntityNode>()
  const junctionTables = new Map<string, { source: string; target: string }>()
  
  // Track handle usage for better edge distribution
  const handleUsage = new Map<string, { incoming: number; outgoing: number }>()
  
  // Initialize handle tracking
  const initHandleTracking = (nodeId: string) => {
    if (!handleUsage.has(nodeId)) {
      handleUsage.set(nodeId, { incoming: 0, outgoing: 0 })
    }
  }
  
  // Get next available handle for a node
  const getNextHandle = (nodeId: string, isSource: boolean) => {
    initHandleTracking(nodeId)
    const usage = handleUsage.get(nodeId)!
    
    if (isSource) {
      const handle = usage.outgoing % 3 === 0 ? 'bottom' : 
                    usage.outgoing % 3 === 1 ? 'right-out' : 'left-out'
      usage.outgoing++
      return handle
    } else {
      const handle = usage.incoming % 3 === 0 ? 'top' : 
                    usage.incoming % 3 === 1 ? 'left' : 'right'
      usage.incoming++
      return handle
    }
  }
  
  // Define abstract base classes to exclude from visualization
  const abstractBaseClasses = new Set([
    'Table',
    'Any',
    'AttributeValue',
    'NamedEntity',
    'IdentifiedEntity',
    'AttributeValueEntity'
  ])
  
  // First pass: Create nodes for all classes (excluding abstract base classes)
  Object.entries(schema.classes).forEach(([className, cdmClass]) => {
    // Skip abstract base classes
    if (abstractBaseClasses.has(className)) {
      return
    }
    
    const entityType = classifyEntityType(cdmClass, className)
    const attributes = extractAttributes(cdmClass, schema)
    
    const node: EntityNode = {
      id: className,
      type: 'default',
      position: { x: 0, y: 0 }, // Will be calculated by layout engine
      data: {
        label: className,
        description: cdmClass.description,
        type: entityType,
        domain: inferDomain(className, cdmClass),
        isExpanded: false,
        attributes,
        isRelationship: cdmClass.represents_relationship,
        parentClass: cdmClass.is_a,
      },
    }
    
    nodes.push(node)
    nodeMap.set(className, node)
  })
  
  // Second pass: Create edges for relationships
  Object.entries(schema.classes).forEach(([className, cdmClass]) => {
    // Skip if this class was excluded
    if (abstractBaseClasses.has(className)) {
      return
    }
    
    // Handle inheritance relationships (skip inheritance from abstract base classes)
    if (cdmClass.is_a && nodeMap.has(cdmClass.is_a) && !abstractBaseClasses.has(cdmClass.is_a)) {
      edges.push({
        id: `${className}-inherits-${cdmClass.is_a}`,
        source: className,
        target: cdmClass.is_a,
        sourceHandle: getNextHandle(className, true),
        targetHandle: getNextHandle(cdmClass.is_a, false),
        type: 'straight',
        animated: false,
        data: {
          label: 'is_a',
          cardinality: 'one-to-one',
        },
      })
    }
    
    // Handle relationship classes (join tables)
    if (cdmClass.represents_relationship && cdmClass.slots) {
      const relationshipSlots = cdmClass.slots.filter((slot) => slot.endsWith('_id'))
      
      if (relationshipSlots.length >= 2) {
        const sourceClass = findClassByIdSlot(schema, relationshipSlots[0])
        const targetClass = findClassByIdSlot(schema, relationshipSlots[1])
        
        if (sourceClass && targetClass) {
          // Check if this junction table has only foreign key attributes
          const nonIdSlots = cdmClass.slots.filter(slot => !slot.endsWith('_id'))
          const isJunctionTable = nonIdSlots.length === 0 || 
            (cdmClass.attributes && Object.keys(cdmClass.attributes).length === 0)
          
          if (options?.hideJunctionTables && isJunctionTable) {
            // Store junction table info for creating direct edges
            junctionTables.set(className, { source: sourceClass, target: targetClass })
            // Remove the junction table node
            const nodeIndex = nodes.findIndex(n => n.id === className)
            if (nodeIndex >= 0) {
              nodes.splice(nodeIndex, 1)
              nodeMap.delete(className)
            }
          } else {
            // Determine cardinality
            const sourceMultivalued = cdmClass.slot_usage?.[relationshipSlots[0]]?.multivalued
            const targetMultivalued = cdmClass.slot_usage?.[relationshipSlots[1]]?.multivalued
            
            let cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many' = 'one-to-one'
            if (sourceMultivalued && targetMultivalued) {
              cardinality = 'many-to-many'
            } else if (sourceMultivalued || targetMultivalued) {
              cardinality = 'one-to-many'
            }
            
            edges.push({
              id: `${sourceClass}-${className}-${targetClass}`,
              source: sourceClass,
              target: targetClass,
              sourceHandle: getNextHandle(sourceClass, true),
              targetHandle: getNextHandle(targetClass, false),
              type: 'straight',
              animated: false,
              data: {
                label: className,
                cardinality,
              },
            })
          }
        }
      }
    }
    
    // Handle foreign key relationships (slots ending with _id)
    if (cdmClass.slots && !cdmClass.represents_relationship) {
      cdmClass.slots.forEach((slotName) => {
        if (slotName.endsWith('_id') && !slotName.includes('self')) {
          const targetClass = findClassByIdSlot(schema, slotName)
          if (targetClass && targetClass !== className) {
            const slotUsage = cdmClass.slot_usage?.[slotName]
            const slot = schema.slots[slotName]
            const isMultivalued = slotUsage?.multivalued || slot?.multivalued
            
            edges.push({
              id: `${className}-${slotName}-${targetClass}`,
              source: className,
              target: targetClass,
              sourceHandle: getNextHandle(className, true),
              targetHandle: getNextHandle(targetClass, false),
              type: 'straight',
              animated: false,
              data: {
                label: slotName.replace('_id', ''),
                cardinality: isMultivalued ? 'one-to-many' : 'one-to-one',
              },
            })
          }
        }
      })
    }
  })
  
  // Add direct edges for hidden junction tables
  if (options?.hideJunctionTables) {
    junctionTables.forEach((junction, junctionName) => {
      if (nodeMap.has(junction.source) && nodeMap.has(junction.target)) {
        edges.push({
          id: `${junction.source}-${junctionName}-${junction.target}`,
          source: junction.source,
          target: junction.target,
          sourceHandle: getNextHandle(junction.source, true),
          targetHandle: getNextHandle(junction.target, false),
          type: 'straight',
          animated: false,
          data: {
            label: junctionName.replace(/([A-Z])/g, ' $1').trim(),
            cardinality: 'many-to-many', // Junction tables typically represent many-to-many
          },
        })
      }
    })
  }
  
  // Calculate metadata
  const domains = Array.from(new Set(nodes.map((n) => n.data.domain).filter(Boolean))) as string[]

  return {
    nodes,
    edges,
    metadata: {
      entityCount: nodes.length,
      relationshipCount: edges.length,
      domains,
      lastUpdated: new Date(),
      source: schema.metadata?.source,
      commit: schema.metadata?.commit,
    },
  }
}

// Extract attributes from a class
function extractAttributes(cdmClass: CDMClass, schema: CDMSchema): AttributeInfo[] {
  const attributes: AttributeInfo[] = []
  
  // Add slots
  if (cdmClass.slots) {
    cdmClass.slots.forEach((slotName) => {
      const slot = schema.slots[slotName]
      const slotUsage = cdmClass.slot_usage?.[slotName]
      
      if (slot) {
        attributes.push({
          name: slotName,
          type: slotUsage?.range || slot.range || 'string',
          required: slotUsage?.required || slot.required || false,
          isIdentifier: slotUsage?.identifier || slot.identifier,
          isMultivalued: slotUsage?.multivalued || slot.multivalued,
          description: slotUsage?.description || slot.description,
        })
      }
    })
  }
  
  // Add attributes
  if (cdmClass.attributes) {
    Object.entries(cdmClass.attributes).forEach(([attrName, attr]) => {
      attributes.push({
        name: attrName,
        type: attr.range || 'string',
        required: attr.required || false,
        isMultivalued: attr.multivalued,
        description: attr.description,
      })
    })
  }
  
  return attributes
}

// Infer domain from class name and properties
function inferDomain(className: string, _cdmClass: CDMClass): string {
  const name = className.toLowerCase()
  
  // Genomics domain
  if (['contig', 'feature', 'protein', 'sequence'].some((term) => name.includes(term))) {
    return 'genomics'
  }
  
  // Sample/Environmental domain
  if (['sample', 'environmental', 'gold', 'mixs'].some((term) => name.includes(term))) {
    return 'environmental'
  }
  
  // Experimental domain
  if (['experiment', 'protocol', 'event'].some((term) => name.includes(term))) {
    return 'experimental'
  }
  
  // Metadata domain
  if (['contributor', 'publication', 'project', 'datasource'].some((term) => name.includes(term))) {
    return 'metadata'
  }
  
  // Analysis domain
  if (['cluster', 'association', 'measurement'].some((term) => name.includes(term))) {
    return 'analysis'
  }
  
  return 'general'
}

// Find class that contains a specific ID slot
function findClassByIdSlot(schema: CDMSchema, slotName: string): string | null {
  // Try to infer from slot name (e.g., contig_id -> Contig)
  const entityName = slotName.replace('_id', '')
  const capitalizedName = entityName.charAt(0).toUpperCase() + entityName.slice(1)
  
  // Check if class exists
  if (schema.classes[capitalizedName]) {
    return capitalizedName
  }
  
  // Check for variations
  const variations = [
    entityName,
    capitalizedName,
    entityName.toUpperCase(),
    // Handle special cases
    entityName === 'contig_collection' ? 'ContigCollection' : null,
    entityName === 'encoded_feature' ? 'EncodedFeature' : null,
  ].filter(Boolean)
  
  for (const variation of variations) {
    if (variation && schema.classes[variation]) {
      return variation
    }
  }
  
  // Search through all classes for one that has this slot as identifier
  for (const [className, cdmClass] of Object.entries(schema.classes)) {
    if (cdmClass.slots?.includes(slotName)) {
      const slotUsage = cdmClass.slot_usage?.[slotName]
      if (slotUsage?.identifier || schema.slots[slotName]?.identifier) {
        return className
      }
    }
  }
  
  return null
}