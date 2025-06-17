/* eslint-disable no-console */
import fetch from 'node-fetch';
import * as vscode from 'vscode';

interface Role {
  name: string;
  display_name?: string;
  description?: string;
}

interface Topic {
  name: string;
  description?: string;
  environment?: string;
}

interface ConsumerGroup {
  name: string;
  description?: string;
  environment?: string;
}

interface Schema {
  name: string;
  description?: string;
  environment?: string;
}

interface RolesApiResponse {
  data?: {
    items?: Role[];
  };
}

const output = vscode.window.createOutputChannel('Lenses');

// LRN patterns for different resource types
const LRN_PATTERNS = {
  TOPIC: 'kafka:topic:',
  CONSUMER_GROUP: 'kafka:consumer-group:',
  ACL: 'kafka:acl:',
  SCHEMA: 'schemas:schema:',
} as const;

function getResourceType(input: string): string | undefined {
  if (input.startsWith(LRN_PATTERNS.TOPIC)) return 'topic';
  if (input.startsWith(LRN_PATTERNS.CONSUMER_GROUP)) return 'consumer-group';
  if (input.startsWith(LRN_PATTERNS.ACL)) return 'acl';
  if (input.startsWith(LRN_PATTERNS.SCHEMA)) return 'schema';
  return undefined;
}

function formatLRN(type: string, name: string, environment?: string): string {
  const pattern = (LRN_PATTERNS as any)[type.toUpperCase()];
  if (!pattern) return name;
  
  if (environment) {
    // Insert environment after the resource type
    const parts = name.split('/');
    if (parts.length > 1) {
      return `${pattern}${environment}/${parts.slice(1).join('/')}`;
    }
    return `${pattern}${environment}/${name}`;
  }
  
  return `${pattern}${name}`;
}

function createWildcardVariants(name: string): string[] {
  const parts = name.split('/');
  const variants: string[] = [];
  
  // Add full name
  variants.push(name);
  
  // Add wildcard variants
  if (parts.length > 1) {
    // Replace last part with wildcard
    variants.push(`${parts.slice(0, -1).join('/')}/*`);
    // Replace all parts after environment with wildcard
    if (parts.length > 2) {
      variants.push(`${parts[0]}/${parts[1]}/*`);
    }
  }
  
  return variants;
}

