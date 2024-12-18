import { ObjectId } from 'mongodb';
import { UserType, UserResponseType } from '../types';
import { UserModel } from '../schemas';

export const userRepository = {

    async getUserById (_id: ObjectId): Promise<UserResponseType | null > {
        const user = (await UserModel.findOne({_id}))?.toJSON() as UserResponseType | null;
        return user;
    },
    async getFullUserById (_id: ObjectId): Promise<UserType | null > {
        const user = await UserModel.findOne({_id});
        return user;
    },
    async createUser (newUser: UserType): Promise<ObjectId> {
        const result = await UserModel.insertMany(newUser);
        return newUser._id
    },
    async deleteUser (id: ObjectId): Promise<boolean> {
        const idO = new ObjectId(id);
        const result = await UserModel.deleteOne({ _id: idO });

        return result.deletedCount === 1;
    },
    async deleteAllData () {
        await UserModel.deleteMany({});
    },
    async findByLoginOrEmail (loginOrEmail: string) {
        const user = await UserModel.findOne({$or: [ { 'accountData.email': loginOrEmail }, { 'accountData.userName': loginOrEmail }]});
        return user;
    },

    async findUserByCode(code: string) {
        const user = await UserModel.findOne({'emailConfirmation.confirmationCode': code});
        return user;
    },

    async updateConfirmation(_id: ObjectId) {
        const result = await UserModel.updateOne({ _id }, {$set: {'emailConfirmation.isConfirmed': true}});

        return result.matchedCount === 1;
    },

    async updateConfirmationCode(email: string, confirmationCode: string) {
        const result = await UserModel.updateOne({'accountData.email':  email}, {$set: {'emailConfirmation.confirmationCode': confirmationCode}});

        return result.matchedCount === 1;
    },

    async updateRecoveryCode(email: string, recoveryCode: string) {
        const result = await UserModel.updateOne({'accountData.email':  email}, {$set: {'recoveryCode': recoveryCode}});

        return result.matchedCount === 1;
    },
};