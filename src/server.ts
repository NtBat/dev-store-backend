import express, { Request, Response } from 'express';
import cors from 'cors';
import { routes } from './routes/main.js';

const server = express();
server.use(cors());
server.use(express.static('public'));
server.use(express.json());

server.use(routes);

server.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
