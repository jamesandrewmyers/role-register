import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { valueMapping } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * POST /api/mappings
 * Create a new value mapping
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { valueSite, valueEntity, valueEntityProperty, cssSelector, selectorOrder } = body;
    
    if (!valueSite || !valueEntity || !valueEntityProperty || !cssSelector || selectorOrder === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: valueSite, valueEntity, valueEntityProperty, cssSelector, selectorOrder' },
        { status: 400 }
      );
    }

    // Optional field
    const { selectorDescription } = body;

    const id = randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);

    const result = db.insert(valueMapping).values({
      id,
      valueSite,
      valueEntity,
      valueEntityProperty,
      cssSelector,
      selectorOrder,
      selectorDescription: selectorDescription || null,
      createdAt,
    }).returning().get();

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating mapping:', error);
    return NextResponse.json(
      { error: 'Failed to create mapping', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mappings
 * List all mappings with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const valueSite = searchParams.get('site');
    const valueEntity = searchParams.get('entity');
    const valueEntityProperty = searchParams.get('property');

    let query = db.select().from(valueMapping);

    const conditions = [];
    
    if (valueSite) {
      conditions.push(eq(valueMapping.valueSite, valueSite));
    }
    
    if (valueEntity) {
      conditions.push(eq(valueMapping.valueEntity, valueEntity));
    }
    
    if (valueEntityProperty) {
      conditions.push(eq(valueMapping.valueEntityProperty, valueEntityProperty));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = query.orderBy(valueMapping.selectorOrder).all();

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mappings', details: error.message },
      { status: 500 }
    );
  }
}
