import { CDMSchema, CDMClass } from '@/types/schema'
import { SchemaGraph, EntityNode, RelationshipEdge, AttributeInfo } from '@/types/graph'
import { classifyEntityType } from '@/store/schemaStore'

export function parseSchemaToGraph(schema: CDMSchema): SchemaGraph {
  const nodes: EntityNode[] = []
  const edges: RelationshipEdge[] = []
  const nodeMap = new Map<string, EntityNode>()
  
  // First pass: Create nodes for all classes
  Object.entries(schema.classes).forEach(([className, cdmClass]) => {
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
    // Handle inheritance relationships
    if (cdmClass.is_a && nodeMap.has(cdmClass.is_a)) {
      edges.push({
        id: `${className}-inherits-${cdmClass.is_a}`,
        source: className,
        target: cdmClass.is_a,
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
        // Extract entity names from slot names
        // const sourceEntity = relationshipSlots[0].replace('_id', '')
        // const targetEntity = relationshipSlots[1].replace('_id', '')
        
        const sourceClass = findClassByIdSlot(schema, relationshipSlots[0])
        const targetClass = findClassByIdSlot(schema, relationshipSlots[1])
        
        if (sourceClass && targetClass) {
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