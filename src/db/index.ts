import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017';
const mongoURI =  'mongodb://0.0.0.0:27017';

const dbName = 'home-task';

export async function runDb () {
    try {
        await mongoose.connect(mongoURI + '/' + dbName)
        console.log('Connected successfully to mongo server');
    } catch {
        console.log('Can\'t connect to db');
        await mongoose.disconnect()
    }
};