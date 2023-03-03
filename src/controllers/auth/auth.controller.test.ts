import { describe, it, jest, expect, afterEach, afterAll } from '@jest/globals';
import User, { UserAttributes, UserRole } from '../../models/User';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../';
import { BAD_REQUEST, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status';

jest.mock('../../models/User');
jest.mock('bcryptjs');

const email = 'test@test.test';
const password = 'password';

const mockedUser: UserAttributes = {
  id: 1,
  email: email,
  password: password,
  firstName: 'Test',
  lastName: 'Test',
  role: UserRole.Manager,
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterAll((done) => {
  done();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Login', () => {
  const mockedBcrypt = bcrypt.compareSync as jest.Mock;
  const mockedFindOne = User.findOne as jest.Mock;
  const findUserSpy = jest.spyOn(User, 'findOne');

  it('should fail if password is empty', async () => {
    const res = await request(app).post('/login').send({ email: email });

    expect(findUserSpy).not.toHaveBeenCalled();
    expect(res.statusCode).toEqual(BAD_REQUEST);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'Invalid request. Missing parameters: email or password.',
    );
  });

  it('should fail if email is empty', async () => {
    const res = await request(app).post('/login').send({ password: password });

    expect(findUserSpy).not.toHaveBeenCalled();
    expect(res.statusCode).toEqual(BAD_REQUEST);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'Invalid request. Missing parameters: email or password.',
    );
  });

  it('should fail if email is not found in db', async () => {
    mockedFindOne.mockImplementation(async () => {
      return Promise.resolve({});
    });

    const res = await request(app)
      .post('/login')
      .send({ email: email, password: password });

    expect(findUserSpy).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(NOT_FOUND);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('User not found.');
  });

  it('should fail if password does not match', async () => {
    mockedFindOne.mockImplementation(async () => {
      return Promise.resolve({ dataValues: { ...mockedUser } });
    });

    const res = await request(app)
      .post('/login')
      .send({ email: email, password: password });

    expect(findUserSpy).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(UNAUTHORIZED);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'Unauthorized request. Wrong email or password.',
    );
  });

  it('should login successfully', async () => {
    mockedFindOne.mockImplementation(async () => {
      return Promise.resolve({ dataValues: { ...mockedUser } });
    });
    mockedBcrypt.mockImplementation(() => {
      return true;
    });

    const res = await request(app)
      .post('/login')
      .send({ email: email, password: password });

    expect(findUserSpy).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(OK);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('Login successful.');
    expect(res.body).toHaveProperty('token');
  });
});
