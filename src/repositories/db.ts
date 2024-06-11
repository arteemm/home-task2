import { MongoClient } from 'mongodb';
import { BlogItemType } from '../types/blogsTypes';
import { PostItemType } from '../types/postsTypes';
import { UserType } from '../types/usersTypes';
import { CommentType } from '../types/commentsTypes';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017';

const client = new MongoClient(mongoURI);
export const db = client.db('home-task');
export const blogsCollection = db.collection<BlogItemType>('blogs');
export const postsCollection = db.collection<PostItemType>('posts');
export const usersCollection = db.collection<UserType>('users');
export const commentsCollection = db.collection<CommentType>('comments');


export async function runDb () {
    try {
        await client.connect();
        await client.db('posts').command({ ping: 1 });
        console.log('Connected successfully to mongo server');
    } catch {
        console.log('Can\'t connect to db');
        await client.close();
    }
};