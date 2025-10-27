import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { valueMapping } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * PUT /api/mappings/:id
 * Update a value mapping
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const { cssSelector, selectorDescription } = body;

    const updatedAt = Math.floor(Date.now() / 1000);

    const result = db
      .update(valueMapping)
      .set({
        ...(cssSelector && { cssSelector }),
        ...(selectorDescription !== undefined && { selectorDescription }),
        updatedAt,
      })
      .where(eq(valueMapping.id, id))
      .returning()
      .get();

    if (!result) {
      return NextResponse.json(
        { error: 'Mapping not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating mapping:', error);
    return NextResponse.json(
      { error: 'Failed to update mapping', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mappings/:id
 * Delete a value mapping
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const result = db
      .delete(valueMapping)
      .where(eq(valueMapping.id, id))
      .returning()
      .get();

    if (!result) {
      return NextResponse.json(
        { error: 'Mapping not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting mapping:', error);
    return NextResponse.json(
      { error: 'Failed to delete mapping', details: error.message },
      { status: 500 }
    );
  }
}
