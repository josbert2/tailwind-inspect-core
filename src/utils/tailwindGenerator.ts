import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);



// Function to convert arbitrary value to CSS
function convertToCss(value: string): string {
  // Remove brackets
  value = value.replace(/^\[|\]$/g, '');
  
  // Handle special cases
  if (/^\d+px$/.test(value)) return value;
  if (/^\d+$/.test(value)) return `${value}px`;
  if (/^#([0-9a-f]{3}){1,2}$/i.test(value)) return value;
  if (/^rgb|rgba/.test(value)) return value;
  
  return value;
}

// Function to get CSS property from Tailwind class
function getCssProperty(prefix: string): string {
  const propertyMap: Record<string, string> = {
    'p': 'padding',
    'px': 'padding-left, padding-right',
    'py': 'padding-top, padding-bottom',
    'pt': 'padding-top',
    'pr': 'padding-right',
    'pb': 'padding-bottom',
    'pl': 'padding-left',
    'm': 'margin',
    'mx': 'margin-left, margin-right',
    'my': 'margin-top, margin-bottom',
    'mt': 'margin-top',
    'mr': 'margin-right',
    'mb': 'margin-bottom',
    'ml': 'margin-left',
    'w': 'width',
    'h': 'height',
    'text': 'font-size',
    'leading': 'line-height',
    'bg': 'background-color',
    'border': 'border-width',
    'rounded': 'border-radius',
    'top': 'top',
    'right': 'right',
    'bottom': 'bottom',
    'left': 'left',
    'gap': 'gap',
    'translate': 'transform',
    'rotate': 'transform',
    'scale': 'transform',
    'skew': 'transform',
    'opacity': 'opacity',
  };

  return propertyMap[prefix] || prefix;
}

export function generateTailwindClass(className: string): string {
  // Match arbitrary value pattern
  const match = className.match(/^([a-z]+(?:-[a-z]+)*)-\[(.*?)\]$/);
  if (!match) return '';

  const [, prefix, value] = match;
  const property = getCssProperty(prefix);
  const cssValue = convertToCss(value);

  if (!property || !cssValue) return '';

  // Handle multiple properties (e.g., px, py)
  const properties = property.split(',').map(p => p.trim());
  
  return properties.map(prop => {
    // Handle transform properties
    if (prop === 'transform') {
      if (prefix.startsWith('translate')) {
        return `transform: translate(${cssValue})`;
      } else if (prefix.startsWith('rotate')) {
        return `transform: rotate(${cssValue})`;
      } else if (prefix.startsWith('scale')) {
        return `transform: scale(${cssValue})`;
      } else if (prefix.startsWith('skew')) {
        return `transform: skew(${cssValue})`;
      }
    }
    return `${prop}: ${cssValue}`;
  }).join(';\n');
}

export { fullConfig };