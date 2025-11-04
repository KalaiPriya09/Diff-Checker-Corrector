import { ComparisonOptions } from './comparisonOptions';
import { DiffLine } from './diffTypes';

export interface XmlDifference {
  type: 'added' | 'removed' | 'modified' | 'attribute_changed';
  path: string;
  element?: string;
  attribute?: string;
  oldValue?: string;
  newValue?: string;
  message: string;
}

export type { DiffLine };

export interface XmlCompareResult {
  areEqual: boolean;
  differences: XmlDifference[];
  differencesCount: number;
  diffLines: DiffLine[];
}

interface XmlElement {
  tag: string;
  attributes: Record<string, string>;
  children: XmlElement[];
  text?: string;
}

/**
 * Canonicalizes an XML element based on comparison options
 */
function canonicalizeElement(elem: XmlElement, options: ComparisonOptions): XmlElement {
  const canonical: XmlElement = {
    tag: options.caseSensitive ? elem.tag : elem.tag.toLowerCase(),
    attributes: {},
    children: [],
  };
  
  // Sort attributes if ignoring order
  const attrKeys = Object.keys(elem.attributes);
  const sortedAttrKeys = options.ignoreKeyOrder ? attrKeys.sort() : attrKeys;
  
  for (const key of sortedAttrKeys) {
    const canonicalKey = options.caseSensitive ? key : key.toLowerCase();
    let value = elem.attributes[key];
    
    // Apply whitespace normalization to attribute values
    if (options.ignoreWhitespace) {
      value = value.trim().replace(/\s+/g, ' ');
    }
    
    // Apply case sensitivity to attribute values
    if (!options.caseSensitive) {
      value = value.toLowerCase();
    }
    
    canonical.attributes[canonicalKey] = value;
  }
  
  // Process text content
  if (elem.text) {
    let text = elem.text;
    
    if (options.ignoreWhitespace) {
      text = text.trim().replace(/\s+/g, ' ');
    }
    
    if (!options.caseSensitive) {
      text = text.toLowerCase();
    }
    
    canonical.text = text;
  }
  
  // Process children
  let processedChildren = elem.children.map(child => canonicalizeElement(child, options));
  
  // If ignoreKeyOrder is true, sort child elements by tag name for consistency
  // This makes "Ignore Attribute Order" also ignore element order
  if (options.ignoreKeyOrder) {
    processedChildren = processedChildren.sort((a, b) => {
      const tagA = options.caseSensitive ? a.tag : a.tag.toLowerCase();
      const tagB = options.caseSensitive ? b.tag : b.tag.toLowerCase();
      return tagA.localeCompare(tagB);
    });
  }
  
  canonical.children = processedChildren;
  
  return canonical;
}

/**
 * Serializes XML element to string deterministically with consistent formatting
 */
function serializeElement(elem: XmlElement, options: ComparisonOptions, indent: number = 0): string {
  // Always use 2-space indent for readable display (like JSON)
  const indentStr = '  '.repeat(indent);
  const newline = '\n';
  
  // Build attribute string (sorted for consistency)
  const attrKeys = Object.keys(elem.attributes).sort();
  const attrStr = attrKeys.length > 0
    ? ' ' + attrKeys.map(k => `${k}="${elem.attributes[k]}"`).join(' ')
    : '';
  
  // Build opening tag
  let result = `${indentStr}<${elem.tag}${attrStr}>`;
  
  // Add text content
  if (elem.text) {
    result += elem.text;
  }
  
  // Add children
  if (elem.children.length > 0) {
    result += newline;
    result += elem.children.map(child => serializeElement(child, options, indent + 1)).join(newline);
    result += newline + indentStr;
  }
  
  // Add closing tag
  result += `</${elem.tag}>`;
  
  return result;
}

/**
 * Builds XML tree from DOM node
 */
function buildTree(node: Node): XmlElement | null {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const elementNode = node as Element;
    const element: XmlElement = {
      tag: elementNode.tagName,
      attributes: {},
      children: [],
    };
    
    // Extract attributes
    Array.from(elementNode.attributes).forEach(attr => {
      element.attributes[attr.name] = attr.value;
    });
    
    // Extract text content (preserve all text nodes for proper normalization)
    const textNodes: string[] = [];
    Array.from(elementNode.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent) {
        textNodes.push(child.textContent);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = buildTree(child);
        if (childElement) {
          element.children.push(childElement);
        }
      }
    });
    
    if (textNodes.length > 0) {
      element.text = textNodes.join('');
    }
    
    return element;
  }
  return null;
}

