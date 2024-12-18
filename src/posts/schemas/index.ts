import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { PostItemType } from '../types'

export const PostSchema = new mongoose.Schema<WithId<PostItemType>>({
    id: { type: String, require: true },
    title: { type: String, require: true },
    shortDescription: { type: String, require: true },
    content: { type: String, require: true },
    blogId: { type: String, require: true },
    blogName: { type: String, require: true },
    createdAt: { type: String, require: true },
});

export const PostModel = mongoose.model<WithId<PostItemType>>('posts', PostSchema);