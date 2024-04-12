import express, { Express }  from 'express';
import bodyParser from 'body-parser';
import { blogsRouter } from './routes/blogs-router';
import { postsRouter } from './routes/posts-router';
import { testingRouter } from './routes/testing-router';

const app: Express = express();
const port = process.env.PORT || 3000;

const parserMiddleware = bodyParser();
app.use(parserMiddleware);

app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/testing', testingRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});