export interface HtmlNode {
  type: 'element' | 'text' | 'comment';
  tag?: string;
  content?: string;
  attributes?: Record<string, string>;
  children?: HtmlNode[];
}

/**
 * Parses HTML string into a hierarchical tree structure of HtmlNode objects.
 * 
 * This parser creates the same data structure used by the HtmlViewer component
 * for rendering collapsible HTML trees.
 * 
 * @param html - The HTML string to parse
 * @returns Array of HtmlNode objects representing the root-level nodes
 * 
 * @example
 * const nodes = parseHtml('<div class="container"><p>Hello</p></div>');
 * // Returns:
 * // [{
 * //   type: 'element',
 * //   tag: 'div',
 * //   attributes: { class: 'container' },
 * //   children: [{
 * //     type: 'element',
 * //     tag: 'p',
 * //     children: [{ type: 'text', content: 'Hello' }]
 * //   }]
 * // }]
 */
export function parseHtml(html: string): HtmlNode[] {
  const nodes: HtmlNode[] = [];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
  
  let lastIndex = 0;
  let match;
  const stack: HtmlNode[] = [];
  let currentParent: HtmlNode[] = nodes;

  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/[\u2018\u2019\u201B]/g, "'");

  while ((match = tagRegex.exec(html)) !== null) {
    const textBefore = html.slice(lastIndex, match.index).trim();
    if (textBefore) {
      currentParent.push({ type: 'text', content: textBefore });
    }

    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = selfClosingTags.includes(tagName) || fullTag.endsWith('/>');

    if (isClosing) {
      if (stack.length > 0) {
        const parent = stack.pop();
        if (parent && stack.length > 0) {
          currentParent = stack[stack.length - 1].children!;
        } else {
          currentParent = nodes;
        }
      }
    } else {
      const attrs: Record<string, string> = {};
      const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*["']([^"']*)["']/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(fullTag)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }

      const node: HtmlNode = {
        type: 'element',
        tag: tagName,
        attributes: Object.keys(attrs).length > 0 ? attrs : undefined,
        children: []
      };

      currentParent.push(node);

      if (!isSelfClosing) {
        stack.push(node);
        currentParent = node.children!;
      }
    }

    lastIndex = match.index + fullTag.length;
  }

  const textAfter = html.slice(lastIndex).trim();
  if (textAfter) {
    currentParent.push({ type: 'text', content: textAfter });
  }

  return nodes;
}

/**
 * Converts a tree of HtmlNode objects into a hierarchical plain text representation
 * of the HTML source structure, similar to how the HtmlViewer component displays it.
 * 
 * Each element is indented based on its depth in the tree, showing the HTML structure
 * with tags, attributes, and text content.
 * 
 * @param nodes - Array of HtmlNode objects (output from parseHtml)
 * @returns Hierarchical plain text representation of HTML structure
 * 
 * @example
 * const nodes = parseHtml('<div class="container"><p>Hello</p></div>');
 * const text = htmlToPlainText(nodes);
 * // Returns:
 * // "<div class="container">
 * //   <p>
 * //     Hello
 * //   </p>
 * // </div>"
 */
export function htmlToPlainText(nodes: HtmlNode[]): string {
  function processNode(node: HtmlNode, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    
    if (node.type === 'text') {
      const truncated = node.content && node.content.length > 100 
        ? node.content.slice(0, 100) + '...' 
        : node.content;
      return indent + truncated + '\n';
    }
    
    if (node.type === 'element' && node.tag) {
      const attrString = node.attributes 
        ? ' ' + Object.entries(node.attributes)
            .map(([key, val]) => `${key}="${val}"`)
            .join(' ')
        : '';
      
      let result = indent + `<${node.tag}${attrString}>` + '\n';
      
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          result += processNode(child, depth + 1);
        }
        result += indent + `</${node.tag}>` + '\n';
      } else {
        result = indent + `<${node.tag}${attrString}></${node.tag}>` + '\n';
      }
      
      return result;
    }
    
    return '';
  }
  
  let result = '';
  for (const node of nodes) {
    result += processNode(node, 0);
  }
  
  return result.trim();
}

export interface VisualSection {
  type: 'title' | 'summary' | 'section' | 'list' | 'other' | 'unknown';
  label?: string;
  lineItemType?: 'requirements' | 'responsibilities' | 'nicetohave' | 'benefits';
  content: string;
  node: HtmlNode;
  confidence: number;
}

