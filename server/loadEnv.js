import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const serverDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(serverDir, '.env') });

