import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { BlogItemType } from '../types'

export const BlogSchema = new mongoose.Schema<WithId<BlogItemType>>({
    id: { type: String, require: true },
    name: { type: String, require: true },
    description: { type: String, require: true },
    websiteUrl: { type: String, require: true },
    createdAt: { type: String, require: true },
    isMembership: { type: Boolean, require: true },
});

export const BlogModel = mongoose.model<WithId<BlogItemType>>('blogs', BlogSchema);