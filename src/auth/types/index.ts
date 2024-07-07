import { ObjectId } from 'mongodb';


export type UserSessionsType = {
    userId: string;
    sessions: UserSessionByDeviceType[];
};

export type UserSessionByDeviceType = {
    ip: string | string[] | undefined;
    title: string;
    lastActiveDate: string;
    deviceId: string;
    url: string;
    expirationDate: number;
};