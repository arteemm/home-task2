import mongoose from 'mongoose';
import { WithId, ObjectId } from 'mongodb';
import { UserSessionsType, UserSessionByDeviceType } from '../types';

const UserSessionSchema = new mongoose.Schema<WithId<UserSessionByDeviceType>>({
        ip: { type: String, require: true },
        title: { type: String, require: true },
        lastActiveDate: { type: String, require: true },
        deviceId: { type: String, require: true },
        url: { type: String, require: true },
        expirationDate: { type: Number, require: true },
})

export const AuthSchema = new mongoose.Schema<WithId<UserSessionsType>>({
    userId: { type: String, require: true },
    sessions: { type: [UserSessionSchema], require: true }
  });

export const AuthModel = mongoose.model<WithId<UserSessionsType>>('auth', AuthSchema);