/**
 * Parses XML string into a tree structure
 */
function parseXmlToTree(xmlString: string): { root: XmlElement | null; error?: string } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return { root: null, error: 'Invalid XML' };
    }
    
    const rootElement = doc.documentElement;
    const root = rootElement ? buildTree(rootElement) : null;
    
    return { root };
  } catch {
    return { root: null, error: 'Failed to parse XML' };
  }
}

/**
 * Compares two XML elements recursively
 */
function compareElements(
  oldElem: XmlElement | null,
  newElem: XmlElement | null,
  options: ComparisonOptions,
  path: string = ''
): XmlDifference[] {
  const differences: XmlDifference[] = [];
  
  if (!oldElem && newElem) {
    differences.push({
      type: 'added',
      path: path || '/',
      element: newElem.tag,
      message: `Element added: ${newElem.tag} at ${path || '/'}`,
    });
    newElem.children.forEach((child, idx) => {
      differences.push(...compareElements(null, child, options, `${path}/${newElem.tag}[${idx}]`));
    });
    return differences;
  }
  
  if (oldElem && !newElem) {
    differences.push({
      type: 'removed',
      path: path || '/',
      element: oldElem.tag,
      message: `Element removed: ${oldElem.tag} at ${path || '/'}`,
    });
    oldElem.children.forEach((child, idx) => {
      differences.push(...compareElements(child, null, options, `${path}/${oldElem.tag}[${idx}]`));
    });
    return differences;
  }
  
  if (!oldElem || !newElem) {
    return differences;
  }
  
  const currentPath = path ? `${path}/${oldElem.tag}` : `/${oldElem.tag}`;
  
  // Compare tag names
  const oldTag = options.caseSensitive ? oldElem.tag : oldElem.tag.toLowerCase();
  const newTag = options.caseSensitive ? newElem.tag : newElem.tag.toLowerCase();
  
  if (oldTag !== newTag) {
    differences.push({
      type: 'modified',
      path: currentPath,
      element: oldElem.tag,
      oldValue: oldElem.tag,
      newValue: newElem.tag,
      message: `Element renamed: ${oldElem.tag} → ${newElem.tag}`,
    });
  }
  
  // Compare attributes
  // Since elements are already canonicalized, attributes are already sorted if ignoreKeyOrder is true
  const oldAttrKeys = Object.keys(oldElem.attributes);
  const newAttrKeys = Object.keys(newElem.attributes);
  
  // Create normalized key maps for proper comparison
  const oldAttrMap = new Map<string, { key: string; value: string }>();
  const newAttrMap = new Map<string, { key: string; value: string }>();
  
  for (const key of oldAttrKeys) {
    const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
    oldAttrMap.set(normalizedKey, { key, value: oldElem.attributes[key] });
  }
  
  for (const key of newAttrKeys) {
    const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
    newAttrMap.set(normalizedKey, { key, value: newElem.attributes[key] });
  }
  
  // Get all unique normalized keys
  // Preserve order from original keys when ignoreKeyOrder is false
  const allNormalizedKeys = new Set<string>();
  const orderedNormalizedKeys: string[] = [];
  
  // Add keys from old element in order
  for (const key of oldAttrKeys) {
    const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
    if (!allNormalizedKeys.has(normalizedKey)) {
      allNormalizedKeys.add(normalizedKey);
      orderedNormalizedKeys.push(normalizedKey);
    }
  }
  
  // Add keys from new element (that aren't already added)
  for (const key of newAttrKeys) {
    const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
    if (!allNormalizedKeys.has(normalizedKey)) {
      allNormalizedKeys.add(normalizedKey);
      orderedNormalizedKeys.push(normalizedKey);
    }
  }
  
  // Sort if ignoring order, otherwise preserve the order we collected
  const keysToCompare = options.ignoreKeyOrder
    ? orderedNormalizedKeys.sort()
    : orderedNormalizedKeys;
  
  // Compare attributes using normalized keys
  for (const normalizedKey of keysToCompare) {
    const oldAttr = oldAttrMap.get(normalizedKey);
    const newAttr = newAttrMap.get(normalizedKey);
    
    if (!oldAttr) {
      // Attribute added
      differences.push({
        type: 'added',
        path: currentPath,
        element: oldElem.tag,
        attribute: newAttr!.key,
        newValue: newAttr!.value,
        message: `Attribute added: ${newAttr!.key}="${newAttr!.value}"`,
      });
    } else if (!newAttr) {
      // Attribute removed
      differences.push({
        type: 'removed',
        path: currentPath,
        element: oldElem.tag,
        attribute: oldAttr.key,
        oldValue: oldAttr.value,
        message: `Attribute removed: ${oldAttr.key}="${oldAttr.value}"`,
      });
    } else {
      // Attribute exists in both - compare values
      let normalizedOld = oldAttr.value;
      let normalizedNew = newAttr.value;
      
      if (options.ignoreWhitespace) {
        normalizedOld = normalizedOld.trim().replace(/\s+/g, ' ');
        normalizedNew = normalizedNew.trim().replace(/\s+/g, ' ');
      }
      
      if (!options.caseSensitive) {
        normalizedOld = normalizedOld.toLowerCase();
        normalizedNew = normalizedNew.toLowerCase();
      }
      
      if (normalizedOld !== normalizedNew) {
        differences.push({
          type: 'attribute_changed',
          path: currentPath,
          element: oldElem.tag,
          attribute: oldAttr.key,
          oldValue: oldAttr.value,
          newValue: newAttr.value,
          message: `Attribute changed: ${oldAttr.key}="${oldAttr.value}" → "${newAttr.value}"`,
        });
      }
    }
  }
  
  // Compare text content
  const oldText = oldElem.text || '';
  const newText = newElem.text || '';
  
  let normalizedOldText = oldText;
  let normalizedNewText = newText;
  
  if (options.ignoreWhitespace) {
    normalizedOldText = normalizedOldText.trim().replace(/\s+/g, ' ');
    normalizedNewText = normalizedNewText.trim().replace(/\s+/g, ' ');
  }
  
  if (!options.caseSensitive) {
    normalizedOldText = normalizedOldText.toLowerCase();
    normalizedNewText = normalizedNewText.toLowerCase();
  }
  
  if (normalizedOldText !== normalizedNewText) {
    differences.push({
      type: 'modified',
      path: currentPath,
      element: oldElem.tag,
      oldValue: oldText,
      newValue: newText,
      message: `Text content changed: "${oldText}" → "${newText}"`,
    });
  }
  
  // Compare children
  // If ignoreKeyOrder is true, we need to match children by tag name, not by position
  if (options.ignoreKeyOrder) {
    // Create maps of children by tag name for matching
    const oldChildrenMap = new Map<string, XmlElement[]>();
    const newChildrenMap = new Map<string, XmlElement[]>();
    
    oldElem.children.forEach(child => {
      const tagKey = options.caseSensitive ? child.tag : child.tag.toLowerCase();
      if (!oldChildrenMap.has(tagKey)) {
        oldChildrenMap.set(tagKey, []);
      }
      oldChildrenMap.get(tagKey)!.push(child);
    });
    
    newElem.children.forEach(child => {
      const tagKey = options.caseSensitive ? child.tag : child.tag.toLowerCase();
      if (!newChildrenMap.has(tagKey)) {
        newChildrenMap.set(tagKey, []);
      }
      newChildrenMap.get(tagKey)!.push(child);
    });
    
    // Get all unique tag keys
    const allTagKeys = new Set([...oldChildrenMap.keys(), ...newChildrenMap.keys()]);
    const sortedTagKeys = Array.from(allTagKeys).sort();
    
    // Compare children by tag name
    for (const tagKey of sortedTagKeys) {
      const oldChildren = oldChildrenMap.get(tagKey) || [];
      const newChildren = newChildrenMap.get(tagKey) || [];
      const maxChildren = Math.max(oldChildren.length, newChildren.length);
      
      for (let i = 0; i < maxChildren; i++) {
        differences.push(...compareElements(
          oldChildren[i],
          newChildren[i],
          options,
          `${currentPath}/${tagKey}[${i}]`
        ));
      }
    }
  } else {
    // Compare children by position (original order matters)
    const maxLength = Math.max(oldElem.children.length, newElem.children.length);
    for (let i = 0; i < maxLength; i++) {
      differences.push(...compareElements(
        oldElem.children[i],
        newElem.children[i],
        options,
        `${currentPath}[${i}]`
      ));
    }
  }
  
  return differences;
}

