import express, { Express }  from 'express';
import bodyParser from 'body-parser';
import { blogsRouter } from './routes/blogs-router';
import { postsRouter } from './routes/posts-router';
import { testingRouter } from './routes/testing-router';
import { usersRouter } from './routes/users-router';
import { authRouter } from './routes/auth-router';
import { feedbackRouter } from './routes/feedback-router';
import dotenv from 'dotenv';
import { runDb } from './repositories/db';
import cookieParser from 'cookie-parser';

dotenv.config()


console.log(process.env.MONGO_URL)

const app: Express = express();
const port = process.env.PORT || 3000;

const parserMiddleware = bodyParser();
app.use(parserMiddleware);
app.use(cookieParser())

app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/testing', testingRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/comments', feedbackRouter);

const startApp = async () => {
  await runDb();
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });
};

startApp();