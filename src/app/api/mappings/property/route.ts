import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { valueMapping } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/mappings/property?site=...&entity=...&property=...
 * Get all selectors for a specific entity property
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const valueSite = searchParams.get('site');
    const valueEntity = searchParams.get('entity');
    const valueEntityProperty = searchParams.get('property');

    if (!valueSite || !valueEntity || !valueEntityProperty) {
      return NextResponse.json(
        { error: 'Missing required query parameters: site, entity, property' },
        { status: 400 }
      );
    }

    const results = db
      .select()
      .from(valueMapping)
      .where(
        and(
          eq(valueMapping.valueSite, valueSite),
          eq(valueMapping.valueEntity, valueEntity),
          eq(valueMapping.valueEntityProperty, valueEntityProperty)
        )
      )
      .orderBy(valueMapping.selectorOrder)
      .all();

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching property selectors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property selectors', details: error.message },
      { status: 500 }
    );
  }
}
