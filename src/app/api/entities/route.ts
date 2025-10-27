import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/entities
 * Get all available entities and their properties that can be mapped
 */
export async function GET(request: NextRequest) {
  try {
    const entities = {
      roleListing: {
        properties: ['title', 'description', 'workArrangement', 'location'],
        description: 'Job listing information',
      },
      roleEvent: {
        properties: ['eventType', 'eventTitle', 'eventDate', 'eventNotes'],
        description: 'Events related to a job application',
      },
      roleContact: {
        properties: ['name', 'email', 'phone'],
        description: 'Contact information for hiring personnel',
      },
      roleCallout: {
        properties: ['content'],
        description: 'Important callouts or highlights from a job listing',
      },
      roleLineItems: {
        properties: ['description', 'type'],
        description: 'Individual requirements, benefits, or responsibilities',
      },
      roleCompany: {
        properties: ['name', 'website'],
        description: 'Company information',
      },
      roleLocation: {
        properties: ['city', 'locationState'],
        description: 'Location details for a job',
      },
      roleState: {
        properties: ['name', 'abbreviation'],
        description: 'US state information',
      },
    };

    return NextResponse.json(entities);
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities', details: error.message },
      { status: 500 }
    );
  }
}
