import {  fullConfig } from '../utils/tailwindGenerator';

const themeColors = fullConfig.theme?.colors || {};
const fontSizes = fullConfig.theme?.fontSize || {};

function buildClassCatalogue(config: any): string[] {
    const catalogue: string[] = [];
  
    // Colores
    const colors = config.theme?.colors || {};
    for (const [colorName, colorValue] of Object.entries(colors)) {
      if (typeof colorValue === 'string') {
        catalogue.push(`bg-${colorName}`);
        catalogue.push(`text-${colorName}`);
      } else if (typeof colorValue === 'object') {
        for (const shade of Object.keys(colorValue)) {
          catalogue.push(`bg-${colorName}-${shade}`);
          catalogue.push(`text-${colorName}-${shade}`);
        }
      }
    }
  
    // Aspect ratios
    const aspectRatios = config.theme?.aspectRatio || {};
    for (const ratioKey of Object.keys(aspectRatios)) {
      catalogue.push(`aspect-${ratioKey}`);
    }
  
    // Container
    const containers = config.theme?.container || {};
    for (const containerKey of Object.keys(containers)) {
      catalogue.push(`container-${containerKey}`);
    }
  
    // Columns
    /*
  
    Class        Properties
    columns-2    columns: 2;
    columns-3    columns: 3;
    columns-4    columns: 4;
    columns-5    columns: 5;
    columns-1    columns: 1;
    
    */
    const columns = config.theme?.columns || {};
    for (const columnKey of Object.keys(columns)) {
      catalogue.push(`columns-${columnKey}`);
    }
  
  
  
    // Espaciados (padding y margin)
    const spacing = config.theme?.spacing || {};
    for (const spacingKey of Object.keys(spacing)) {
      catalogue.push(`p-${spacingKey}`);
      catalogue.push(`m-${spacingKey}`);
      catalogue.push(`px-${spacingKey}`);
      catalogue.push(`py-${spacingKey}`);
      catalogue.push(`mx-${spacingKey}`);
      catalogue.push(`my-${spacingKey}`);
    }
  
    // Tamaños de fuente
    const fontSizes = config.theme?.fontSize || {};
    for (const sizeKey of Object.keys(fontSizes)) {
      catalogue.push(`text-${sizeKey}`);
    }
  
    return Array.from(new Set(catalogue)).sort();
}

const allTailwindClasses = buildClassCatalogue(fullConfig);


export { allTailwindClasses };