/**
 * Computes line-by-line diff with proper line number tracking
 */
function computeLineDiff(lines1: string[], lines2: string[]): DiffLine[] {
  const n = lines1.length;
  const m = lines2.length;
  
  const dp: number[][] = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Build diff by backtracking from the LCS table
  let i = n;
  let j = m;
  const diff: DiffLine[] = [];
  
  // Build diff in reverse order using unshift (builds from end to start)
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      // Lines match - both move back
      diff.unshift({
        lineNumber: 0, // Will be set after reversing
        left: lines1[i - 1],
        right: lines2[j - 1],
        type: 'unchanged',
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // Line added on right
      diff.unshift({
        lineNumber: 0, // Will be set after reversing
        right: lines2[j - 1],
        type: 'added',
      });
      j--;
    } else if (i > 0) {
      // Line removed from left
      diff.unshift({
        lineNumber: 0, // Will be set after reversing
        left: lines1[i - 1],
        type: 'removed',
      });
      i--;
    }
  }
  
  // Now diff is in correct order (first to last) since unshift builds from end but adds to beginning
  // Assign sequential line numbers (1, 2, 3, 4...)
  diff.forEach((line, idx) => {
    line.lineNumber = idx + 1;
  });
  
  return diff;
}

/**
 * Extracts XML declaration if present
 */
