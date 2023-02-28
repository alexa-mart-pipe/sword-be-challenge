import authRoutes from './routes/authentication.routes';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import database from './database';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandling';
import userRoutes from './routes/user.routes';
import taskRoutes from './routes/task.routes';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());

// Test the database connection
(async () => {
  try {
    await database.authenticate();
    console.log('Connected to database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
})();

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', authRoutes);
app.use('/user', userRoutes);
app.use('/task', taskRoutes);

app.use(errorHandler);

app.listen(port, () => console.log(`Listening on port ${port}`));
