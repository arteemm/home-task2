import express, { Express }  from 'express';
import bodyParser from 'body-parser';
import { blogsRouter } from './routes/blogs-router';
import { postsRouter } from './routes/posts-router';
import { testingRouter } from './routes/testing-router';
import { usersRouter } from './routes/users-router';
import { authRouter } from './routes/auth-router';
import { feedbackRouter } from './routes/feedback-router';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { ROUTERS_PATH_ENUM } from './constants/routersPath';

dotenv.config()


console.log(process.env.MONGO_URL)

export const app: Express = express();

const parserMiddleware = bodyParser();
app.use(parserMiddleware);
app.use(cookieParser());

app.use(ROUTERS_PATH_ENUM.BLOGS, blogsRouter);
app.use(ROUTERS_PATH_ENUM.POSTS, postsRouter);
app.use(ROUTERS_PATH_ENUM.TESTING, testingRouter);
app.use(ROUTERS_PATH_ENUM.USERS, usersRouter);
app.use(ROUTERS_PATH_ENUM.AUTH, authRouter);
app.use(ROUTERS_PATH_ENUM.COMMENTS, feedbackRouter);