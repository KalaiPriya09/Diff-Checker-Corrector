import type { ComponentType, ComparisonOptions } from '../types/common';

export function getDefaultComparisonOptions(componentType: ComponentType): ComparisonOptions {
  switch (componentType) {
    case 'json-compare':
      return {
        caseSensitive: true,
        ignoreWhitespace: false,
        ignoreKeyOrder: false,
        ignoreArrayOrder: false,
      };
    case 'xml-compare':
      return {
        caseSensitive: true,
        ignoreWhitespace: false,
        ignoreAttributeOrder: false,
      };
    case 'text-compare':
      return {
        caseSensitive: true,
        ignoreWhitespace: false,
      };
    default:
      return {
        caseSensitive: true,
        ignoreWhitespace: false,
      };
  }
}

export function resetComparisonOptions(componentType: ComponentType): ComparisonOptions {
  return getDefaultComparisonOptions(componentType);
}

