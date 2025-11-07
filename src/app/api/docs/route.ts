import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/docs
 * Returns the OpenAPI specification as JSON
 */
export async function GET() {
  try {
    const specPath = path.join(process.cwd(), 'docs', 'openapi', 'openapi.json');

    if (!fs.existsSync(specPath)) {
      return NextResponse.json(
        { error: 'OpenAPI specification not found. Run "npm run docs:openapi" to generate it.' },
        { status: 404 }
      );
    }

    const specContent = fs.readFileSync(specPath, 'utf-8');
    const spec = JSON.parse(specContent);

    return NextResponse.json(spec);
  } catch (error) {
    console.error('Error reading OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to read OpenAPI specification' },
      { status: 500 }
    );
  }
}
