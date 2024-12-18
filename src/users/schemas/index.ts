import mongoose from 'mongoose';
import { WithId, ObjectId} from 'mongodb';
import { UserType } from '../types';

export const UserSchema = new mongoose.Schema<WithId<UserType>>({
  _id: { type: ObjectId, require: true },
  accountData: {
    userName: { type: String, require: true },
    email: { type: String, require: true },
    passwordHash: { type: String, require: true },
    salt: { type: String, require: true },
    createdAt: { type: String, require: true },
  },
  emailConfirmation: {
    confirmationCode: { type: String, require: true },
    expirationDate: { type: Date, require: true },
    isConfirmed: { type: Boolean, require: true },
  },
  usedTokens: [ { type: String, require: true } ],
  recoveryCode: {type: String, require: false},
},
{
    timestamps: false,
    versionKey: false,
    id: true,
    toJSON: {
      transform(doc, ret){
        ret.id = (ret._id).toString()
        ret.login = ret.accountData.userName
        ret.email = ret.accountData.email
        ret.createdAt = ret.accountData.createdAt
        delete ret._id
        delete ret.accountData
        delete ret.emailConfirmation
        delete ret.usedTokens
        delete ret.recoveryCode
      }
    }
  });

export const UserModel = mongoose.model<WithId<UserType>>('users', UserSchema);