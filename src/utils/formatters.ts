/**
 * Formats JSON content with proper indentation
 */
export function formatJSON(content: string): string {
  try {
    const parsed = JSON.parse(content.trim());
    return JSON.stringify(parsed, null, 2);
  } catch {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Formats XML content with proper indentation
 */
export function formatXML(content: string): string {
  try {
    const trimmed = content.trim();
    if (!trimmed) {
      return trimmed;
    }

    // Extract XML declaration if present
    const declarationMatch = trimmed.match(/^<\?xml[^>]*\?>/i);
    const declaration = declarationMatch ? declarationMatch[0] + '\n' : '';
    const contentWithoutDeclaration = declaration
      ? trimmed.substring(declarationMatch![0].length).trim()
      : trimmed;

    // Parse XML
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentWithoutDeclaration, 'text/xml');
    
    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid XML format');
    }

    // Format with indentation
    const formatted = formatXMLNode(doc.documentElement, 0).trim();
    return declaration + formatted;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid XML')) {
      throw error;
    }
    throw new Error('Invalid XML format');
  }
}

/**
 * Recursively formats XML nodes with indentation
 */
function formatXMLNode(node: Node, indent: number): string {
  const spaces = '  '.repeat(indent);
  let result = '';

  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const tagName = element.tagName;
    const attributes = Array.from(element.attributes)
      .map(attr => ` ${attr.name}="${attr.value}"`)
      .join('');

    const children = Array.from(node.childNodes).filter(
      child => child.nodeType === Node.ELEMENT_NODE || 
               (child.nodeType === Node.TEXT_NODE && child.textContent?.trim())
    );

    if (children.length === 0) {
      // Self-closing or empty element
      const textContent = element.textContent?.trim();
      if (textContent) {
        result += `${spaces}<${tagName}${attributes}>${escapeXML(textContent)}</${tagName}>\n`;
      } else {
        result += `${spaces}<${tagName}${attributes} />\n`;
      }
    } else {
      // Element with children
      result += `${spaces}<${tagName}${attributes}>\n`;
      
      // Process child nodes
      for (const child of node.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          result += formatXMLNode(child, indent + 1);
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
          result += `${'  '.repeat(indent + 1)}${escapeXML(child.textContent.trim())}\n`;
        }
      }
      
      result += `${spaces}</${tagName}>\n`;
    }
  }

  return result;
}

/**
 * Escapes XML special characters
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formats text content by normalizing whitespace
 */
export function formatText(content: string): string {
  if (!content.trim()) {
    return content;
  }

  // Split into lines, trim each line, and rejoin
  const lines = content.split('\n').map(line => line.trimEnd());
  
  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  
  return lines.join('\n');
}

/**
 * Determines the appropriate formatter based on view type
 */
export function formatContent(content: string, viewType: string): string {
  if (!content.trim()) {
    return content;
  }

  if (viewType.includes('json')) {
    return formatJSON(content);
  } else if (viewType.includes('xml')) {
    return formatXML(content);
  } else if (viewType.includes('text')) {
    return formatText(content);
  }
  return content;
}
