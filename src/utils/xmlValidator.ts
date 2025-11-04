export interface XmlValidationResult {
  isValid: boolean;
  error?: string;
  position?: { line: number; column: number };
}

/**
 * Validates XML string and returns detailed error information
 */
export function validateXML(xmlString: string): XmlValidationResult {
  if (!xmlString.trim()) {
    return { isValid: false, error: 'Empty input' };
  }

  try {
    // Basic XML structure validation
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parser errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      const errorText = parserError.textContent || 'XML parsing error';
      
      // Try to extract more specific error information
      let formattedError = errorText;
      
      // Check for common XML errors
      if (errorText.includes('not well-formed')) {
        formattedError = 'XML is not well-formed';
      }
      
      // Check for mismatched tags
      const openTags = (xmlString.match(/<[^/!?][^>]*>/g) || []).length;
      const closeTags = (xmlString.match(/<\/[^>]+>/g) || []).length;
      if (openTags !== closeTags) {
        formattedError = `Mismatched tags: ${openTags} opening tags, ${closeTags} closing tags`;
      }
      
      // Check for unclosed tags
      const unclosedTagMatch = xmlString.match(/<([a-zA-Z][a-zA-Z0-9]*)\s[^>]*[^/]>(?!.*<\/\1>)/);
      if (unclosedTagMatch) {
        formattedError = `Unclosed tag: <${unclosedTagMatch[1]}>`;
      }
      
      // Check for illegal characters
      // Valid XML characters: #x09 (tab), #x0A (LF), #x0D (CR), #x20-#xD7FF, #xE000-#xFFFD, #x10000-#x10FFFF
      // JavaScript regex can't handle all Unicode ranges, so we check for common invalid control characters
      // Full Unicode validation is handled by DOMParser itself
      // eslint-disable-next-line no-control-regex
      const invalidControlChars = /[\x00-\x08\x0B-\x0C\x0E-\x1F]/;
      const illegalCharMatch = xmlString.match(invalidControlChars);
      if (illegalCharMatch) {
        formattedError = 'Illegal character detected in XML (control characters are not allowed)';
      }
      
      // Check for duplicate attributes
      const attributeRegex = /<[^>]+>/g;
      let match;
      while ((match = attributeRegex.exec(xmlString)) !== null) {
        const tagContent = match[0];
        const attributes = tagContent.match(/(\w+)\s*=/g);
        if (attributes) {
          const attributeNames = attributes.map(attr => attr.replace(/\s*=$/, ''));
          const uniqueNames = new Set(attributeNames);
          if (uniqueNames.size !== attributeNames.length) {
            formattedError = 'Duplicate attribute detected in tag';
            break;
          }
        }
      }
      
      // Try to extract line number from error
      let line = 1;
      let column = 1;
      const lineMatch = errorText.match(/line\s+(\d+)/i);
      const colMatch = errorText.match(/column\s+(\d+)/i);
      
      if (lineMatch) {
        line = parseInt(lineMatch[1], 10);
      }
      if (colMatch) {
        column = parseInt(colMatch[1], 10);
      }
      
      return {
        isValid: false,
        error: formattedError,
        position: { line, column },
      };
    }
    
    return { isValid: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown XML error';
    return {
      isValid: false,
      error: errorMessage,
    };
  }
}
