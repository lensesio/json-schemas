# Apache Kafka Connect Single Message Transform (SMT) Schemas

This directory contains JSON schemas for Apache Kafka Connect Single Message Transforms (SMTs). These schemas can be used to validate SMT configurations in Kafka Connect connectors.

## Available Transform Schemas

### Core Field Transforms

- **Cast** (`Cast.schema.json`) - Casts fields to different types (int8, int16, int32, int64, float32, float64, boolean, string)
- **ExtractField** (`ExtractField.schema.json`) - Extracts a field from a struct and uses it as the key or value
- **Flatten** (`Flatten.schema.json`) - Flattens nested structures by concatenating field names with a delimiter
- **ReplaceField** (`ReplaceField.schema.json`) - Renames or removes fields from records

### Routing Transforms

- **RegexRouter** (`RegexRouter.schema.json`) - Routes messages to different topics based on a regex pattern applied to the topic name
- **TimestampRouter** (`TimestampRouter.schema.json`) - Routes messages to topics with names based on the record timestamp

### Field Manipulation Transforms

- **InsertField** (`InsertField.schema.json`) - Inserts a field with a static value or metadata into records
- **MaskField** (`MaskField.schema.json`) - Masks field values with null or a replacement value
- **ValueToKey** (`ValueToKey.schema.json`) - Extracts fields from the value and uses them as the key
- **HoistField** (`HoistField.schema.json`) - Hoists a nested field to the top level of the record

### Header Transforms

- **HeaderFrom** (`HeaderFrom.schema.json`) - Copies a field from the key or value to a header
- **InsertHeader** (`InsertHeader.schema.json`) - Inserts a header with a static value or metadata
- **ReplaceHeader** (`ReplaceHeader.schema.json`) - Renames or removes headers from records
- **DropHeaders** (`DropHeaders.schema.json`) - Drops specified headers from records

### Metadata and Utility Transforms

- **SetSchemaMetadata** (`SetSchemaMetadata.schema.json`) - Sets schema name and version metadata
- **TimestampConverter** (`TimestampConverter.schema.json`) - Converts timestamps between different formats
- **Filter** (`Filter.schema.json`) - Filters records based on a predicate

## Lenses-Specific Single Message Transforms

Lenses provides additional SMTs designed for enhanced timestamp handling and partitioning, particularly useful with Stream Reactor connectors:

### Wall Clock Timestamp Transforms

- **InsertWallclock** (`InsertWallclock.schema.json`) - Inserts the current system wall clock timestamp into a field in the record value
- **InsertWallclockHeaders** (`InsertWallclockHeaders.schema.json`) - Inserts the current system wall clock timestamp into record headers
- **InsertRollingWallclock** (`InsertRollingWallclock.schema.json`) - Inserts a rolling wall clock timestamp into a field, useful for partitioning by time windows
- **InsertRollingWallclockHeaders** (`InsertRollingWallclockHeaders.schema.json`) - Inserts a rolling wall clock timestamp into record headers, useful for partitioning by time windows
- **InsertWallclockDateTimePart** (`InsertWallclockDateTimePart.schema.json`) - Inserts specific parts of the current date and time (year, month, day, hour, etc.) into record headers

### Record Timestamp Transforms

- **InsertRecordTimestampHeaders** (`InsertRecordTimestampHeaders.schema.json`) - Inserts the record's timestamp into record headers
- **InsertRollingRecordTimestampHeaders** (`InsertRollingRecordTimestampHeaders.schema.json`) - Inserts a rolling record timestamp into record headers, useful for partitioning by time windows

### Field Timestamp Transforms

- **InsertFieldTimestampHeaders** (`InsertFieldTimestampHeaders.schema.json`) - Inserts a timestamp from a field in the record value into record headers
- **InsertRollingFieldTimestampHeaders** (`InsertRollingFieldTimestampHeaders.schema.json`) - Inserts a rolling timestamp from a field into record headers, useful for partitioning by time windows

### Source Metadata Transforms

- **InsertSourcePartitionOrOffsetValue** (`InsertSourcePartitionOrOffsetValue.schema.json`) - Inserts source partition or offset information into a field in the record value

## Usage

These schemas follow the JSON Schema Draft 7 specification and can be used to validate SMT configurations. Each schema defines:

- The transformation type (with `$Key` or `$Value` variants where applicable)
- Required and optional configuration properties
- Property descriptions and types
- Default values where applicable

## Example

To use a Cast transform in a connector configuration:

```json
{
  "transforms": "castTransform",
  "transforms.castTransform.type": "org.apache.kafka.connect.transforms.Cast$Value",
  "transforms.castTransform.spec": "field1:int32,field2:float64"
}
```

## References

- [Apache Kafka Connect Documentation](https://kafka.apache.org/documentation/#connect)
- [Kafka Connect Single Message Transforms](https://kafka.apache.org/documentation/#connect_transforms)

