import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the current products data
const productsPath = path.join(__dirname, 'data', 'products.js');
let content = fs.readFileSync(productsPath, 'utf8');

// Fix image paths by removing /images/ prefix
content = content.replace(/image: \['\/images\//g, "image: ['");
content = content.replace(/image: \['\/videos\//g, "image: ['");

// Also fix any remaining /images/ in the middle of arrays
content = content.replace(/, '\/images\//g, ", '");
content = content.replace(/, '\/videos\//g, ", '");

// Write the fixed content back
fs.writeFileSync(productsPath, content, 'utf8');

console.log('✅ Fixed image paths in products data'); 