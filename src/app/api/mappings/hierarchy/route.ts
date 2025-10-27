import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { valueMapping } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface Hierarchy {
  [entity: string]: {
    [property: string]: typeof valueMapping.$inferSelect[];
  };
}

/**
 * GET /api/mappings/hierarchy?site=...
 * Get hierarchical view of mappings for a site
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const valueSite = searchParams.get('site');

    if (!valueSite) {
      return NextResponse.json(
        { error: 'Missing required query parameter: site' },
        { status: 400 }
      );
    }

    const mappings = db
      .select()
      .from(valueMapping)
      .where(eq(valueMapping.valueSite, valueSite))
      .all();

    // Build hierarchy: site -> entity -> property -> [selectors]
    const hierarchy: Hierarchy = {};

    mappings.forEach(m => {
      if (!hierarchy[m.valueEntity]) {
        hierarchy[m.valueEntity] = {};
      }
      if (!hierarchy[m.valueEntity][m.valueEntityProperty]) {
        hierarchy[m.valueEntity][m.valueEntityProperty] = [];
      }
      hierarchy[m.valueEntity][m.valueEntityProperty].push(m);
    });

    // Sort selectors by order within each property
    Object.values(hierarchy).forEach(entity => {
      Object.values(entity).forEach(selectors => {
        selectors.sort((a, b) => a.selectorOrder - b.selectorOrder);
      });
    });

    return NextResponse.json({
      site: valueSite,
      hierarchy,
    });
  } catch (error: any) {
    console.error('Error fetching hierarchy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hierarchy', details: error.message },
      { status: 500 }
    );
  }
}
