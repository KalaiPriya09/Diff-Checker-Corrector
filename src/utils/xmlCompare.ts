import type { ComparisonOptions, XmlDifference, XmlCompareResult, DiffLine } from '../types/common';
import { normalizeKey, normalizeString, countDifferences } from './compareFunct';

export type { DiffLine };

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
    tag: normalizeKey(elem.tag, options.caseSensitive),
    attributes: {},
    children: [],
  };
  
  // Sort attributes if ignoring order
  const attrKeys = Object.keys(elem.attributes);
  const sortedAttrKeys = options.ignoreKeyOrder ? attrKeys.sort() : attrKeys;
  
  for (const key of sortedAttrKeys) {
    const canonicalKey = normalizeKey(key, options.caseSensitive);
    let value = elem.attributes[key];
    
      // Apply normalization to attribute values
      value = normalizeString(value, options);
    
    canonical.attributes[canonicalKey] = value;
  }
  
  // Process text content
  if (elem.text) {
    canonical.text = normalizeString(elem.text, options);
  }
  
  // Process children
  let processedChildren = elem.children.map(child => canonicalizeElement(child, options));
  
  // If ignoreKeyOrder is true, sort child elements by tag name for consistency
  // This makes "Ignore Attribute Order" also ignore element order
  if (options.ignoreKeyOrder) {
    processedChildren = processedChildren.sort((a, b) => {
      const tagA = normalizeKey(a.tag, options.caseSensitive);
      const tagB = normalizeKey(b.tag, options.caseSensitive);
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
  
  // Build attribute string - sort only if ignoring order, otherwise preserve order
  const attrKeys = Object.keys(elem.attributes);
  const sortedAttrKeys = options.ignoreKeyOrder ? attrKeys.sort() : attrKeys;
  const attrStr = sortedAttrKeys.length > 0
    ? ' ' + sortedAttrKeys.map(k => `${k}="${elem.attributes[k]}"`).join(' ')
    : '';
  
  // Build opening tag
  let result = `${indentStr}<${elem.tag}${attrStr}>`;
  
  // If element has children, format them on separate lines
  if (elem.children.length > 0) {
    result += newline;
    result += elem.children.map(child => serializeElement(child, options, indent + 1)).join(newline);
    result += newline + indentStr;
    // Add text content only if no children (mixed content not supported in this format)
  } else if (elem.text) {
    // Element has only text content, add it inline
    result += elem.text;
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
    
    // Extract text content and child elements
    const textNodes: string[] = [];
    Array.from(elementNode.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE && child.textContent) {
        // Only preserve non-whitespace text, or whitespace if there are no child elements
        const text = child.textContent.trim();
        if (text) {
          textNodes.push(text);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = buildTree(child);
        if (childElement) {
          element.children.push(childElement);
        }
      }
    });
    
    // Only set text if there are no children (avoid mixed content issues)
    if (textNodes.length > 0 && element.children.length === 0) {
      element.text = textNodes.join(' ');
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
  const oldTag = normalizeKey(oldElem.tag, options.caseSensitive);
  const newTag = normalizeKey(newElem.tag, options.caseSensitive);
  
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
    const normalizedKey = normalizeKey(key, options.caseSensitive);
    oldAttrMap.set(normalizedKey, { key, value: oldElem.attributes[key] });
  }
  
  for (const key of newAttrKeys) {
    const normalizedKey = normalizeKey(key, options.caseSensitive);
    newAttrMap.set(normalizedKey, { key, value: newElem.attributes[key] });
  }
  
  // Check attribute order difference when ignoreKeyOrder is false
  if (!options.ignoreKeyOrder && oldAttrKeys.length === newAttrKeys.length && oldAttrKeys.length > 0) {
    // Normalize keys for order comparison
    const normalizedOldOrder = oldAttrKeys.map(k => normalizeKey(k, options.caseSensitive));
    const normalizedNewOrder = newAttrKeys.map(k => normalizeKey(k, options.caseSensitive));
    
    // First check if all attributes are the same (same set)
    const oldAttrSet = new Set(normalizedOldOrder);
    const newAttrSet = new Set(normalizedNewOrder);
    const sameAttributes = oldAttrSet.size === newAttrSet.size && 
      normalizedOldOrder.every(key => newAttrSet.has(key));
    
    // If same attributes but different order, mark as changed
    if (sameAttributes) {
      const orderDifferent = normalizedOldOrder.some((key, index) => key !== normalizedNewOrder[index]);
      
      if (orderDifferent) {
        // Attribute order is different - mark as modified
        differences.push({
          type: 'attribute_changed',
          path: currentPath,
          element: oldElem.tag,
          attribute: 'attribute_order',
          oldValue: oldAttrKeys.join(', '),
          newValue: newAttrKeys.join(', '),
          message: `Attribute order changed: [${oldAttrKeys.join(', ')}] → [${newAttrKeys.join(', ')}]`,
        });
      }
    }
  }
  
  // Get all unique normalized keys
  // Preserve order from original keys when ignoreKeyOrder is false
  const allNormalizedKeys = new Set<string>();
  const orderedNormalizedKeys: string[] = [];
  
  // Add keys from old element in order
  for (const key of oldAttrKeys) {
    const normalizedKey = normalizeKey(key, options.caseSensitive);
    if (!allNormalizedKeys.has(normalizedKey)) {
      allNormalizedKeys.add(normalizedKey);
      orderedNormalizedKeys.push(normalizedKey);
    }
  }
  
  // Add keys from new element (that aren't already added)
  for (const key of newAttrKeys) {
    const normalizedKey = normalizeKey(key, options.caseSensitive);
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
      const normalizedOld = normalizeString(oldAttr.value, options);
      const normalizedNew = normalizeString(newAttr.value, options);
      
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
  
  const normalizedOldText = normalizeString(oldText, options);
  const normalizedNewText = normalizeString(newText, options);
  
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
      const tagKey = normalizeKey(child.tag, options.caseSensitive);
      if (!oldChildrenMap.has(tagKey)) {
        oldChildrenMap.set(tagKey, []);
      }
      oldChildrenMap.get(tagKey)!.push(child);
    });
    
    newElem.children.forEach(child => {
      const tagKey = normalizeKey(child.tag, options.caseSensitive);
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
 * Extracts tag name from an XML line (e.g., '<name>John</name>' -> 'name')
 */
function extractTagFromXMLLine(line: string): string | null {
  const trimmed = line.trim();
  // Match opening tag: <tag> or <tag attribute="value">
  const tagMatch = trimmed.match(/^<([^\s>/]+)/);

  if (tagMatch) {
    return tagMatch[1];
  }
  return null;
}

/**
 * Extracts inner text from an XML line (e.g., '<name>John</name>' -> 'John')
 */
function extractInnerTextFromXMLLine(line: string): string {
  const trimmed = line.trim();

  // Handle self-closing tags: <tag /> or <tag/>
  if (trimmed.match(/\/\s*>$/)) {
    return '';
  }

  // Match content between tags: <tag>content</tag>, <tag attr="value">content</tag>
  const contentMatch = trimmed.match(/^<[^>]+>([^<]*)<\/[^>]+>$/);
  if (contentMatch && contentMatch[1]) {
    return contentMatch[1].trim();
  }

  // Handle opening tag only (multiline content): <tag>text
  const openingMatch = trimmed.match(/^<[^>]+>([^<]+)$/);
  if (openingMatch && openingMatch[1]) {
    return openingMatch[1].trim();
  }

  return '';
}

/**
 * Maps formatted display lines back to original input line numbers
 * by matching content between original and formatted lines
 */
function createLineNumberMap(originalLines: string[], displayLines: string[]): Map<number, number> {
  const map = new Map<number, number>();
  const originalContentMap = new Map<string, number[]>();
  
  // Create a map of content -> original line numbers
  originalLines.forEach((line, idx) => {
    const normalized = line.trim();
    if (normalized && !normalized.startsWith('<?xml')) {
      if (!originalContentMap.has(normalized)) {
        originalContentMap.set(normalized, []);
      }
      originalContentMap.get(normalized)!.push(idx + 1);
    }
  });
  
  // Track which original lines have been used
  const usedOriginalLines = new Map<string, number>();
  
  // Map display lines to original lines
  displayLines.forEach((displayLine, displayIdx) => {
    const normalized = displayLine.trim();
    if (normalized && !normalized.startsWith('<?xml')) {
      const originalLineNumbers = originalContentMap.get(normalized);
      if (originalLineNumbers && originalLineNumbers.length > 0) {
        const key = normalized;
        const usedCount = usedOriginalLines.get(key) || 0;
        if (usedCount < originalLineNumbers.length) {
          const originalLineNum = originalLineNumbers[usedCount];
          map.set(displayIdx + 1, originalLineNum);
          usedOriginalLines.set(key, usedCount + 1);
        }
      }
    }
  });
  
  return map;
}

/**
 * Computes semantic diff based on tag names for XML
 * Uses structured differences to correctly identify added/removed/changed tags
 */
function computeSemanticXMLDiff(
  lines1: string[],
  lines2: string[],
  differences: XmlDifference[],
  options: ComparisonOptions,
  lineNumberMap1?: Map<number, number>,
  lineNumberMap2?: Map<number, number>
): DiffLine[] {
  // Create map of tag -> diff type for all tags (not just top-level)
  // Extract tag name from path (e.g., '/person/name' -> 'name', '/person' -> 'person')
  const tagDiffType = new Map<string, 'added' | 'removed' | 'modified'>();
  
  differences.forEach(diff => {
    // Extract tag name from path or use element name
    let tagName = '';
    if (diff.path) {
      const pathParts = diff.path.split('/').filter(p => p && p !== 'root');
      tagName = pathParts[pathParts.length - 1] || diff.element || '';
    } else if (diff.element) {
      tagName = diff.element;
    }
    
    if (tagName) {
      const normalizedTag = normalizeKey(tagName, options.caseSensitive);
      // Map attribute_changed to modified for tagDiffType
      const mappedType: 'added' | 'removed' | 'modified' = 
        diff.type === 'attribute_changed' ? 'modified' : diff.type;
      // Only set if not already set, or if current is more important (modified > added/removed)
      if (!tagDiffType.has(normalizedTag) || mappedType === 'modified') {
        tagDiffType.set(normalizedTag, mappedType);
      }
    }
  });
  
  // Create tag-to-lines mapping for both sides (support multiple tags with same name)
  const tagToLines1 = new Map<string, Array<{ line: string; lineNum: number }>>();
  const tagToLines2 = new Map<string, Array<{ line: string; lineNum: number }>>();
  
  lines1.forEach((line, idx) => {
    const tag = extractTagFromXMLLine(line);
    if (tag) {
      const normalizedTag = normalizeKey(tag, options.caseSensitive);
      if (!tagToLines1.has(normalizedTag)) {
        tagToLines1.set(normalizedTag, []);
      }
      tagToLines1.get(normalizedTag)!.push({ line, lineNum: idx + 1 });
    }
  });
  
  lines2.forEach((line, idx) => {
    const tag = extractTagFromXMLLine(line);
    if (tag) {
      const normalizedTag = normalizeKey(tag, options.caseSensitive);
      if (!tagToLines2.has(normalizedTag)) {
        tagToLines2.set(normalizedTag, []);
      }
      tagToLines2.get(normalizedTag)!.push({ line, lineNum: idx + 1 });
    }
  });
  
  // Track which lines have been matched for each tag
  const matchedLeft = new Map<string, Set<number>>();
  const matchedRight = new Map<string, Set<number>>();
  
  // Build diff by processing lines in order, matching tags semantically
  const result: DiffLine[] = [];
  const processedLeft = new Set<number>();
  const processedRight = new Set<number>();
  let lineNumber = 1;
  
  // Process all lines from left, matching with right by tag
  for (let i = 0; i < lines1.length; i++) {
    if (processedLeft.has(i + 1)) continue;
    
    const line1 = lines1[i];
    const tag1 = extractTagFromXMLLine(line1);
    
    if (tag1) {
      const normalizedTag1 = normalizeKey(tag1, options.caseSensitive);
      const rightLines = tagToLines2.get(normalizedTag1);
      const leftMatched = matchedLeft.get(normalizedTag1) || new Set<number>();
      
      // When ignoreKeyOrder is ON, elements are sorted, so try position match first
      // When ignoreKeyOrder is OFF, match semantically by tag name and inner text
      let matched = false;
      let matchToUse: { line: string; lineNum: number } | null = null;
      
      if (options.ignoreKeyOrder && i < lines2.length && !processedRight.has(i + 1)) {
        // When ignoreKeyOrder is ON, elements are sorted, so match by position
        const rightTag = extractTagFromXMLLine(lines2[i]);
        if (rightTag && normalizeKey(rightTag, options.caseSensitive) === normalizedTag1) {
          // Tags match at same position - use this match
          matchToUse = { line: lines2[i], lineNum: i + 1 };
        }
      }
      
      // If position match didn't work, try semantic matching
      if (!matchToUse && rightLines) {
        // Extract and normalize left inner text first
        const leftInnerText = extractInnerTextFromXMLLine(line1);
        let normalizedLeftText = leftInnerText;
        if (options.ignoreWhitespace) {
          normalizedLeftText = normalizedLeftText.trim().replace(/\s+/g, ' ');
        }
        if (!options.caseSensitive) {
          normalizedLeftText = normalizedLeftText.toLowerCase();
        }

        // First, try to find an exact inner text match
        let bestMatch: { rightLine: typeof rightLines[0]; normalizedText: string } | null = null;
        let exactMatch: typeof rightLines[0] | null = null;

        for (const rightLine of rightLines) {
          const rightMatched = matchedRight.get(normalizedTag1) || new Set<number>();
          if (!rightMatched.has(rightLine.lineNum)) {
            const rightInnerText = extractInnerTextFromXMLLine(rightLine.line);
            let normalizedRightText = rightInnerText;
            if (options.ignoreWhitespace) {
              normalizedRightText = normalizedRightText.trim().replace(/\s+/g, ' ');
            }
            if (!options.caseSensitive) {
              normalizedRightText = normalizedRightText.toLowerCase();
            }

            // Prioritize exact inner text match
            if (normalizedLeftText === normalizedRightText && normalizedLeftText !== '') {
              exactMatch = rightLine;
              break; // Found perfect match, use it
            }

            // Keep track of best match (same tag, any content)
            if (!bestMatch) {
              bestMatch = { rightLine, normalizedText: normalizedRightText };
            }
          }
        }

        // Use exact match if found, otherwise use best match
        matchToUse = exactMatch || bestMatch?.rightLine || null;
      }
      
      if (matchToUse) {
        const rightMatched = matchedRight.get(normalizedTag1) || new Set<number>();
        if (!rightMatched.has(matchToUse.lineNum)) {
            const originalLeftLineNum = lineNumberMap1?.get(i + 1) ?? i + 1;
          const originalRightLineNum = lineNumberMap2?.get(matchToUse.lineNum) ?? matchToUse.lineNum;

          const leftInnerText = extractInnerTextFromXMLLine(line1);
          let normalizedLeftText = leftInnerText;
          if (options.ignoreWhitespace) {
            normalizedLeftText = normalizedLeftText.trim().replace(/\s+/g, ' ');
          }
          if (!options.caseSensitive) {
            normalizedLeftText = normalizedLeftText.toLowerCase();
          }

          const rightInnerText = extractInnerTextFromXMLLine(matchToUse.line);
          let normalizedRightText = rightInnerText;
          if (options.ignoreWhitespace) {
            normalizedRightText = normalizedRightText.trim().replace(/\s+/g, ' ');
          }
          if (!options.caseSensitive) {
            normalizedRightText = normalizedRightText.toLowerCase();
          }

          // Determine diff type based on inner text and attribute comparison
          // Changed should only be for: Inner Text, Inner Text (Nested Tags), and Attributes
          let diffTypeResult: 'unchanged' | 'modified' | 'added' | 'removed' = 'unchanged';

          // First check structured differences - if tagDiffType indicates modified, it's modified
          const diffType = tagDiffType.get(normalizedTag1);
          if (diffType === 'modified') {
            // Structured differences indicate this tag is modified (inner text or attributes)
            diffTypeResult = 'modified';
          } else if (diffType === 'added' || diffType === 'removed') {
            // Should not happen here since tag exists in both, but handle gracefully
            diffTypeResult = 'unchanged';
            } else {
            // No structured differences - check inner text
            if (normalizedLeftText !== normalizedRightText) {
              // Different inner text - mark as modified (yellow)
              diffTypeResult = 'modified';
            } else if (line1 === matchToUse.line) {
              // Exact match - definitely unchanged
              diffTypeResult = 'unchanged';
            } else {
              // Same inner text but different line format
              // This could be due to attribute differences or formatting
              // Since no structured differences, treat as unchanged (formatting only)
              diffTypeResult = 'unchanged';
            }
          }

              result.push({
                lineNumber: lineNumber++,
                leftLineNumber: originalLeftLineNum,
                rightLineNumber: originalRightLineNum,
                left: line1,
            right: matchToUse.line,
            type: diffTypeResult,
              });

            processedLeft.add(i + 1);
          processedRight.add(matchToUse.lineNum);
            leftMatched.add(i + 1);
          rightMatched.add(matchToUse.lineNum);
            matchedLeft.set(normalizedTag1, leftMatched);
            matchedRight.set(normalizedTag1, rightMatched);
            matched = true;
        }
      }
      
      if (!matched) {
        // Tag only in left or all right tags already matched - Removed (red)
        const originalLeftLineNum = lineNumberMap1?.get(i + 1) ?? i + 1;
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: originalLeftLineNum,
          rightLineNumber: undefined,
          left: line1,
          right: undefined,
          type: 'removed',
        });
        processedLeft.add(i + 1);
        leftMatched.add(i + 1);
        matchedLeft.set(normalizedTag1, leftMatched);
      }
    } else {
      // Structural line (no tag) - try to match with right
      const matchingIdx = lines2.findIndex((l, idx) => l === line1 && !processedRight.has(idx + 1));
      const originalLeftLineNum = lineNumberMap1?.get(i + 1) ?? i + 1;
      if (matchingIdx >= 0) {
        const originalRightLineNum = lineNumberMap2?.get(matchingIdx + 1) ?? matchingIdx + 1;
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: originalLeftLineNum,
          rightLineNumber: originalRightLineNum,
          left: line1,
          right: lines2[matchingIdx],
          type: 'unchanged',
        });
        processedLeft.add(i + 1);
        processedRight.add(matchingIdx + 1);
      } else {
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: originalLeftLineNum,
          rightLineNumber: undefined,
          left: line1,
          right: undefined,
          type: 'unchanged',
        });
        processedLeft.add(i + 1);
      }
    }
  }
  
  // Process remaining lines from right (added tags)
  for (let j = 0; j < lines2.length; j++) {
    if (processedRight.has(j + 1)) continue;
    
    const line2 = lines2[j];
    const tag2 = extractTagFromXMLLine(line2);
    
    if (tag2) {
      const normalizedTag2 = normalizeKey(tag2, options.caseSensitive);
      const rightMatched = matchedRight.get(normalizedTag2) || new Set<number>();
      
      // Check if this right tag line is already matched
      if (!rightMatched.has(j + 1)) {
        // Tag only in right or unmatched - Added (green)
        const originalRightLineNum = lineNumberMap2?.get(j + 1) ?? j + 1;
        result.push({
          lineNumber: lineNumber++,
          leftLineNumber: undefined,
          rightLineNumber: originalRightLineNum,
          left: undefined,
          right: line2,
          type: 'added',
        });
        processedRight.add(j + 1);
        rightMatched.add(j + 1);
        matchedRight.set(normalizedTag2, rightMatched);
      }
    } else {
      // Structural line from right
      const originalRightLineNum = lineNumberMap2?.get(j + 1) ?? j + 1;
      result.push({
        lineNumber: lineNumber++,
        leftLineNumber: undefined,
        rightLineNumber: originalRightLineNum,
        left: undefined,
        right: line2,
        type: 'unchanged',
      });
      processedRight.add(j + 1);
    }
  }
  
  // Filter out blank lines and sort by line numbers to maintain original order
  const filteredResult = result.filter(diff => {
    // Remove blank/empty lines
    const leftContent = diff.left?.trim() || '';
    const rightContent = diff.right?.trim() || '';
    return leftContent !== '' || rightContent !== '';
  });
  
  filteredResult.sort((a, b) => {
    const leftA = a.leftLineNumber ?? 999999;
    const leftB = b.leftLineNumber ?? 999999;
    const rightA = a.rightLineNumber ?? 999999;
    const rightB = b.rightLineNumber ?? 999999;
    return Math.min(leftA, rightA) - Math.min(leftB, rightB);
  });
  
  return filteredResult;
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

