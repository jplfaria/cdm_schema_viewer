# CDM Schema Viewer Analysis Report

## Executive Summary

After thorough analysis of the CDM Schema Viewer exports and original LinkML schema, I've identified several critical issues:

1. **Entity Count Discrepancy**: The export shows 40 nodes, but the actual CDM schema contains 48 classes (24 in cdm_schema.yaml + 24 in cdm_components.yaml)
2. **Missing Edges**: Only 21 edges are shown, but there should be many more relationships
3. **Connection Accumulation**: The issue appears to be related to how foreign key relationships are detected and rendered

## Detailed Analysis

### 1. Entity Count Issues

#### Classes in CDM Schema (Total: 48)

**From cdm_components.yaml (24 classes):**
- Core entities: Association, Cluster, ClusterMember, Contig, ContigCollection, Contributor, DataSource, EncodedFeature, Event, Experiment, Feature, GoldEnvironmentalContext, MixsEnvironmentalContext, Project, Protein, Protocol, ProtocolParticipant, Publication, Sample, Sequence

**From cdm_schema.yaml (17 relationship classes + 3 special classes):**
- Relationship classes (17): Association_X_Publication, Association_X_SupportingObject, Contig_X_ContigCollection, Contig_X_EncodedFeature, Contig_X_Feature, Contig_X_Protein, ContigCollection_X_EncodedFeature, ContigCollection_X_Feature, ContigCollection_X_Protein, Contributor_X_Role_X_Experiment, Contributor_X_Role_X_Project, EncodedFeature_X_Feature, Entity_X_Measurement, Experiment_X_Project, Experiment_X_Sample, Feature_X_Protein, Protocol_X_ProtocolParticipant
- Special classes (3): NamedEntity, IdentifiedEntity, AttributeValueEntity

**From cdm_base.yaml (Abstract classes - excluded):**
- Table, Any, Entity, Identifier, Name (properly excluded as abstract base classes)

**Missing Entities (8):**
The parser is correctly excluding abstract base classes but is missing 8 entities from the total count.

### 2. Relationship Detection Issues

#### Current Detection Logic Problems:

1. **Overly Simplistic Foreign Key Detection**
   - Only looks for slots ending with `_id`
   - Doesn't utilize LinkML's `range` information
   - Misses relationships defined through slot_usage

2. **Junction Table Handling**
   - The parser identifies junction tables but doesn't properly create edges for all relationships
   - Many-to-many relationships through junction tables are not fully represented

3. **Missing Relationship Types**
   - Inheritance relationships (is_a) are partially handled
   - Composition relationships not detected
   - Optional relationships not distinguished

### 3. Connection Accumulation Issue

#### Root Cause:
The "connections accumulate to single spot" issue is likely caused by:

1. **Edge Routing**: All edges use 'straight' type, causing overlapping when multiple relationships connect to the same node
2. **No Edge Bundling**: Multiple edges between the same nodes are rendered separately without bundling
3. **Layout Algorithm**: The dagre layout doesn't optimize for edge separation

### 4. Specific Issues in the Export

#### Sample Export Analysis:
- Only shows 5 nodes (ContigCollection, Contig, Feature, Protein, Contig_X_ContigCollection)
- Only 3 edges shown
- Missing many core entities and relationships

## Recommendations

### High Priority Fixes:

1. **Fix Entity Detection**
   ```typescript
   // In schemaParser.ts, ensure all YAML files are parsed
   // Currently only parsing classes from main schema file
   ```

2. **Improve Relationship Detection**
   ```typescript
   // Use LinkML slot ranges to detect relationships
   // Check slot.range for references to other classes
   // Parse slot_usage for relationship cardinality
   ```

3. **Fix Edge Rendering**
   ```typescript
   // Implement orthogonal edge routing
   // Add edge bundling for multiple connections
   // Use different anchor points on nodes
   ```

### Medium Priority:

1. **Enhanced Layout Algorithm**
   - Implement force-directed layout for better edge separation
   - Add node anchoring points for different relationship types
   - Group related entities closer together

2. **Complete Schema Loading**
   - Ensure all LinkML files are loaded (cdm_schema.yaml, cdm_components.yaml, etc.)
   - Handle imports properly
   - Merge classes from all files

### Low Priority:

1. **Visual Improvements**
   - Add relationship type indicators
   - Color-code different edge types
   - Implement edge labels with better positioning

## Conclusion

The CDM Schema Viewer has significant issues with:
1. Incomplete schema loading (missing 8 entities)
2. Poor relationship detection (missing many edges)
3. Edge rendering causing visual accumulation

These issues need to be addressed to accurately represent the CDM schema structure.