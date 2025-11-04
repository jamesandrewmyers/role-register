#!/usr/bin/env node

/**
 * OpenAPI Schema Generator for Role Register API
 * Generates OpenAPI 3.0 specification for all API endpoints
 */

const fs = require('fs');
const path = require('path');

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Role Register API',
    version: '0.1.0',
    description: 'API for capturing, processing, and managing job role data from various sources.',
    contact: {
      name: 'Role Register Project',
      url: 'https://github.com/jamesandrewmyers/role-register'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'http://localhost:3005',
      description: 'Development server (alternate port)'
    }
  ],
  paths: {
    '/api/role-listing': {
      get: {
        summary: 'Get role listing by data received ID',
        tags: ['Role Listings'],
        parameters: [
          {
            name: 'dataReceivedId',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'ID of the DataReceived record'
          }
        ],
        responses: {
          '200': {
            description: 'Role listing found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RoleListingDTO'
                }
              }
            }
          },
          '400': {
            description: 'Missing dataReceivedId parameter'
          },
          '404': {
            description: 'Role listing not found'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/role-listing/{id}': {
      get: {
        summary: 'Get role listing by ID',
        tags: ['Role Listings'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Role listing ID'
          }
        ],
        responses: {
          '200': {
            description: 'Role listing found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RoleListingDTO'
                }
              }
            }
          },
          '404': {
            description: 'Role listing not found'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/role-listing/{id}/line-items': {
      get: {
        summary: 'Get line items for a role listing',
        tags: ['Role Listings', 'Line Items'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Role listing ID'
          }
        ],
        responses: {
          '200': {
            description: 'Line items retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/RoleLineItem'
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/mappings': {
      get: {
        summary: 'List value mappings',
        tags: ['Value Mappings'],
        parameters: [
          {
            name: 'site',
            in: 'query',
            required: false,
            schema: {
              type: 'string'
            },
            description: 'Filter by site'
          },
          {
            name: 'entity',
            in: 'query',
            required: false,
            schema: {
              type: 'string'
            },
            description: 'Filter by entity'
          },
          {
            name: 'property',
            in: 'query',
            required: false,
            schema: {
              type: 'string'
            },
            description: 'Filter by property'
          }
        ],
        responses: {
          '200': {
            description: 'List of value mappings',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ValueMapping'
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error'
          }
        }
      },
      post: {
        summary: 'Create a new value mapping',
        tags: ['Value Mappings'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'valueSite',
                  'valueEntity',
                  'valueEntityProperty',
                  'cssSelector',
                  'selectorOrder'
                ],
                properties: {
                  valueSite: {
                    type: 'string',
                    description: 'Site name (e.g., "linkedin", "indeed")'
                  },
                  valueEntity: {
                    type: 'string',
                    description: 'Entity name'
                  },
                  valueEntityProperty: {
                    type: 'string',
                    description: 'Property name'
                  },
                  cssSelector: {
                    type: 'string',
                    description: 'CSS selector for the property'
                  },
                  selectorOrder: {
                    type: 'number',
                    description: 'Order of selector evaluation'
                  },
                  selectorDescription: {
                    type: 'string',
                    description: 'Optional description of the selector'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Value mapping created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValueMapping'
                }
              }
            }
          },
          '400': {
            description: 'Missing required fields'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/mappings/{id}': {
      get: {
        summary: 'Get a value mapping by ID',
        tags: ['Value Mappings'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Value mapping ID'
          }
        ],
        responses: {
          '200': {
            description: 'Value mapping found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValueMapping'
                }
              }
            }
          },
          '404': {
            description: 'Value mapping not found'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      },
      put: {
        summary: 'Update a value mapping',
        tags: ['Value Mappings'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Value mapping ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValueMapping'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Value mapping updated',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValueMapping'
                }
              }
            }
          },
          '404': {
            description: 'Value mapping not found'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      },
      delete: {
        summary: 'Delete a value mapping',
        tags: ['Value Mappings'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'Value mapping ID'
          }
        ],
        responses: {
          '200': {
            description: 'Value mapping deleted'
          },
          '404': {
            description: 'Value mapping not found'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/import': {
      post: {
        summary: 'Import job data from Chrome extension',
        tags: ['Import'],
        description: 'Receives job posting data captured by the Chrome extension and queues it for processing.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['url', 'title', 'html', 'text'],
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                    description: 'URL of the job posting'
                  },
                  title: {
                    type: 'string',
                    description: 'Job title'
                  },
                  html: {
                    type: 'string',
                    description: 'HTML content of the job posting'
                  },
                  text: {
                    type: 'string',
                    description: 'Text content of the job posting'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Data imported successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    },
                    id: {
                      type: 'string',
                      format: 'uuid',
                      description: 'DataReceived record ID'
                    },
                    eventId: {
                      type: 'string',
                      format: 'uuid',
                      description: 'Event ID for background processing'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Missing required fields'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/dashboard': {
      get: {
        summary: 'Get dashboard data',
        tags: ['Dashboard'],
        description: 'Retrieves aggregated data for the dashboard including received data, events, and role listings.',
        responses: {
          '200': {
            description: 'Dashboard data retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    dataReceived: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/DataReceivedDTO'
                      }
                    },
                    eventInfo: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/EventInfoDTO'
                      }
                    },
                    roleListings: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/RoleListingDTO'
                      }
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    }
  },
  components: {
    schemas: {
      RoleListingDTO: {
        type: 'object',
        description: 'Data transfer object for role listings',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          dataReceivedId: {
            type: 'string',
            format: 'uuid'
          },
          jobTitle: {
            type: 'string'
          },
          company: {
            type: 'string'
          },
          location: {
            type: 'string'
          },
          createdAt: {
            type: 'integer',
            format: 'int64'
          }
        }
      },
      DataReceivedDTO: {
        type: 'object',
        description: 'Data transfer object for received data',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          url: {
            type: 'string',
            format: 'uri'
          },
          title: {
            type: 'string'
          },
          processed: {
            type: 'string',
            enum: ['true', 'false']
          },
          createdAt: {
            type: 'integer',
            format: 'int64'
          }
        }
      },
      EventInfoDTO: {
        type: 'object',
        description: 'Data transfer object for event information',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          type: {
            type: 'string'
          },
          dataReceivedId: {
            type: 'string',
            format: 'uuid'
          },
          status: {
            type: 'string'
          },
          createdAt: {
            type: 'integer',
            format: 'int64'
          }
        }
      },
      ValueMapping: {
        type: 'object',
        description: 'Maps CSS selectors to entity properties',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          valueSite: {
            type: 'string',
            description: 'Site name (e.g., "linkedin", "indeed")'
          },
          valueEntity: {
            type: 'string',
            description: 'Entity name (e.g., "role", "company")'
          },
          valueEntityProperty: {
            type: 'string',
            description: 'Property name to map to'
          },
          cssSelector: {
            type: 'string',
            description: 'CSS selector to extract value'
          },
          selectorOrder: {
            type: 'number',
            description: 'Order of selector evaluation'
          },
          selectorDescription: {
            type: 'string',
            nullable: true,
            description: 'Optional description of the selector'
          },
          createdAt: {
            type: 'integer',
            format: 'int64'
          }
        }
      },
      RoleLineItem: {
        type: 'object',
        description: 'Line item in a role listing (requirement, responsibility, etc.)',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          roleListingId: {
            type: 'string',
            format: 'uuid'
          },
          type: {
            type: 'string',
            enum: ['requirement', 'responsibility', 'nice-to-have', 'benefit']
          },
          content: {
            type: 'string'
          },
          createdAt: {
            type: 'integer',
            format: 'int64'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Role Listings',
      description: 'Operations related to role listings'
    },
    {
      name: 'Value Mappings',
      description: 'Operations for managing CSS selector mappings'
    },
    {
      name: 'Import',
      description: 'Data import endpoints'
    },
    {
      name: 'Dashboard',
      description: 'Dashboard data aggregation'
    }
  ]
};

