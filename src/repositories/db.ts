import { Collection, MongoClient } from 'mongodb';
import { BlogItemType, PostItemType } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017';

const client = new MongoClient(mongoURI);
const db = client.db('home-task');
export const blogsCollection = db.collection<BlogItemType>('blogs');
export const postsCollection = db.collection<PostItemType>('posts');


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