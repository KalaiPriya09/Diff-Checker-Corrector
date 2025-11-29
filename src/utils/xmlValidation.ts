/**
 * XML Validation and Normalization Utility
 * 
 * Provides functionality to validate and normalize XML
 */

export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

// Maximum safe string length for formatting operations (10 MB)
// Beyond this, formatting operations may cause "Invalid string length" errors
const MAX_SAFE_FORMAT_LENGTH = 10 * 1024 * 1024; // 10 MB

/**
 * Validate XML string without formatting (preserves original structure)
 * Used when we need to preserve whitespace differences
 */
export function validateXMLWithoutFormatting(input: string): ValidationResult {
  // Check if empty
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'Input is empty',
    };
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      const errorText = parserError.textContent || 'Invalid XML syntax';
      return {
        isValid: false,
        error: errorText,
      };
    }

    // Just serialize without formatting to preserve structure
    // This ensures XML is valid but keeps original formatting as much as possible
    const serializer = new XMLSerializer();
    const serialized = serializer.serializeToString(xmlDoc);

    return {
      isValid: true,
      formatted: serialized, // This is the minimally serialized version
    };
  } catch (error) {
    // Extract error message
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid XML syntax';

    return {
      isValid: false,
      error: errorMessage,
    };
  }
}

/**
 * Validate and format XML string
 */
export function validateXML(input: string): ValidationResult {
  // Check if empty
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'Input is empty',
    };
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      const errorText = parserError.textContent || 'Invalid XML syntax';
      return {
        isValid: false,
        error: errorText,
      };
    }

    // Format with indentation
    const serializer = new XMLSerializer();
    let formatted = serializer.serializeToString(xmlDoc);
    
    // Skip formatting for very large files to avoid "Invalid string length" error
    // For large files, return the serialized version without formatting
    if (formatted.length > MAX_SAFE_FORMAT_LENGTH) {
      return {
        isValid: true,
        formatted: formatted, // Return serialized version without formatting
      };
    }
    
    // Basic formatting for readability - handle comments, CDATA, and elements
    try {
      formatted = formatted
        .replace(/(>)(<!--)/g, '$1\n$2')  // Split before comments
        .replace(/(-->)(<)/g, '$1\n$2')   // Split after comments
        .replace(/(>)(<)/g, '$1\n$2')     // Split between elements
        .split('\n')
        .map((line, index, arr) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          // Calculate depth based on opening/closing tags (comments don't affect depth)
          const depth = arr.slice(0, index).reduce((d, l) => {
            const trimmedLine = l.trim();
            if (trimmedLine.startsWith('</')) return d - 1;
            if (trimmedLine.startsWith('<') && 
                !trimmedLine.startsWith('<?') && 
                !trimmedLine.startsWith('<!--') &&
                !trimmedLine.startsWith('<![CDATA[') &&
                !trimmedLine.endsWith('/>') &&
                !trimmedLine.endsWith('-->')) return d + 1;
            return d;
          }, 0);
          return '  '.repeat(Math.max(0, depth)) + trimmed;
        })
        .filter(line => line.length > 0)
        .join('\n');
    } catch {
      // If formatting fails (e.g., "Invalid string length"), return unformatted version
      // This allows validation to succeed even if formatting fails
      return {
        isValid: true,
        formatted: serializer.serializeToString(xmlDoc), // Return unformatted but valid XML
      };
    }

    return {
      isValid: true,
      formatted,
    };
  } catch (error) {
    // Extract error message
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid XML syntax';

    // Handle "Invalid string length" specifically
    if (errorMessage.includes('Invalid string length') || 
        errorMessage.includes('string length') ||
        errorMessage.includes('RangeError')) {
      return {
        isValid: false,
        error: 'File is too large to process. Please use a smaller file (under 10 MB).',
      };
    }

    return {
      isValid: false,
      error: errorMessage,
    };
  }
}

/**
 * Normalize XML by sorting attributes alphabetically
 * This allows comparing XML documents regardless of attribute order
 */
