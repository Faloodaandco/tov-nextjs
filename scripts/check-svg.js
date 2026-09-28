import { readFileSync } from 'fs';
import { join } from 'path';

const svgContent = readFileSync(join(process.cwd(), 'public/assets/tov-monogram.svg'), 'utf-8');
console.log(svgContent.substring(0, 500));