export function activate(context: vscode.ExtensionContext) {
  output.appendLine('[Lenses] Extension activated');
  output.show();

  const provider = vscode.languages.registerCompletionItemProvider(
    'yaml',
    {
      async provideCompletionItems(document, position) {
        const line = document.lineAt(position.line).text;
        
        // Check if we're in an array context (line starts with - or is after a line with :)
        const trimmedLine = line.trim();
        const dashMatch = line.match(/^(\s*-\s*)/);
        const isArrayItem = dashMatch !== null;
        const lineBeforeCursor = line.substring(0, position.character).trim();
        
        // Get the text already typed in the current line
        const currentInput = isArrayItem 
          ? line.substring(dashMatch[0].length, position.character).trim()
          : lineBeforeCursor;
        
        // If we're not at the start of an array item or after a colon, don't provide completions
        if (!isArrayItem && !lineBeforeCursor.endsWith(':')) {
          return undefined;
        }

        // Find the parent field by looking up until we find a line with less indentation
        let parentField = '';
        let parentIndentation = -1;
        let currentIndentation = line.match(/^\s*/)?.[0].length ?? 0;

        for (let i = position.line - 1; i >= 0; i--) {
          const previousLine = document.lineAt(i).text;
          const indentMatch = previousLine.match(/^(\s*)\S/);
          if (!indentMatch) continue;

          const indent = indentMatch[1].length;
          const content = previousLine.trim();

          // Skip empty lines and array items
          if (!content || content.startsWith('-')) continue;

          // If this line has less indentation than our array item
          if (indent < currentIndentation) {
            // Extract the field name (remove trailing colon)
            const fieldMatch = content.match(/^([^:]+):/);
            if (fieldMatch) {
              parentField = fieldMatch[1].trim();
              parentIndentation = indent;
              break;
            }
          }
        }

        output.appendLine(`[DEBUG] Parent field: ${parentField}, Current input: ${currentInput}`);

        // Check if we're in a resource context
        const isResource = /^resource[s]?$/i.test(parentField);
        if (isResource) {
          try {
            const config = vscode.workspace.getConfiguration();
            const token = config.get<string>('lenses.apiToken', '');
            const baseUrl = config.get<string>('lenses.baseUrl', 'http://localhost:9991');
            const headers: Record<string, string> = {};
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }

            // Determine which resource type to fetch based on what's been typed
            const resourceType = getResourceType(currentInput);
            let items: any[] = [];
            let resourcePattern = '';

            if (!resourceType || resourceType === 'topic') {
              // Fetch topics
              const topicsRes = await fetch(`${baseUrl}/api/v1/topics`, { headers });
              if (!topicsRes.ok) {
                throw new Error(`Failed to fetch topics: ${topicsRes.status} ${topicsRes.statusText}`);
              }
              const topicsData = await topicsRes.json();
              items = (topicsData as any)?.items || [];
              resourcePattern = LRN_PATTERNS.TOPIC;
            } else if (resourceType === 'consumer-group') {
              // Fetch consumer groups
              const groupsRes = await fetch(`${baseUrl}/api/v1/consumer-groups`, { headers });
              if (!groupsRes.ok) {
                throw new Error(`Failed to fetch consumer groups: ${groupsRes.status} ${groupsRes.statusText}`);
              }
              const groupsData = await groupsRes.json();
              items = (groupsData as any)?.items || [];
              resourcePattern = LRN_PATTERNS.CONSUMER_GROUP;
            } else if (resourceType === 'schema') {
              // Fetch schemas
              const schemasRes = await fetch(`${baseUrl}/api/v1/schemas`, { headers });
              if (!schemasRes.ok) {
                throw new Error(`Failed to fetch schemas: ${schemasRes.status} ${schemasRes.statusText}`);
              }
              const schemasData = await schemasRes.json();
              items = (schemasData as any)?.items || [];
              resourcePattern = LRN_PATTERNS.SCHEMA;
            }

            // Filter items based on what's been typed
            const filteredItems = items.filter(item => {
              const lrn = formatLRN(resourceType || 'topic', item.name, item.environment);
              return !currentInput || lrn.toLowerCase().includes(currentInput.toLowerCase());
            });

            // Create completion items including wildcards
            const completionItems = filteredItems.flatMap(item => {
              const variants = createWildcardVariants(item.name);
              return variants.map(variant => {
                const lrn = formatLRN(resourceType || 'topic', variant, item.environment);
                const item2 = new vscode.CompletionItem(lrn, vscode.CompletionItemKind.Value);
                item2.detail = item.description || 'No description available';
                item2.documentation = new vscode.MarkdownString()
                  .appendCodeblock(lrn, 'typescript')
                  .appendMarkdown('\n\n')
                  .appendMarkdown(item.description || 'No description available');
                
                if (!isArrayItem) {
                  item2.insertText = `- ${lrn}`;
                } else {
                  // Keep any existing whitespace after the dash
                  const existingPrefix = dashMatch ? dashMatch[1] : '';
                  item2.range = new vscode.Range(
                    position.line,
                    existingPrefix.length,
                    position.line,
                    line.length
                  );
                  item2.insertText = lrn;
                }
                return item2;
              });
            });

            // Add resource type starters if we're at the beginning
            if (!currentInput) {
              const starters = Object.values(LRN_PATTERNS).map(pattern => {
                const item = new vscode.CompletionItem(pattern, vscode.CompletionItemKind.Snippet);
                item.detail = `Start ${pattern} resource name`;
                if (!isArrayItem) {
                  item.insertText = `- ${pattern}`;
                } else {
                  const existingPrefix = dashMatch ? dashMatch[1] : '';
                  item.range = new vscode.Range(
                    position.line,
                    existingPrefix.length,
                    position.line,
                    line.length
                  );
                  item.insertText = pattern;
                }
                return item;
              });
              completionItems.push(...starters);
            }

            return completionItems;
          } catch (err: any) {
            const msg = `[Lenses] Error fetching resources: ${err?.message || err}`;
            vscode.window.showErrorMessage(msg);
            output.appendLine(msg);
            output.show();
            return undefined;
          }
        }

        // Map parent field to entity type for non-resource fields
        let entityType: 'roles' | 'users' | 'groups' | 'service_accounts' | 'environments' | 'users_and_service_accounts' | undefined = undefined;
        
        if (/^members?$/i.test(parentField)) entityType = 'users_and_service_accounts';
        else if (/^service_accounts?$/i.test(parentField)) entityType = 'service_accounts';
        else if (/^roles?$/i.test(parentField)) entityType = 'roles';
        else if (/^groups?$/i.test(parentField)) entityType = 'groups';
        else if (/^users?$/i.test(parentField)) entityType = 'users';
        else if (/^environments?$/i.test(parentField)) entityType = 'environments';
        
        if (!entityType) {
          output.appendLine('[DEBUG] No entityType detected, returning undefined.');
          return undefined;
        }

        output.appendLine(`[DEBUG] Detected entityType: ${entityType}`);
        try {
          const config = vscode.workspace.getConfiguration();
          const token = config.get<string>('lenses.apiToken', '');
          const baseUrl = config.get<string>('lenses.baseUrl', 'http://localhost:9991');
          const headers: Record<string, string> = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          let url = '';
          if (entityType === 'roles') {
            url = `${baseUrl}/api/v1/roles`;
          } else if (entityType === 'users') {
            url = `${baseUrl}/api/v1/users`;
          } else if (entityType === 'groups') {
            url = `${baseUrl}/api/v1/groups`;
          } else if (entityType === 'service_accounts') {
            url = `${baseUrl}/api/v1/service-accounts`;
          } else if (entityType === 'environments') {
            url = `${baseUrl}/api/v1/environments`;
          }
          if (entityType === 'users_and_service_accounts') {
            // Fetch users
            const usersRes = await fetch(`${baseUrl}/api/v1/users`, { headers });
            const usersData = await usersRes.json();
            const users = (usersData as any)?.items || [];
            // Fetch service accounts
            const saRes = await fetch(`${baseUrl}/api/v1/service-accounts`, { headers });
            const saData = await saRes.json();
            const serviceAccounts = (saData as any)?.items || [];
            const items = [...users, ...serviceAccounts];
            output.appendLine(`[DEBUG] API response items (users + service accounts): ${items.length}`);
            return items.map((entity) => {
              const item = new vscode.CompletionItem(entity.name, vscode.CompletionItemKind.Value);
              item.detail = entity.display_name || 'No display name available';
              item.documentation = entity.description || entity.display_name || 'No description available';
              if (!isArrayItem) {
                item.insertText = `- ${entity.name}`;
              } else {
                // Keep any existing whitespace after the dash
                const existingPrefix = dashMatch ? dashMatch[1] : '';
                item.range = new vscode.Range(
                  position.line,
                  existingPrefix.length,
                  position.line,
                  line.length
                );
                item.insertText = entity.name;
              }
              return item;
            });
          }
          // Default fetch for other entity types
          const res = await fetch(url, { headers });
          if (!res.ok) {
            const msg = `[Lenses] Failed to fetch ${entityType}: ${res.status} ${res.statusText}`;
            vscode.window.showErrorMessage(msg);
            output.appendLine(msg);
            output.show();
            return undefined;
          }
          const data = await res.json();
          const items = (data as any)?.items || (data as any)?.data?.items;
          output.appendLine(`[DEBUG] API response items: ${Array.isArray(items) ? items.length : 'not an array'}`);
          if (!Array.isArray(items)) {
            const msg = `[Lenses] No ${entityType} found in API response.`;
            vscode.window.showErrorMessage(msg);
            output.appendLine(msg);
            output.show();
            return undefined;
          }
          return items.map((entity) => {
            const item = new vscode.CompletionItem(entity.name, vscode.CompletionItemKind.Value);
            item.detail = entity.display_name || 'No display name available';
            item.documentation = entity.description || entity.display_name || 'No description available';
            if (!isArrayItem) {
              item.insertText = `- ${entity.name}`;
            } else {
              // Keep any existing whitespace after the dash
              const existingPrefix = dashMatch ? dashMatch[1] : '';
              item.range = new vscode.Range(
                position.line,
                existingPrefix.length,
                position.line,
                line.length
              );
              item.insertText = entity.name;
            }
            return item;
          });
        } catch (err: any) {
          const msg = `[Lenses] Error fetching ${entityType}: ${err?.message || err}`;
          vscode.window.showErrorMessage(msg);
          output.appendLine(msg);
          output.show();
          return undefined;
        }
      },
    },
    '-', // Trigger on dash
    ' ', // Also trigger on space for array items
    ':' // Trigger on colon for resource type completion
  );

  context.subscriptions.push(provider);
}

export function deactivate() {
  output.dispose();
}
