# Role Register - Documentation Guide

This document explains the documentation system for the Role Register project and how to use it.

## Overview

Role Register uses a multi-layered documentation approach:

1. **OpenAPI/Swagger** - Interactive REST API documentation
2. **TypeDoc** - Generated HTML documentation from TypeScript source code
3. **TSDoc/JSDoc** - Inline code comments throughout the codebase

## Generating Documentation

### All Documentation

Generate all documentation at once:

```bash
npm run docs
```

This will generate both TypeDoc and OpenAPI documentation.

### OpenAPI/Swagger Documentation Only

```bash
npm run docs:openapi
```

Output: `docs/openapi/openapi.json` and `docs/openapi/index.html`

### TypeDoc Documentation Only

```bash
npm run docs:typedoc
```

Output: `docs/api/` directory with HTML files

## Accessing Documentation

### OpenAPI/Swagger Documentation

After generating:

1. Open `docs/openapi/index.html` in your browser
2. View all REST API endpoints with:
   - Request/response schemas
   - Parameter descriptions
   - Try-it-out functionality
   - Example requests and responses

### TypeDoc Documentation

After generating:

1. Open `docs/api/index.html` in your browser
2. Browse all TypeScript types, interfaces, functions, and classes
3. Navigate the documentation hierarchy:
   - Services (business logic)
   - Entities (domain models)
   - DTOs (data transfer objects)
   - Components (React components)
   - Libraries (utility functions)

## REST API Endpoints

### Role Listings

#### Get Role Listing by ID
- **Endpoint**: `GET /api/role-listing/{id}`
- **Description**: Retrieve a single role listing by its ID
- **Parameters**:
  - `id` (path): Role listing UUID
- **Returns**: RoleListingDTO or 404 error

#### Get Role Listing by DataReceived ID
- **Endpoint**: `GET /api/role-listing?dataReceivedId={id}`
- **Description**: Get the role listing associated with a captured data record
- **Parameters**:
  - `dataReceivedId` (query): DataReceived UUID (required)
- **Returns**: RoleListingDTO or 404 error

#### Get Role Listing Line Items
- **Endpoint**: `GET /api/role-listing/{id}/line-items`
- **Description**: Get all line items (requirements, responsibilities, etc.) for a role listing
- **Parameters**:
  - `id` (path): Role listing UUID
- **Returns**: Array of RoleLineItem objects

### Value Mappings

#### List Value Mappings
- **Endpoint**: `GET /api/mappings`
- **Description**: List all value mappings, optionally filtered
- **Query Parameters** (all optional):
  - `site`: Filter by site name (e.g., "linkedin", "indeed")
  - `entity`: Filter by entity type (e.g., "role", "company")
  - `property`: Filter by property name
- **Returns**: Array of ValueMapping objects

#### Create Value Mapping
- **Endpoint**: `POST /api/mappings`
- **Description**: Create a new CSS selector to property mapping
- **Request Body**:
  ```json
  {
    "valueSite": "linkedin",
    "valueEntity": "role",
    "valueEntityProperty": "title",
    "cssSelector": ".job-title",
    "selectorOrder": 1,
    "selectorDescription": "Main job title element"
  }
  ```
- **Returns**: Created ValueMapping (201 Created)

#### Get Value Mapping by ID
- **Endpoint**: `GET /api/mappings/{id}`
- **Description**: Retrieve a single value mapping by ID
- **Returns**: ValueMapping or 404 error

#### Update Value Mapping
- **Endpoint**: `PUT /api/mappings/{id}`
- **Description**: Update a value mapping
- **Request Body**: Partial UpdateRoleListingData object
- **Returns**: Updated ValueMapping or 404 error

#### Delete Value Mapping
- **Endpoint**: `DELETE /api/mappings/{id}`
- **Description**: Delete a value mapping
- **Returns**: 200 OK or 404 error

### Data Import

#### Import Job Data
- **Endpoint**: `POST /api/import`
- **Description**: Import job data from Chrome extension or external source
- **Request Body**:
  ```json
  {
    "url": "https://www.linkedin.com/jobs/view/...",
    "title": "Senior Software Engineer",
    "html": "<html>...</html>",
    "text": "Job description text..."
  }
  ```
- **Returns**:
  ```json
  {
    "success": true,
    "id": "uuid-of-data-received",
    "eventId": "uuid-of-processing-event"
  }
  ```
- **Notes**: All fields required. Triggers background processing.

### Dashboard

#### Get Dashboard Data
- **Endpoint**: `GET /api/dashboard`
- **Description**: Get aggregated dashboard data including all received data, events, and role listings
- **Returns**:
  ```json
  {
    "dataReceived": [...],
    "eventInfo": [...],
    "roleListings": [...]
  }
  ```

## Data Models

### RoleListingDTO
Represents a processed job listing.

**Properties:**
- `id` (string, UUID): Unique identifier
- `dataReceivedId` (string, UUID): Source data record ID
- `jobTitle` (string): Job title
- `company` (string): Company name
- `location` (string): Job location
- `createdAt` (number): Unix timestamp

### DataReceivedDTO
Represents raw captured job data.

**Properties:**
- `id` (string, UUID): Unique identifier
- `url` (string): Source URL
- `title` (string): Job title
- `processed` (string): "true" or "false"
- `createdAt` (number): Unix timestamp

### EventInfoDTO
Represents a processing event.

**Properties:**
- `id` (string, UUID): Unique identifier
- `type` (string): Event type (e.g., "processHtml")
- `dataReceivedId` (string, UUID): Associated data record
- `status` (string): Event status (pending, processing, completed, failed)
- `createdAt` (number): Unix timestamp

### ValueMapping
Maps CSS selectors to entity properties.

