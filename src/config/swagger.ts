import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevStore API',
      version: '1.0.0',
    },
  },
  apis: [join(__dirname, '../docs/swagger.yaml')],
};

export const swaggerSpec = swaggerJsdoc(options);
