# Lenses Agent Helm Chart Values Schema

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
    "./values.yaml.schema.json": "**/values.yaml"
    }
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

### CLI Validation

You can validate your YAML files against the schema using tools like [`ajv-cli`](https://ajv.js.org/) or [`yamale`](https://github.com/23andMe/Yamale).

**Example using ajv-cli:**

```bash
npm install -g ajv-cli
ajv validate -s values.yaml.schema.json -d values.yaml
```

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

## Contributing

1. Fork and clone the repository.
2. Make your changes to the schema, or add your own
3. Open a pull request.