**Properties:**
- `id` (string, UUID): Unique identifier
- `valueSite` (string): Site name (linkedin, indeed, etc.)
- `valueEntity` (string): Entity type (role, company, etc.)
- `valueEntityProperty` (string): Property to map to
- `cssSelector` (string): CSS selector expression
- `selectorOrder` (number): Evaluation order
- `selectorDescription` (string, nullable): Optional description
- `createdAt` (number): Unix timestamp

### RoleLineItem
Represents a line item within a role listing (requirement, responsibility, etc.).

**Properties:**
- `id` (string, UUID): Unique identifier
- `roleListingId` (string, UUID): Associated role listing
- `type` (string): Type (requirement, responsibility, nice-to-have, benefit)
- `content` (string): Text content
- `createdAt` (number): Unix timestamp

## TypeScript Code Documentation

The codebase uses TSDoc/JSDoc comments throughout. Key areas:

### Services (src/services/)

Service functions are documented with:
- `@param` - Parameter descriptions with types
- `@returns` - Return value type and description
- `@example` - Usage examples

Example:
```typescript
/**
 * Retrieves all role listings, optionally filtered.
 *
 * @param {RoleListingFilters} [filters] - Optional filter criteria
 * @returns {RoleListing[]} Array of role listings
 *
 * @example
 * const listings = getAllRoleListings({ status: 'applied' });
 */
export function getAllRoleListings(filters?: RoleListingFilters): RoleListing[] {
  // ...
}
```

### Entities (src/domain/entities/)

Domain entities are documented with property descriptions and branded type explanations.

### DTOs (src/dto/)

Data transfer objects document the shape of API data.

### Libraries (src/lib/)

Utility functions like `parseHtml()` include comprehensive documentation with:
- Function purpose and usage
- Parameter descriptions
- Return type documentation
- Usage examples
- Notes about behavior

### Components (src/components/)

React components are documented with:
- Component purpose
- Prop types and descriptions
- Usage examples

## Writing Documentation

### Standards for New Code

When adding new code, follow these guidelines:

#### Functions
```typescript
/**
 * Brief description of what the function does.
 *
 * Longer description if needed, explaining:
 * - Why it exists
 * - What it operates on
 * - Any important behavior or side effects
 *
 * @param {Type} paramName - Description of parameter
 * @param {Type} [optionalParam] - Description (optional parameters in brackets)
 * @returns {ReturnType} Description of return value
 * @throws {ErrorType} Description of when/why error is thrown
 *
 * @example
 * const result = myFunction(arg1, arg2);
 * console.log(result);
 */
export function myFunction(param: Type): ReturnType {
  // ...
}
```

#### Interfaces/Types
```typescript
/**
 * Brief description of what this type represents.
 *
 * Longer description if needed.
 *
 * @interface MyInterface
 * @property {Type} propertyName - Description of property
 * @property {Type} [optionalProperty] - Description (optional)
 */
export interface MyInterface {
  propertyName: Type;
  optionalProperty?: Type;
}
```

#### Classes
```typescript
/**
 * Brief description of the class.
 *
 * Longer description explaining:
 * - Purpose
 * - Typical usage patterns
 * - Any important behavior
 */
export class MyClass {
  /**
   * Constructor description.
   * @param {Type} param - Parameter description
   */
  constructor(param: Type) {
    // ...
  }

  /**
   * Method description.
   * @param {Type} param - Parameter description
   * @returns {ReturnType} Description
   */
  myMethod(param: Type): ReturnType {
    // ...
  }
}
```

## Configuration

### TypeDoc Configuration

TypeDoc is configured via `typedoc.json`:
- Input: `src/` directory
- Output: `docs/api/`
- Excludes: test files and node_modules
- Categories: Organized by type (Services, Entities, DTOs, etc.)

### OpenAPI Configuration

OpenAPI generation is configured in `scripts/generate-openapi.js`:
- Generates OpenAPI 3.0 specification
- Creates interactive Swagger UI
- Documents all REST endpoints and schemas

## Viewing Documentation Locally

### OpenAPI/Swagger

1. Run `npm run docs:openapi`
2. Open `docs/openapi/index.html` in your browser
3. Use Swagger UI to:
   - Browse all endpoints
   - View request/response schemas
   - Try endpoints with "Try it out"

### TypeDoc

1. Run `npm run docs:typedoc`
2. Open `docs/api/index.html` in your browser
3. Browse the documentation hierarchy
4. Search for specific types or functions

## Continuous Integration

Consider adding documentation generation to your CI/CD pipeline to ensure documentation stays up-to-date with code changes.

## Best Practices

1. **Keep documentation close to code** - Use TSDoc/JSDoc comments in source files
2. **Include examples** - Most documentation should have usage examples
3. **Explain "why" not "what"** - Comments should explain intent, not just repeat code
4. **Update documentation with code** - When changing code, update corresponding documentation
5. **Use consistent formatting** - Follow the standards documented in this guide
6. **Generate regularly** - Run `npm run docs` before commits to catch outdated documentation

## Troubleshooting

### TypeDoc not generating?

1. Ensure TypeScript files have proper JSDoc/TSDoc comments
2. Check `typedoc.json` configuration
3. Run `npm run docs:typedoc` with verbose output

### OpenAPI missing endpoints?

1. Verify endpoints are in `scripts/generate-openapi.js`
2. Check endpoint path and method match actual API routes
3. Regenerate with `npm run docs:openapi`

### Documentation not appearing?

1. Ensure you've run the documentation generation command
2. Check output directory exists (`docs/`)
3. Open correct HTML file in browser
4. Clear browser cache if needed

## Resources

- [TypeDoc Documentation](https://typedoc.org/)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.0)
- [JSDoc Reference](https://jsdoc.app/)
- [TSDoc](https://tsdoc.org/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
