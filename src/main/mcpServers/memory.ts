// ── F006-T044: @angdu/memory built-in MCP server ──
// In-memory knowledge graph with entities, relations, and observations.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'

// ── Interfaces ──

interface Entity {
  name: string
  entityType: string
  observations: string[]
}

interface Relation {
  from: string
  to: string
  relationType: string
}

interface KnowledgeGraph {
  entities: Entity[]
  relations: Relation[]
}

// ── Knowledge Graph Manager (in-memory only) ──

class KnowledgeGraphManager {
  private entities: Map<string, Entity> = new Map()
  private relations: Set<string> = new Set()

  private serializeRelation(relation: Relation): string {
    return JSON.stringify({ from: relation.from, to: relation.to, relationType: relation.relationType })
  }

  private deserializeRelation(str: string): Relation {
    return JSON.parse(str) as Relation
  }

  createEntities(entities: Entity[]): Entity[] {
    const created: Entity[] = []
    for (const entity of entities) {
      if (!this.entities.has(entity.name)) {
        const newEntity = { ...entity, observations: Array.isArray(entity.observations) ? entity.observations : [] }
        this.entities.set(entity.name, newEntity)
        created.push(newEntity)
      }
    }
    return created
  }

  createRelations(relations: Relation[]): Relation[] {
    const created: Relation[] = []
    for (const relation of relations) {
      if (!this.entities.has(relation.from) || !this.entities.has(relation.to)) {
        continue // skip relations with non-existent entities
      }
      const key = this.serializeRelation(relation)
      if (!this.relations.has(key)) {
        this.relations.add(key)
        created.push(relation)
      }
    }
    return created
  }

  addObservations(
    observations: { entityName: string; contents: string[] }[]
  ): { entityName: string; addedObservations: string[] }[] {
    const results: { entityName: string; addedObservations: string[] }[] = []
    for (const o of observations) {
      const entity = this.entities.get(o.entityName)
      if (!entity) {
        throw new McpError(ErrorCode.InvalidParams, `Entity with name ${o.entityName} not found`)
      }
      if (!Array.isArray(entity.observations)) {
        entity.observations = []
      }
      const added = o.contents.filter((c) => !entity.observations.includes(c))
      entity.observations.push(...added)
      results.push({ entityName: o.entityName, addedObservations: added })
    }
    return results
  }

  deleteEntities(names: string[]): void {
    const toDelete = new Set(names)
    for (const name of toDelete) {
      this.entities.delete(name)
    }
    // Remove relations involving deleted entities
    for (const relStr of [...this.relations]) {
      const rel = this.deserializeRelation(relStr)
      if (toDelete.has(rel.from) || toDelete.has(rel.to)) {
        this.relations.delete(relStr)
      }
    }
  }

  deleteObservations(deletions: { entityName: string; observations: string[] }[]): void {
    for (const d of deletions) {
      const entity = this.entities.get(d.entityName)
      if (entity && Array.isArray(entity.observations)) {
        const toRemove = new Set(d.observations)
        entity.observations = entity.observations.filter((o) => !toRemove.has(o))
      }
    }
  }

  deleteRelations(relations: Relation[]): void {
    for (const rel of relations) {
      this.relations.delete(this.serializeRelation(rel))
    }
  }

  readGraph(): KnowledgeGraph {
    return {
      entities: Array.from(this.entities.values()),
      relations: Array.from(this.relations).map((s) => this.deserializeRelation(s))
    }
  }

  searchNodes(query: string): KnowledgeGraph {
    const q = query.toLowerCase()
    const matchedEntities = Array.from(this.entities.values()).filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.entityType.toLowerCase().includes(q) ||
        (Array.isArray(e.observations) && e.observations.some((o) => o.toLowerCase().includes(q)))
    )
    const matchedNames = new Set(matchedEntities.map((e) => e.name))
    const matchedRelations = Array.from(this.relations)
      .map((s) => this.deserializeRelation(s))
      .filter((r) => matchedNames.has(r.from) && matchedNames.has(r.to))

    return { entities: matchedEntities, relations: matchedRelations }
  }

  openNodes(names: string[]): KnowledgeGraph {
    const nameSet = new Set(names)
    const entities = Array.from(this.entities.values()).filter((e) => nameSet.has(e.name))
    const entityNames = new Set(entities.map((e) => e.name))
    const relations = Array.from(this.relations)
      .map((s) => this.deserializeRelation(s))
      .filter((r) => entityNames.has(r.from) && entityNames.has(r.to))

    return { entities, relations }
  }
}

// ── MCP Server wrapper ──

class MemoryServer {
  public server: Server
  private manager: KnowledgeGraphManager

