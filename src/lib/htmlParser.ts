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
