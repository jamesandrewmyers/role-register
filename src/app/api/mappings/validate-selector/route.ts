import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/mappings/validate-selector
 * Test if a CSS selector matches elements in provided HTML
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cssSelector, html } = body;

    if (!cssSelector || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: cssSelector, html' },
        { status: 400 }
      );
    }

    // Since we can't use DOM APIs in Node.js, we'll provide a basic validation
    // In a real implementation, you might use jsdom or cheerio
    
    // Basic check: does the selector syntax look valid?
    const selectorRegex = /^[#.\[\]:\w\s\-\(\)="',>+~^$*|\/\\]+$/;
    const isValidSyntax = selectorRegex.test(cssSelector);

    if (!isValidSyntax) {
      return NextResponse.json({
        valid: false,
        matches: 0,
        reason: 'Invalid CSS selector syntax',
      });
    }

    // Basic string-based matching as a proof of concept
    // In production, use cheerio or jsdom to actually parse and match
    let matchCount = 0;
    
    // Simple heuristic: count how many times selector-like patterns appear in HTML
    if (cssSelector.includes('#')) {
      const id = cssSelector.split('#')[1]?.split(/[\s.:\[]/, 1)[0];
      if (id) {
        matchCount = (html.match(new RegExp(`id=["']${id}["']`, 'g')) || []).length;
      }
    } else if (cssSelector.includes('.')) {
      const className = cssSelector.split('.')[1]?.split(/[\s:#\[]/, 1)[0];
      if (className) {
        matchCount = (html.match(new RegExp(`class=["'][^"']*\\b${className}\\b`, 'g')) || []).length;
      }
    } else if (cssSelector.includes('[')) {
      // Simple data attribute matching
      const attrMatch = cssSelector.match(/\[([^\]]+)\]/);
      if (attrMatch) {
        matchCount = (html.match(new RegExp(attrMatch[1], 'g')) || []).length;
      }
    } else {
      // Tag matching
      const tag = cssSelector.split(/[\s.:#\[]/, 1)[0];
      if (tag) {
        matchCount = (html.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
      }
    }

    return NextResponse.json({
      valid: true,
      matches: matchCount,
      selector: cssSelector,
      ...(matchCount === 0 && { warning: 'Selector did not match any elements in the HTML' }),
    });
  } catch (error: any) {
    console.error('Error validating selector:', error);
    return NextResponse.json(
      { error: 'Failed to validate selector', details: error.message },
      { status: 500 }
    );
  }
}