export const normalizeXMLAttributes = (xmlString: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML');
    }
    
    // Recursively sort attributes in all elements
    const sortAttributes = (node: Element) => {
      if (node.attributes && node.attributes.length > 0) {
        // Extract all attributes
        const attrs: Array<{ name: string; value: string }> = [];
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          attrs.push({ name: attr.name, value: attr.value });
        }
        
        // Sort by attribute name
        attrs.sort((a, b) => a.name.localeCompare(b.name));
        
        // Remove all attributes
        while (node.attributes.length > 0) {
          node.removeAttribute(node.attributes[0].name);
        }
        
        // Re-add in sorted order
        attrs.forEach(attr => {
          node.setAttribute(attr.name, attr.value);
        });
      }
      
      // Recursively process child elements
      for (let i = 0; i < node.children.length; i++) {
        sortAttributes(node.children[i]);
      }
    };
    
    // Start sorting from root element
    if (xmlDoc.documentElement) {
      sortAttributes(xmlDoc.documentElement);
    }
    
    // Serialize back to string
    const serializer = new XMLSerializer();
    let normalized = serializer.serializeToString(xmlDoc);
    
    // Format for readability - handle comments, CDATA, and elements consistently
    normalized = normalized
      .replace(/(>)(<!--)/g, '$1\n$2')  // Split before comments
      .replace(/(-->)(<)/g, '$1\n$2')   // Split after comments
      .replace(/(>)(<)/g, '$1\n$2')     // Split between elements
      .split('\n')
      .map((line, index, arr) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        // Calculate depth based on opening/closing tags (comments don't affect depth)
        const depth = arr.slice(0, index).reduce((d, l) => {
          const trimmedLine = l.trim();
          if (trimmedLine.startsWith('</')) return d - 1;
          if (trimmedLine.startsWith('<') && 
              !trimmedLine.startsWith('<?') && 
              !trimmedLine.startsWith('<!--') &&
              !trimmedLine.startsWith('<![CDATA[') &&
              !trimmedLine.endsWith('/>') &&
              !trimmedLine.endsWith('-->')) return d + 1;
          return d;
        }, 0);
        return '  '.repeat(Math.max(0, depth)) + trimmed;
      })
      .filter(line => line.length > 0)
      .join('\n');
    
    return normalized;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('XML normalization error:', error);
    // Return original if normalization fails
    return xmlString;
  }
};

/**
 * Alias for normalizeXMLAttributes for consistency
 */
export const normalizeXML = normalizeXMLAttributes;

/**
 * Normalize XML by sorting attributes alphabetically WITHOUT changing formatting
 * This preserves the original structure while normalizing attribute order
 * Used when ignoreAttributeOrder is true but ignoreWhitespace is false
 */
export const normalizeAttributesOnly = (xmlString: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML');
    }
    
    // Recursively sort attributes in all elements
    const sortAttributes = (node: Element) => {
      if (node.attributes && node.attributes.length > 0) {
        // Extract all attributes
        const attrs: Array<{ name: string; value: string }> = [];
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          attrs.push({ name: attr.name, value: attr.value });
        }
        
        // Sort by attribute name
        attrs.sort((a, b) => a.name.localeCompare(b.name));
        
        // Remove all attributes
        while (node.attributes.length > 0) {
          node.removeAttribute(node.attributes[0].name);
        }
        
        // Re-add in sorted order
        attrs.forEach(attr => {
          node.setAttribute(attr.name, attr.value);
        });
      }
      
      // Recursively process child elements
      for (let i = 0; i < node.children.length; i++) {
        sortAttributes(node.children[i]);
      }
    };
    
    // Start sorting from root element
    if (xmlDoc.documentElement) {
      sortAttributes(xmlDoc.documentElement);
    }
    
    // Serialize back to string WITHOUT formatting
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('XML attribute normalization error:', error);
    // Return original if normalization fails
    return xmlString;
  }
};

/**
 * Normalize XML by converting tag names, attribute names, and text content to lowercase
 * Used when caseSensitive is false
 */
export const normalizeXMLCase = (xmlString: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML');
    }
    
    // Recursively normalize case in all nodes
    const normalizeCaseInNode = (node: Node): void => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        // Normalize attribute names and values
        if (element.attributes && element.attributes.length > 0) {
          const attrs: Array<{ name: string; value: string }> = [];
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs.push({ 
              name: attr.name.toLowerCase(), 
              value: attr.value.toLowerCase() 
            });
          }
          
          // Remove all attributes
          while (element.attributes.length > 0) {
            element.removeAttribute(element.attributes[0].name);
          }
          
          // Re-add with lowercase names and values
          attrs.forEach(attr => {
            element.setAttribute(attr.name, attr.value);
          });
        }
        
        // Process child nodes
        const childNodes = Array.from(node.childNodes);
        for (const child of childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            const textNode = child as Text;
            const textContent = textNode.textContent || '';
            // Normalize text content to lowercase
            textNode.textContent = textContent.toLowerCase();
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            normalizeCaseInNode(child);
          }
        }
      }
    };
    
    // Process the document
    if (xmlDoc.documentElement) {
      normalizeCaseInNode(xmlDoc.documentElement);
    }
    
    // Serialize back to string
    const serializer = new XMLSerializer();
    let serialized = serializer.serializeToString(xmlDoc);
    
    // Normalize tag names to lowercase using regex
    // Match: <tagName, </tagName, <tagName>, <tagName/>, <tagName attr
    serialized = serialized.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9_-]*)(\s|>|\/)/g, (match, slash, tagName, suffix) => {
      return `<${slash}${tagName.toLowerCase()}${suffix}`;
    });
    
    return serialized;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('XML case normalization error:', error);
    // Return original if normalization fails
    return xmlString;
  }
};