  constructor(_envPath: string = '') {
    this.manager = new KnowledgeGraphManager()

    this.server = new Server(
      { name: 'memory-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    )

    this.setupRequestHandlers()
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_entities',
          description: 'Create multiple new entities in the knowledge graph. Skips existing entities.',
          inputSchema: {
            type: 'object',
            properties: {
              entities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'The name of the entity' },
                    entityType: { type: 'string', description: 'The type of the entity' },
                    observations: { type: 'array', items: { type: 'string' }, description: 'Observation contents', default: [] }
                  },
                  required: ['name', 'entityType']
                }
              }
            },
            required: ['entities']
          }
        },
        {
          name: 'create_relations',
          description: 'Create multiple new relations between existing entities.',
          inputSchema: {
            type: 'object',
            properties: {
              relations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    from: { type: 'string', description: 'Source entity name' },
                    to: { type: 'string', description: 'Target entity name' },
                    relationType: { type: 'string', description: 'Type of relation' }
                  },
                  required: ['from', 'to', 'relationType']
                }
              }
            },
            required: ['relations']
          }
        },
        {
          name: 'add_observations',
          description: 'Add new observations to existing entities.',
          inputSchema: {
            type: 'object',
            properties: {
              observations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    entityName: { type: 'string', description: 'Entity to add observations to' },
                    contents: { type: 'array', items: { type: 'string' }, description: 'Observation contents to add' }
                  },
                  required: ['entityName', 'contents']
                }
              }
            },
            required: ['observations']
          }
        },
        {
          name: 'delete_entities',
          description: 'Delete multiple entities and their associated relations.',
          inputSchema: {
            type: 'object',
            properties: {
              entityNames: { type: 'array', items: { type: 'string' }, description: 'Entity names to delete' }
            },
            required: ['entityNames']
          }
        },
        {
          name: 'delete_observations',
          description: 'Delete specific observations from entities.',
          inputSchema: {
            type: 'object',
            properties: {
              deletions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    entityName: { type: 'string' },
                    observations: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['entityName', 'observations']
                }
              }
            },
            required: ['deletions']
          }
        },
        {
          name: 'delete_relations',
          description: 'Delete multiple specific relations.',
          inputSchema: {
            type: 'object',
            properties: {
              relations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    from: { type: 'string' },
                    to: { type: 'string' },
                    relationType: { type: 'string' }
                  },
                  required: ['from', 'to', 'relationType']
                }
              }
            },
            required: ['relations']
          }
        },
        {
          name: 'read_graph',
          description: 'Read the entire knowledge graph.',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'search_nodes',
          description: 'Search nodes in the knowledge graph by query string.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' }
            },
            required: ['query']
          }
        },
        {
          name: 'open_nodes',
          description: 'Retrieve specific entities and their connecting relations by name.',
          inputSchema: {
            type: 'object',
            properties: {
              names: { type: 'array', items: { type: 'string' }, description: 'Entity names to retrieve' }
            },
            required: ['names']
          }
        }
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      if (!args) {
        throw new McpError(ErrorCode.InvalidParams, `No arguments provided for tool: ${name}`)
      }

      try {
        switch (name) {
          case 'create_entities':
            return { content: [{ type: 'text', text: JSON.stringify(this.manager.createEntities(args.entities as Entity[]), null, 2) }] }
          case 'create_relations':
            return { content: [{ type: 'text', text: JSON.stringify(this.manager.createRelations(args.relations as Relation[]), null, 2) }] }
          case 'add_observations':
            return { content: [{ type: 'text', text: JSON.stringify(this.manager.addObservations(args.observations as { entityName: string; contents: string[] }[]), null, 2) }] }
          case 'delete_entities':
            this.manager.deleteEntities(args.entityNames as string[])
            return { content: [{ type: 'text', text: 'Entities deleted successfully' }] }
          case 'delete_observations':
            this.manager.deleteObservations(args.deletions as { entityName: string; observations: string[] }[])
            return { content: [{ type: 'text', text: 'Observations deleted successfully' }] }
          case 'delete_relations':
            this.manager.deleteRelations(args.relations as Relation[])
            return { content: [{ type: 'text', text: 'Relations deleted successfully' }] }
          case 'read_graph':
            return { content: [{ type: 'text', text: JSON.stringify(this.manager.readGraph(), null, 2) }] }
          case 'search_nodes':
            return { content: [{ type: 'text', text: JSON.stringify(this.manager.searchNodes(args.query as string), null, 2) }] }
          case 'open_nodes':
            return { content: [{ type: 'text', text: JSON.stringify(this.manager.openNodes(args.names as string[]), null, 2) }] }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`)
        }
      } catch (error) {
        if (error instanceof McpError) throw error
        throw new McpError(ErrorCode.InternalError, `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    })
  }
}

export default MemoryServer