// Create output directory if it doesn't exist
const docsDir = path.join(__dirname, '../docs');
const openAPIDir = path.join(docsDir, 'openapi');

if (!fs.existsSync(openAPIDir)) {
  fs.mkdirSync(openAPIDir, { recursive: true });
}

// Write OpenAPI spec as JSON
const specPath = path.join(openAPIDir, 'openapi.json');
fs.writeFileSync(specPath, JSON.stringify(openApiSpec, null, 2));
console.log(`✓ OpenAPI specification generated at: ${specPath}`);

// Generate HTML documentation using Swagger UI
const swaggerHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Role Register API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css" >
    <style>
      html{
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *,
      *:before,
      *:after{
        box-sizing: inherit;
      }
      body{
        margin:0;
        padding: 0;
      }
      .swagger-ui .topbar {
        background-color: #1a202c;
      }
      .swagger-ui .info {
        margin: 50px 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"> </script>
    <script>
    const ui = SwaggerUIBundle({
        url: "./openapi.json",
        dom_id: '#swagger-ui',
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true
    })
    </script>
  </body>
</html>
`;

const htmlPath = path.join(openAPIDir, 'index.html');
fs.writeFileSync(htmlPath, swaggerHtml);
console.log(`✓ Swagger UI HTML generated at: ${htmlPath}`);

console.log('\nDocumentation generated successfully!');
console.log('View OpenAPI documentation at: docs/openapi/index.html');
