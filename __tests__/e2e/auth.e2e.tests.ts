import request from 'supertest';
import { app } from '../../src/app';
import dotenv from 'dotenv';
import { UserResponseType } from '../../src/users/types';
import { MongoClient } from 'mongodb';
import { ROUTERS_PATH_ENUM } from '../../src/constants/routersPath';
import { usersTestsUtils } from '../utils/usersTests.utils';
import { authTestsUtils } from '../utils/authTests.utils';
import { securityTestsUtils } from '../utils/securityTests.utils';
import { HTTP_STATUS_CODES } from '../../src/constants/httpStatusCodes';
import mongoose from 'mongoose';

dotenv.config();


const dbName = 'home-task';
const mongoURI = `mongodb://0.0.0.0:27017/${dbName}`;

describe(ROUTERS_PATH_ENUM.AUTH, () => {
    const userPassword = "string";
    const usersAccessTokens: {[key : string] : string} = {};
    const usersRefreshTokens: {[key : string] : string} = {};
    const userDevicesCollection: UserResponseType[] = [];
    const client = new MongoClient(mongoURI);
    let oldToken = 'lol';

    beforeAll(async () => {
        await mongoose.connect(mongoURI);
        await request(app).delete(ROUTERS_PATH_ENUM.TESTING + '/all-data').expect(204);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('GET users = []', async () => {
        await request(app).
        get(ROUTERS_PATH_ENUM.USERS)
        .auth('admin', 'qwerty')
        .expect({ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] })
    });

    it('- Should create user1 with correct data', async () => {
        const newUserRequestData = { login: "2m1wFsZrBG", password: userPassword, email: "example@example.com"};
        const createdUser = await usersTestsUtils.createUser(newUserRequestData, HTTP_STATUS_CODES.SUCCESS_CREATED);
        userDevicesCollection.push(createdUser.body);
        expect(userDevicesCollection[0]).toEqual({
            id: expect.any(String),
            login: "2m1wFsZrBG",
            email: "example@example.com",
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
          });

    });

    it('- Should create three users with correct data', async () => {
        const newUserRequestData1 = { login: "rrrrrr", password: userPassword, email: "eeeeee@example.com"};
        const newUserRequestData2 = { login: "wwwww", password: userPassword, email: "fffffff3@example.com"};
        const newUserRequestData3 = { login: "eeeeee", password: userPassword, email: "ttttt@example.com"};
        const createdUser1 = await usersTestsUtils.createUser(newUserRequestData1, HTTP_STATUS_CODES.SUCCESS_CREATED);
        const createdUser2 = await usersTestsUtils.createUser(newUserRequestData2, HTTP_STATUS_CODES.SUCCESS_CREATED);
        const createdUser3 = await usersTestsUtils.createUser(newUserRequestData3, HTTP_STATUS_CODES.SUCCESS_CREATED);
        userDevicesCollection.push(createdUser1.body, createdUser2.body, createdUser3.body);
        const users = await request(app)
        .get(ROUTERS_PATH_ENUM.USERS)
        .auth('admin', 'qwerty');
        expect(users.body).toEqual({ pagesCount: 1, page: 1, pageSize: 10, totalCount: 4, items: userDevicesCollection})
    });

    it('- Shouldn\'t login user with incorrect data', async () => {
        const loginUser = await authTestsUtils.loginUser({loginOrEmail: 'bbb', password: 'aaa'}, HTTP_STATUS_CODES.UNAUTHORIZED);
        expect(loginUser.body).toEqual({});
    });

    it('- Should return error model with incorrect data model', async () => {
        const loginUser = await authTestsUtils.loginUser({loginOrEmail: 1, password: 'aaa'}, HTTP_STATUS_CODES.BAD_REQUEST);
        expect(loginUser.body).toEqual({ errorsMessages: [ { message: expect.any(String), field: 'loginOrEmail' } ] });
    });

    it('- Should login user with correct data', async () => {
        const loginUser = await authTestsUtils.loginUser({loginOrEmail: userDevicesCollection[0].login, password: userPassword}, HTTP_STATUS_CODES.SUCCESS_RESPONSE, 'Iphone');
        usersAccessTokens.device1 = loginUser.body;
        usersRefreshTokens.device1 = loginUser.headers['set-cookie'][0].split(' ')[0].slice(13);
        expect(usersAccessTokens.device1).toEqual({accessToken: expect.any(String)});
        expect(usersRefreshTokens.device1).toEqual(expect.any(String));
    });

    it('- Shouldn\'t login user with incorrect refreshToken', async () => {
        const loginUser = await authTestsUtils.refreshTokenRequest('sssssss', HTTP_STATUS_CODES.UNAUTHORIZED);
        expect(loginUser.body).toEqual({});
    });

    it('- Should return new pair accessToken and refreshToken with correct data', async () => {
        const {accessToken, newRefreshToken} = await authTestsUtils.returnNewPairTokens(usersRefreshTokens.device1);
        oldToken = usersRefreshTokens.device1;
        usersAccessTokens.device1 = accessToken;
        usersRefreshTokens.device1 = newRefreshToken;
    });

    it('- Shouldn\'t logout user with incorrect refreshToken', async () => {
        const loginUser = await authTestsUtils.logoutUser(oldToken, HTTP_STATUS_CODES.UNAUTHORIZED);
        expect(loginUser.body).toEqual({});   
    });

    it('- count all active user\'s devices to be equal 1', async () => {
        const devices = await securityTestsUtils.getUserDevices(usersRefreshTokens.device1);

        expect(devices.body).toEqual([{ ip: expect.any(String), title: 'iPhone', lastActiveDate: expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/), deviceId: expect.any(String) }])
    });

    it('- Should login user on device 2 with correct data', async () => {
        const loginUser2 = await authTestsUtils.loginUser({loginOrEmail: userDevicesCollection[0].login, password: userPassword}, HTTP_STATUS_CODES.SUCCESS_RESPONSE, 'Linux');
        usersAccessTokens.device2 = loginUser2.body;
        usersRefreshTokens.device2 = loginUser2.headers['set-cookie'][0].split(' ')[0].slice(13);
        expect(usersAccessTokens.device2).toEqual({accessToken: expect.any(String)});
        expect(usersRefreshTokens.device2).toEqual(expect.any(String));
    });

    it('- Should login user on device 3 with correct data', async () => {
        const loginUser3 = await authTestsUtils.loginUser({loginOrEmail: userDevicesCollection[0].login, password: userPassword}, HTTP_STATUS_CODES.SUCCESS_RESPONSE, 'Linux');
        usersAccessTokens.device3 = loginUser3.body;
        usersRefreshTokens.device3 = loginUser3.headers['set-cookie'][0].split(' ')[0].slice(13);
        expect(usersAccessTokens.device3).toEqual({accessToken: expect.any(String)});
        expect(usersRefreshTokens.device3).toEqual(expect.any(String));
    });

    it('- Should login tree users on device 4 with correct data', async () => {
        const loginUser4 = await authTestsUtils.loginUser({loginOrEmail: userDevicesCollection[0].login, password: userPassword}, HTTP_STATUS_CODES.SUCCESS_RESPONSE, 'Android');
        usersAccessTokens.device4 = loginUser4.body;
        usersRefreshTokens.device4 = loginUser4.headers['set-cookie'][0].split(' ')[0].slice(13);
        expect(usersAccessTokens.device4).toEqual({accessToken: expect.any(String)});
        expect(usersRefreshTokens.device4).toEqual(expect.any(String));
    });

    it('- Should login another user', async () => {
        const loginUser4 = await authTestsUtils.loginUser({loginOrEmail: userDevicesCollection[1].login, password: userPassword}, HTTP_STATUS_CODES.SUCCESS_RESPONSE, 'Android');
        usersAccessTokens.device5 = loginUser4.body;
        usersRefreshTokens.device5 = loginUser4.headers['set-cookie'][0].split(' ')[0].slice(13);
        expect(usersAccessTokens.device5).toEqual({accessToken: expect.any(String)});
        expect(usersRefreshTokens.device5).toEqual(expect.any(String));
    });

    it('- Should return new pair accessToken and refreshToken with correct data  on device 2', async () => {
        const {accessToken, newRefreshToken} = await authTestsUtils.returnNewPairTokens(usersRefreshTokens.device2)
        usersAccessTokens.device2 = accessToken;
        usersRefreshTokens.device2 = newRefreshToken;
    });

    it('- Should return new pair accessToken and refreshToken with correct data  on device 3', async () => {
        const {accessToken, newRefreshToken} = await authTestsUtils.returnNewPairTokens(usersRefreshTokens.device3)
        usersAccessTokens.device3 = accessToken;
        usersRefreshTokens.device3 = newRefreshToken;
    });

    it('- Should return new pair accessToken and refreshToken with correct data  on device 4', async () => {
        const {accessToken, newRefreshToken} = await authTestsUtils.returnNewPairTokens(usersRefreshTokens.device4)
        usersAccessTokens.device4 = accessToken;
        usersRefreshTokens.device4 = newRefreshToken;
    });

    it('- Shouldn\'t logout user with incorrect refreshToken', async () => {
        const loginUser = await authTestsUtils.logoutUser('sssssss', HTTP_STATUS_CODES.UNAUTHORIZED);
        expect(loginUser.body).toEqual({});   
    });

    it('-  "/auth/logout": should make the refresh token invalid', async () => {
        const loginUser = await authTestsUtils.logoutUser(usersRefreshTokens.device4, HTTP_STATUS_CODES.SUCCESS_NO_CONTENT);
        const checkRefreshToken = await authTestsUtils.logoutUser(usersRefreshTokens.device4, HTTP_STATUS_CODES.UNAUTHORIZED);
        expect(checkRefreshToken.body).toEqual({});
    });

    it('- Should return 429 error , it is too mane attempts from ip', async () => {
        await authTestsUtils.loginUser({loginOrEmail: 'aaaaaaaa', password: 'vvvvvvvv'}, HTTP_STATUS_CODES.UNAUTHORIZED, 'Android');
        await authTestsUtils.loginUser({loginOrEmail: 'aaaaaaaa', password: 'vvvvvvvv'}, HTTP_STATUS_CODES.UNAUTHORIZED, 'Android');
        await authTestsUtils.loginUser({loginOrEmail: 'aaaaaaaa', password: 'vvvvvvvv'}, HTTP_STATUS_CODES.UNAUTHORIZED, 'Android');
        await authTestsUtils.loginUser({loginOrEmail: 'aaaaaaaa', password: 'vvvvvvvv'}, HTTP_STATUS_CODES.UNAUTHORIZED, 'Android');
        await authTestsUtils.loginUser({loginOrEmail: 'aaaaaaaa', password: 'vvvvvvvv'}, HTTP_STATUS_CODES.UNAUTHORIZED, 'Android');
        await authTestsUtils.loginUser({loginOrEmail: 'aaaaaaaa', password: 'vvvvvvvv'}, HTTP_STATUS_CODES.RATE_LIMITING, 'Android');
    });

});