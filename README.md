# Lenses JSON Schemas

This repository contains the JSON Schema for validating `yaml` files used with in Lenses Agent.

## How to Use

### In VS Code

To enable schema validation and autocompletion in VS Code for your `yaml` files:

1. **Reference the Schema in your YAML file**

   Add the following comment at the top of your `yaml` file:
   For YAML files:

    ```yaml
    # yaml-language-server: $schema=https://raw.githubusercontent.com/lensesio/json-schemas/refs/heads/main/agent/provisioning.schema.json
    ```

    For JSON:

    ```json
    {
    "$schema": "https://raw.githubusercontent.com/lensesio/json-schemas/refs/heads/main/agent/provisioning.schema.json"
    }
    ```

2. **Associate the Schema in VS Code Settings**

    To match `values.yaml` or your file name at any depth in your folder structure, use a glob pattern like this in your VS Code settings (`settings.json`):

    ```json
    "yaml.schemas": {
      "https://raw.githubusercontent.com/lensesio/json-schemas/refs/heads/main/iam/policy.schema.json": ["**/policy.{yaml,yml}", "**/iam/**/policy.{yaml,yml}"],
      "https://raw.githubusercontent.com/lensesio/json-schemas/refs/heads/main/iam/role.schema.json": ["**/role.{yaml,yml}", "**/iam/**/role.{yaml,yml}"],
      "https://raw.githubusercontent.com/lensesio/json-schemas/refs/heads/main/iam/group.schema.json": ["**/group.{yaml,yml}", "**/iam/**/group.{yaml,yml}"],
      "https://raw.githubusercontent.com/lensesio/json-schemas/refs/heads/main/iam/user.schema.json": ["**/user.{yaml,yml}", "**/iam/**/user.{yaml,yml}"],
      "https://raw.githubusercontent.com/lensesio/json-schemas/refs/heads/main/iam/service-account.schema.json": ["**/service-account.{yaml,yml}", "**/iam/**/service-account.{yaml,yml}"]
    },
    ```

    For JSON files, use the following in your VS Code settings to associate the schema with all `values.json` files:

    ```json
    "json.schemas": [
    {
        "fileMatch": ["**/values.json"],
        "url": "./values.yaml.schema.json"
    }
    ]
    ```

   This will apply the schema to any `values.yaml` file, no matter how deeply nested it is in your project.


## Lenses Helm

- **Covers all Lenses Agent Helm values:**  
  Including image settings, persistence, resources, monitoring, RBAC, storage, SQL, and more.
- **Supports nested configuration:**  
  Such as `lensesAgent.provision.connections.provisioning` (referencing `provisioning.schema.json`).
- **Provides default values and descriptions** for most fields to help with autocompletion and documentation in your editor.

## Provisioning Schema

The `provisioning.schema.json` file defines the structure and validation rules for provisioning configuration files used by Lenses. These provisioning files describe how to connect Lenses to external systems such as Kafka clusters, Schema Registries, Zookeeper, Connect clusters, and alerting/auditing integrations (e.g., Slack, PagerDuty, Splunk, AWS, Webhook, etc).

Provisioning is subset of the Helm Values chart. Its is referenced from the Helm values schema.

### What Does the Provisioning Schema Do?

- **Validates your provisioning YAML/JSON:**  
  Ensures that all required fields are present and correctly typed for each connection type.
- **Provides autocompletion and documentation:**  
  When used in editors like VS Code, you get inline help and suggestions for all supported fields and values.
- **Supports advanced features:**  
  Such as referencing secrets, specifying authentication modes, and configuring SSL/TLS for secure connections.

### Supported Connections

- **lensesHq**: Lenses HQ agent connection
- **kafka**: Kafka clusters (including protocol, SASL, SSL, metrics, etc.)
- **zookeeper**: Zookeeper clusters
- **connect**: Kafka Connect clusters
- **confluentSchemaRegistry**: Confluent or Apicurio Schema Registry
- **glueSchemaRegistry**: AWS Glue Schema Registry (requires an `aws` connection)
- **aws**: AWS integration for alerts/audits
- **webhook, dataDog, pagerDuty, slack, splunk, alertManager**: Alerting and auditing integrations

### Tips

- Use the schema to catch errors before deploying your configuration.
- Take advantage of autocompletion in your editor for all supported fields and enums.
- See the `defaultSnippets` in the schema for ready-to-use configuration templates.

For more details, see the comments and descriptions inside `provisioning.schema.json`.

### Using Default Snippets

To quickly scaffold a new connection in your provisioning file, simply start typing the type of connection you want (for example, `kafka`, `lensesHq`, `zookeeper`, etc.) in your YAML or JSON file.  
Your editor (such as VS Code) will show relevant default snippets from the schema, allowing you to auto-complete and insert a ready-to-edit template for that connection.

> **Note:**  
> Both **Kafka** and **lensesHq** connections are required for a valid provisioning file. Make sure to include at least one of each in your configuration.

## ✅ Validation & GitHub Actions

### Automatic Validation

All schemas are automatically validated using GitHub Actions on:
- Push to main/master branches
- Pull requests
- Changes to any `.schema.json` files

The validation workflow checks:
- ✅ JSON Schema syntax validity
- ✅ YAML example files against schemas
- ✅ Format consistency (indentation, no tabs)
- ✅ JSON structure validity

### Manual Validation

#### Prerequisites

```bash
npm install
```

#### Validate All Schemas

```bash
# Validate all schema files
npm run validate-all

# Validate main provisioning schema only
npm run validate

# Validate YAML examples against schema
npm run validate-yaml

# Check JSON formatting
npm run format-check

# Run all validation checks
npm test
```

#### Individual Schema Validation

```bash
# Validate specific schema
npx ajv compile -s agent/provisioning.schema.json --spec=draft7 --verbose

# Validate YAML against schema
npx js-yaml provisioning.yaml | npx ajv validate -s agent/provisioning.schema.json --spec=draft7
```

### Badge Status

Add this badge to show validation status:

```markdown
![Schema Validation](https://github.com/lensesio/json-schemas/workflows/Validate%20JSON%20Schemas/badge.svg)
```

## Contributing

1. Fork and clone the repository.
2. Make your changes to the schema, or add your own
3. Open a pull request.