/**
 * Analyzes an HTML node tree to identify visual sections that would be apparent to a human reader.
 * Particularly useful for job listings to separate responsibilities, requirements, qualifications, etc.
 * 
 * @param root - Single HtmlNode to analyze (typically the root of a parsed HTML document)
 * @returns Array of VisualSection objects representing identified sections
 * 
 * @example
 * const nodes = parseHtml(htmlString);
 * const sections = parseVisualSections(nodes[0]);
 * // Returns sections like:
 * // [
 * //   { type: 'title', content: 'Senior Engineer', confidence: 0.9, ... },
 * //   { type: 'section', label: 'Responsibilities', content: '...', confidence: 0.8, ... },
 * //   { type: 'section', label: 'Requirements', content: '...', confidence: 0.8, ... }
 * // ]
 */
export function parseVisualSections(root: HtmlNode): VisualSection[] {
  const sections: VisualSection[] = [];

  // Unique keywords that only match one specific category
  const uniqueKeywords = {
    nicetohave: ['nice to have', 'nice-to-have', 'nice to hav', 'nice-to-hav', 'preferred', 'recommended'],
    responsibilities: ['responsibilit', 'key responsibilit', 'duties', 'role description'],
    requirements: ['must have', 'must-have', 'requirement', 'your experience should include'],
    benefits: ['benefit', 'perks', 'compensation', 'salary', 'package'],
    about: ['about us', 'about the', 'who we are', 'our company', 'our team', 'company description'],
  };

  // Non-unique keywords that might match multiple categories
  const nonUniqueKeywords = {
    nicetohave: ['preferred', 'bonus', 'plus'],
    responsibilities: ["what you'll do"],
    requirements: ["you'll need", "you will need", 'qualification', 'you have', 'experience', 'skills', 'what we'],
    benefits: ['we offer'],
  };

  function extractText(node: HtmlNode): string {
    if (node.type === 'text') {
      return node.content || '';
    }
    if (node.type === 'element' && node.children) {
      return node.children.map(extractText).join(' ');
    }
    return '';
  }

  function extractDirectText(node: HtmlNode): string {
    if (!node.children) return '';
    let text = '';
    for (const child of node.children) {
      if (child.type === 'text') {
        text += child.content || '';
      } else if (child.type === 'element' && (child.tag === 'strong' || child.tag === 'b' || child.tag === 'em' || child.tag === 'i')) {
        text += extractText(child);
      }
    }
    return text.trim();
  }

  function cleanSectionText(text: string): string {
    return text
      .trim()
      .replace(/^\*\*\s*/, '')
      .replace(/\s*\*\*$/, '')
      .replace(/:\s*$/, '')
      .replace(/[\u2018\u2019\u201B]/g, "'")
      .trim();
  }

  function classifySection(text: string, tag?: string): { type: VisualSection['type']; label?: string; lineItemType?: VisualSection['lineItemType']; confidence: number } {
    const cleanedText = cleanSectionText(text);
    const lowerText = cleanedText.toLowerCase().trim();

    if ((tag === 'h1' || tag === 'h2') && text.length < 100) {
      return { type: 'title', confidence: 0.9 };
    }

    // First check unique keywords - if any match, use that category immediately
    for (const [category, keywords] of Object.entries(uniqueKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          const lineItemType = ['requirements', 'responsibilities', 'nicetohave', 'benefits'].includes(category)
            ? (category as VisualSection['lineItemType'])
            : undefined;

          return {
            type: 'section',
            label: category.charAt(0).toUpperCase() + category.slice(1),
            lineItemType,
            confidence: 0.8
          };
        }
      }
    }

    // No unique keyword matched - check non-unique keywords and pick longest match
    let bestMatch: { category: string; keyword: string } | null = null;

    for (const [category, keywords] of Object.entries(nonUniqueKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          if (!bestMatch || keyword.length > bestMatch.keyword.length) {
            bestMatch = { category, keyword };
          }
        }
      }
    }

    if (bestMatch) {
      const lineItemType = ['requirements', 'responsibilities', 'nicetohave', 'benefits'].includes(bestMatch.category)
        ? (bestMatch.category as VisualSection['lineItemType'])
        : undefined;

      return {
        type: 'section',
        label: bestMatch.category.charAt(0).toUpperCase() + bestMatch.category.slice(1),
        lineItemType,
        confidence: 0.8
      };
    }

    if (tag && ['ul', 'ol'].includes(tag)) {
      return { type: 'list', confidence: 0.7 };
    }

    if (tag && ['h3', 'h4', 'h5', 'h6'].includes(tag)) {
      return { type: 'other', label: cleanedText.slice(0, 50), confidence: 0.6 };
    }

    if (text.length < 200 && text.length > 20 && (tag === 'p' || tag === 'div')) {
      return { type: 'summary', confidence: 0.5 };
    }

    return { type: 'unknown', confidence: 0.3 };
  }

  // Step 1: Collect all potential section headers and lists in document order
  interface Candidate {
    type: 'header' | 'list';
    node: HtmlNode;
    headerText?: string;
    listItems?: string;
  }

  const candidates: Candidate[] = [];

  function collect(node: HtmlNode) {
    // Check if this is a heading tag (h1-h6)
    if (node.type === 'element' && node.tag && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag)) {
      const text = extractText(node).trim();
      if (text) {
        candidates.push({ type: 'header', node, headerText: text });
      }
    }

    // Check if this is strong/em wrapped text in p/div/span that looks like a header
    if (node.type === 'element' && (node.tag === 'p' || node.tag === 'div' || node.tag === 'span')) {
      const hasStrong = node.children?.some(child => child.type === 'element' && (child.tag === 'strong' || child.tag === 'b'));
      const hasEm = node.children?.some(child => child.type === 'element' && (child.tag === 'em' || child.tag === 'i'));
      if (hasStrong || hasEm) {
        const text = extractDirectText(node);
        if (text.length > 5 && text.length < 150 && text.endsWith(':')) {
          candidates.push({ type: 'header', node, headerText: text });
        }
      }
    }

    // Check for plain text section headers (text nodes ending with : that match keywords)
    if (node.type === 'text' && node.content) {
      const text = node.content.trim();
      if (text.endsWith(':') && text.length >= 10 && text.length <= 100) {
        const sectionKeywords = [
          'experience', 'qualification', 'requirement', 'skill', 'responsibilit',
          'duties', 'benefit', 'offer', 'perks', 'about', 'what you', 'nice to have',
          'preferred', 'must have'
        ];
        if (sectionKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
          candidates.push({ type: 'header', node, headerText: text });
        }
      }
    }

    // Check if this is a list (ul or ol)
    if (node.type === 'element' && (node.tag === 'ul' || node.tag === 'ol')) {
      const items = node.children?.filter(child => child.tag === 'li') || [];
      if (items.length > 0) {
        const listText = items.map(extractText).join('\n');
        candidates.push({ type: 'list', node, listItems: listText });
      }
    }

    // Recurse
    if (node.children) {
      for (const child of node.children) {
        collect(child);
      }
    }
  }

  collect(root);

  // Step 2: Process candidates linearly - last header before a list claims that list
  let lastHeader: { classification: any; text: string; node: HtmlNode } | null = null;

  for (const candidate of candidates) {
    if (candidate.type === 'header') {
      const classification = classifySection(candidate.headerText!);

      // If classification has low confidence, treat as 'other'
      let finalClassification = classification;
      if (classification.confidence < 0.5) {
        finalClassification = {
          type: 'other' as const,
          label: cleanSectionText(candidate.headerText!).slice(0, 50),
          confidence: 0.5
        };
      }

      if (finalClassification.confidence >= 0.5) {
        lastHeader = {
          classification: finalClassification,
          text: candidate.headerText!,
          node: candidate.node
        };
      }
    } else if (candidate.type === 'list') {
      // Create a list section, attributed to the last header found
      sections.push({
        type: 'list',
        content: candidate.listItems!,
        node: candidate.node,
        confidence: 0.7,
        label: lastHeader?.classification.label,
        lineItemType: lastHeader?.classification.lineItemType
      });

      // Also create the header section if we haven't already
      if (lastHeader && !sections.some(s => s.node === lastHeader!.node)) {
        sections.push({
          type: lastHeader.classification.type,
          label: lastHeader.classification.label,
          lineItemType: lastHeader.classification.lineItemType,
          content: lastHeader.text,
          node: lastHeader.node,
          confidence: lastHeader.classification.confidence
        });
      }
    }
  }

  return sections.filter(section => section.confidence >= 0.5);
}
