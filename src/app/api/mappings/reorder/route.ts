import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { valueMapping } from '@/lib/schema';
import { eq } from 'drizzle-orm';

interface ReorderItem {
  id: string;
  selectorOrder: number;
}

/**
 * POST /api/mappings/reorder
 * Reorder selectors for an entity property
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body; // Array of { id, selectorOrder }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: items must be a non-empty array' },
        { status: 400 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const results = [];

    for (const item of items) {
      const { id, selectorOrder } = item;

      if (!id || selectorOrder === undefined) {
        return NextResponse.json(
          { error: 'Each item must have id and selectorOrder' },
          { status: 400 }
        );
      }

      const result = db
        .update(valueMapping)
        .set({
          selectorOrder,
          updatedAt: now,
        })
        .where(eq(valueMapping.id, id))
        .returning()
        .get();

      if (!result) {
        return NextResponse.json(
          { error: `Mapping with id ${id} not found` },
          { status: 404 }
        );
      }

      results.push(result);
    }

    return NextResponse.json({ success: true, updated: results });
  } catch (error: any) {
    console.error('Error reordering mappings:', error);
    return NextResponse.json(
      { error: 'Failed to reorder mappings', details: error.message },
      { status: 500 }
    );
  }
}