function extractXmlDeclaration(xmlString: string): { declaration: string; content: string } {
  const declarationMatch = xmlString.match(/^<\?xml[^>]*\?>\s*/);
  if (declarationMatch) {
    return {
      declaration: declarationMatch[0].trim(),
      content: xmlString.slice(declarationMatch[0].length),
    };
  }
  return { declaration: '', content: xmlString };
}

export function compareXML(
  xml1: string,
  xml2: string,
  options: ComparisonOptions
): XmlCompareResult {
  try {
    // Extract XML declarations
    const { declaration: decl1, content: content1 } = extractXmlDeclaration(xml1);
    const { declaration: decl2, content: content2 } = extractXmlDeclaration(xml2);
    
    // Parse both XML strings
    const { root: root1, error: error1 } = parseXmlToTree(content1);
    const { root: root2, error: error2 } = parseXmlToTree(content2);
    
    if (error1 || error2 || !root1 || !root2) {
      return {
        areEqual: false,
        differences: [{
          type: 'modified',
          path: 'root',
          message: `XML Parse Error: ${error1 || error2 || 'Invalid XML structure'}`,
        }],
        differencesCount: 1,
        diffLines: [],
      };
    }
    
    // Canonicalize both trees
    const canonical1 = canonicalizeElement(root1, options);
    const canonical2 = canonicalizeElement(root2, options);
    
    // Serialize to strings for display (always use 2-space indent for readability, like JSON)
    const displayOptions: ComparisonOptions = {
      ...options,
      ignoreWhitespace: false, // Always format for display
    };
    const body1 = serializeElement(canonical1, displayOptions);
    const body2 = serializeElement(canonical2, displayOptions);
    
    // Build complete display strings with XML declaration if present
    const displayStr1 = decl1 ? `${decl1}\n${body1}` : body1;
    const displayStr2 = decl2 ? `${decl2}\n${body2}` : body2;
    
    // Generate line-by-line diff on formatted display strings
    // Filter out empty lines to avoid showing unnecessary empty rows
    const displayLines1 = displayStr1.split('\n').filter(line => line.trim().length > 0);
    const displayLines2 = displayStr2.split('\n').filter(line => line.trim().length > 0);
    const diffLines = computeLineDiff(displayLines1, displayLines2);
    
    // Compute structured differences for comparison (using canonicalized objects)
    const differences = compareElements(canonical1, canonical2, options);
    
    return {
      areEqual: differences.length === 0,
      differences,
      differencesCount: differences.length,
      diffLines,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      areEqual: false,
      differences: [{
        type: 'modified',
        path: 'root',
        message: `Error comparing XML: ${errorMessage}`,
      }],
      differencesCount: 1,
      diffLines: [],
    };
  }
}