/**
 * Creates a parse error result for XML comparison
 */
function createParseErrorResult(errorMsg: string): XmlCompareResult {
  return {
    areEqual: false,
    differences: [{
      type: 'modified',
      path: 'root',
      message: errorMsg,
    }],
    differencesCount: 1,
    diffLines: [],
    addedCount: 0,
    removedCount: 0,
    modifiedCount: 0,
    hasParseError: true,
    parseErrorMessage: errorMsg,
  };
}

/**
 * Checks if a string looks like XML
 */
function looksLikeXML(str: string): boolean {
  const trimmed = str.trim();
  // Check if it starts with XML declaration
  if (trimmed.startsWith('<?xml')) {
    return true;
  }
  // Check if it starts with an XML tag
  if (trimmed.startsWith('<') && /^<\w+/.test(trimmed)) {
    return true;
  }
  // Check if it starts with JSON-like structure (not XML)
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return false;
  }
  // If it has XML-like tags, consider it XML
  return /<\w+[^>]*>/.test(trimmed);
}

export function compareXML(
  xml1: string,
  xml2: string,
  options: ComparisonOptions
): XmlCompareResult {
  // Check if inputs look like XML
  if (!looksLikeXML(xml1) || !looksLikeXML(xml2)) {
    return createParseErrorResult('Input does not appear to be valid XML. Please check your XML syntax.');
  }
  
  try {
    // Extract XML declarations
    const { declaration: decl1, content: content1 } = extractXmlDeclaration(xml1);
    const { declaration: decl2, content: content2 } = extractXmlDeclaration(xml2);
    
    // Parse both XML strings
    const { root: root1, error: error1 } = parseXmlToTree(content1);
    const { root: root2, error: error2 } = parseXmlToTree(content2);
    
    if (error1 || error2 || !root1 || !root2) {
      // Build error message
      let errorMsg = 'XML Parse Error';
      if ((error1 || !root1) && (error2 || !root2)) {
        errorMsg = 'Both XML inputs are not valid. Please correct tag errors before comparing.';
      } else if (error1 || !root1) {
        errorMsg = 'Left XML is not valid. Please correct tag errors before comparing.';
      } else if (error2 || !root2) {
        errorMsg = 'Right XML is not valid. Please correct tag errors before comparing.';
      }
      
      return createParseErrorResult(errorMsg);
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
    
    // Generate semantic diff based on tag names
    const displayLines1 = displayStr1.split('\n');
    const displayLines2 = displayStr2.split('\n');
    
    // Map display lines back to original input line numbers
    const originalLines1 = xml1.split('\n');
    const originalLines2 = xml2.split('\n');
    const lineNumberMap1 = createLineNumberMap(originalLines1, displayLines1);
    const lineNumberMap2 = createLineNumberMap(originalLines2, displayLines2);
    
    // First compute structured differences to know which tags are added/removed/changed
    const differences = compareElements(canonical1, canonical2, options);
    const diffLines = computeSemanticXMLDiff(displayLines1, displayLines2, differences, options, lineNumberMap1, lineNumberMap2);
    
    // Count actual differences from diffLines
    const { addedCount, removedCount, modifiedCount, totalCount: totalDifferences } = countDifferences(diffLines);
    
    return {
      areEqual: differences.length === 0 && totalDifferences === 0,
      differences,
      differencesCount: totalDifferences > 0 ? totalDifferences : differences.length,
      diffLines,
      addedCount,
      removedCount,
      modifiedCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createParseErrorResult(`Error comparing XML: ${errorMessage}`);
  }
}
