import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { routes } from './routes/main.js';
import { swaggerSpec } from './config/swagger.js';

const server = express();
server.use(cors());
server.use(express.static('public'));

server.use('/webhook/stripe', express.raw({ type: 'application/json' }));

server.use(express.json());
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
server.use(routes);

server.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