/**
 * Normalize XML whitespace according to XML whitespace rules
 * - Removes whitespace-only text nodes between elements
 * - Normalizes whitespace in text content (collapses multiple spaces to single space)
 * - Preserves significant whitespace in text content
 * - Returns formatted XML with consistent formatting for comparison
 */
export const normalizeXMLWhitespace = (xmlString: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML');
    }
    
    /**
     * Recursively process nodes to normalize whitespace
     */
    const normalizeWhitespaceInNode = (node: Node): void => {
      // Process child nodes in reverse order to safely remove nodes while iterating
      const childNodes = Array.from(node.childNodes);
      
      for (const child of childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          const textNode = child as Text;
          const textContent = textNode.textContent || '';
          
          // Check if this is a whitespace-only text node
          const isWhitespaceOnly = /^\s*$/.test(textContent);
          
          // Check for significant siblings (elements, comments, CDATA, processing instructions)
          // Whitespace around these nodes can be removed when ignoreWhitespace is enabled
          const hasSignificantSiblings = Array.from(node.childNodes).some(
            (sibling) => {
              if (sibling === child) return false;
              const nodeType = sibling.nodeType;
              return (
                nodeType === Node.ELEMENT_NODE ||
                nodeType === Node.COMMENT_NODE ||
                nodeType === Node.CDATA_SECTION_NODE ||
                nodeType === Node.PROCESSING_INSTRUCTION_NODE
              );
            }
          );
          
          if (isWhitespaceOnly && hasSignificantSiblings) {
            // Remove whitespace-only text nodes between significant nodes
            // This handles whitespace around elements, comments, CDATA, etc.
            node.removeChild(child);
          } else if (textContent.trim().length > 0) {
            // Normalize whitespace in text content
            // Handle whitespace even when quotes or other characters are at the edges
            // Strategy: Normalize whitespace within quoted strings and trim overall
            let normalized = textContent;
            
            // First, normalize whitespace within quoted strings (e.g., " Sample XML " -> "Sample XML")
            // Match content between quotes and normalize whitespace within
            normalized = normalized.replace(/"([^"]*)"/g, (match, content) => {
              // Normalize whitespace within the quoted content
              const normalizedContent = content.replace(/\s+/g, ' ').trim();
              return `"${normalizedContent}"`;
            });
            
            // Then collapse all remaining whitespace sequences to single space
            normalized = normalized.replace(/\s+/g, ' ');
            
            // Finally, trim leading/trailing whitespace from the entire string
            normalized = normalized.trim();
            
            textNode.textContent = normalized;
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          // Recursively process element nodes
          normalizeWhitespaceInNode(child);
        }
        // Note: COMMENT_NODE, CDATA_SECTION_NODE, and PROCESSING_INSTRUCTION_NODE
        // are preserved as-is (whitespace inside them is not normalized per XML rules)
      }
    };
    
    // Process the document
    if (xmlDoc.documentElement) {
      normalizeWhitespaceInNode(xmlDoc.documentElement);
    }
    
    // Serialize back to string
    const serializer = new XMLSerializer();
    let normalized = serializer.serializeToString(xmlDoc);
    
    // Skip formatting for very large files to avoid "Invalid string length" error
    // For large files, return the serialized version without formatting
    if (normalized.length > MAX_SAFE_FORMAT_LENGTH) {
      return normalized; // Return serialized version without formatting
    }
    
    // Format consistently for comparison (same formatting as validateXML)
    // Split elements and comments onto separate lines for consistent formatting
    try {
      normalized = normalized
        .replace(/(>)(<!--)/g, '$1\n$2')  // Split before comments
        .replace(/(-->)(<)/g, '$1\n$2')   // Split after comments
        .replace(/(>)(<)/g, '$1\n$2')     // Split between elements
        .split('\n')
        .map((line, index, arr) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          // Calculate depth based on opening/closing tags (comments don't affect depth)
          const depth = arr.slice(0, index).reduce((d, l) => {
            const trimmedLine = l.trim();
            if (trimmedLine.startsWith('</')) return d - 1;
            if (trimmedLine.startsWith('<') && 
                !trimmedLine.startsWith('<?') && 
                !trimmedLine.startsWith('<!--') &&
                !trimmedLine.startsWith('<![CDATA[') &&
                !trimmedLine.endsWith('/>') &&
                !trimmedLine.endsWith('-->')) return d + 1;
            return d;
          }, 0);
          return '  '.repeat(Math.max(0, depth)) + trimmed;
        })
        .filter(line => line.length > 0)
        .join('\n');
    } catch {
      // If formatting fails (e.g., "Invalid string length"), return unformatted version
      // This allows normalization to succeed even if formatting fails
      return serializer.serializeToString(xmlDoc);
    }
    
    return normalized;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('XML whitespace normalization error:', error);
    // Return original if normalization fails
    return xmlString;
  }
};

