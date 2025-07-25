// CDM Schema Types

export interface CDMSchema {
  id: string
  name: string
  description: string
  version: string
  classes: Record<string, CDMClass>
  slots: Record<string, CDMSlot>
  enums?: Record<string, CDMEnum>
}

export interface CDMClass {
  name: string
  description?: string
  is_a?: string
  aliases?: string[]
  slots?: string[]
  slot_usage?: Record<string, SlotUsage>
  attributes?: Record<string, CDMAttribute>
  represents_relationship?: boolean
}

export interface CDMSlot {
  name: string
  description?: string
  range?: string
  required?: boolean
  multivalued?: boolean
  identifier?: boolean
  pattern?: string
}

export interface SlotUsage {
  description?: string
  required?: boolean
  multivalued?: boolean
  identifier?: boolean
  range?: string
}

export interface CDMAttribute {
  description?: string
  range?: string
  required?: boolean
  multivalued?: boolean
  pattern?: string
}

export interface CDMEnum {
  name: string
  description?: string
  permissible_values: Record<string, PermissibleValue>
}

export interface PermissibleValue {
  description?: string
  meaning?: string
}

// Entity types for classification
export type EntityType = 'core' | 'relationship' | 'metadata' | 'experimental' | 'enum'

export interface EntityClassification {
  type: EntityType
  domain?: string
  priority?: number
}