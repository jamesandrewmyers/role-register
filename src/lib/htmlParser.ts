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
  type: 'title' | 'summary' | 'section' | 'list' | 'unknown';
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
    responsibilities: ['what you', 'you will', 'day to day'],
    requirements: ['qualification', 'you have', 'experience', 'skills', 'what we'],
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
            ? category as VisualSection['lineItemType']
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
        ? bestMatch.category as VisualSection['lineItemType']
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
      return { type: 'section', label: cleanedText.slice(0, 50), confidence: 0.6 };
    }

    if (text.length < 200 && text.length > 20 && (tag === 'p' || tag === 'div')) {
      return { type: 'summary', confidence: 0.5 };
    }

    return { type: 'unknown', confidence: 0.3 };
  }

  function isStrongWrapped(node: HtmlNode): boolean {
    if (!node.children || node.children.length === 0) return false;
    
    const hasStrongChild = node.children.some(child => 
      child.type === 'element' && (child.tag === 'strong' || child.tag === 'b')
    );
    
    return hasStrongChild;
  }

  function isEmphasisWrapped(node: HtmlNode): boolean {
    if (!node.children || node.children.length === 0) return false;
    
    const hasEmChild = node.children.some(child => 
      child.type === 'element' && (child.tag === 'em' || child.tag === 'i')
    );
    
    return hasEmChild;
  }

  function isSectionHeading(node: HtmlNode): boolean {
    const tag = node.tag?.toLowerCase();
    if (tag && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      return true;
    }
    if ((tag === 'p' || tag === 'div' || tag === 'span') && (isStrongWrapped(node) || isEmphasisWrapped(node))) {
      const text = extractDirectText(node);
      return text.length > 5 && text.length < 150;
    }
    return false;
  }

  function hasListNearby(node: HtmlNode, parent: HtmlNode | null): boolean {
    if (!parent || !parent.children) return false;
    
    const nodeIndex = parent.children.indexOf(node);
    if (nodeIndex === -1) return false;
    
    function hasListDescendant(element: HtmlNode, depth: number = 0): boolean {
      if (depth > 2) return false;
      if (element.type === 'element' && (element.tag === 'ul' || element.tag === 'ol')) {
        return true;
      }
      if (element.children) {
        for (const child of element.children) {
          if (hasListDescendant(child, depth + 1)) {
            return true;
          }
        }
      }
      return false;
    }
    
    for (let i = nodeIndex + 1; i < Math.min(nodeIndex + 5, parent.children.length); i++) {
      const sibling = parent.children[i];
      if (hasListDescendant(sibling)) {
        return true;
      }
    }
    return false;
  }

  function isPlainTextSectionHeader(textNode: HtmlNode, parent: HtmlNode | null): boolean {
    if (textNode.type !== 'text' || !textNode.content) return false;
    
    const text = textNode.content.trim();
    
    if (!text.endsWith(':')) return false;
    if (text.length < 10 || text.length > 100) return false;
    
    const lowerText = text.toLowerCase();
    const sectionKeywords = [
      'experience', 'qualification', 'requirement', 'skill', 'responsibilit',
      'duties', 'benefit', 'offer', 'perks', 'about', 'what you', 'nice to have',
      'preferred', 'must have'
    ];
    
    const hasKeyword = sectionKeywords.some(keyword => lowerText.includes(keyword));
    if (!hasKeyword) return false;
    
    return hasListNearby(textNode, parent);
  }

  let currentHeader: VisualSection | null = null;

  function traverse(node: HtmlNode, parent: HtmlNode | null = null) {
    // Check if this text node is a plain text section header
    if (node.type === 'text' && parent && isPlainTextSectionHeader(node, parent)) {
      const text = node.content!.trim();
      const parentTag = parent.tag?.toLowerCase();
      const classification = classifySection(text, parentTag);
      
      if (classification.confidence >= 0.5) {
        const newSection = {
          ...classification,
          content: text,
          node: node,
          confidence: Math.max(0.7, classification.confidence - 0.1)
        };
        sections.push(newSection);
        currentHeader = newSection;
      }
      return;
    }
    
    if (node.type !== 'element' || !node.children) return;

    const tag = node.tag?.toLowerCase();

    // Check if this node itself is a section heading
    if (isSectionHeading(node)) {
      const text = extractText(node).trim();
      const classification = classifySection(text, tag);
      
      if (classification.confidence >= 0.5) {
        const newSection = {
          ...classification,
          content: text,
          node: node
        };
        sections.push(newSection);
        currentHeader = newSection;
      }
      // Continue traversing children - don't return early
      // This allows nested sections to be found (e.g., <p><b> inside a <div><b>)
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = node.children.filter(child => child.tag === 'li');
      if (items.length > 0) {
        const listText = items.map(extractText).join('\n');
        
        sections.push({
          type: 'list',
          content: listText,
          node: node,
          confidence: 0.7,
          label: currentHeader?.label,
          lineItemType: currentHeader?.lineItemType
        });
      }
      return;
    }

    for (const child of node.children) {
      traverse(child, node);
    }
  }

  traverse(root);

  return sections.filter(section => section.confidence >= 0.5);
}
