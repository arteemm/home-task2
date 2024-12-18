import mongoose from 'mongoose'
import { WithId, ObjectId} from 'mongodb'
import { CommentType, CommentResponseType } from '../types'

export const CommentSchema = new mongoose.Schema<WithId<CommentType>>({
    _id: { type: ObjectId, require: true },
    content: { type: String, require: true },
    postId: { type: String, require: true },
    commentatorInfo: {
        userId: { type: String, require: true },
        userLogin: { type: String, require: true },
    },
    createdAt: { type: String, require: true },
},
{
    timestamps: false,
    versionKey: false,
    id: true,
    toJSON: {
      transform(doc, ret){
        ret.id = ret._id
        delete ret.postId
        delete ret._id
      }
    }
  });

export const CommentModel = mongoose.model<WithId<CommentType>>('comments', CommentSchema);
