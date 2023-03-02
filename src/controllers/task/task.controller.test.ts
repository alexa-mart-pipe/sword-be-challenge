import { describe, it, jest, expect, afterEach, afterAll } from '@jest/globals';
import {
  CREATED,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
} from 'http-status';
import { FindOptions } from 'sequelize';
import request from 'supertest';
import app, { server } from '../../';
import Task, { TaskAttributes } from '../../models/Task';
import { UserRole } from '../../models/User';
import * as encryption from '../../utils/encryption';
import { getAndVerifyToken, Token } from '../../utils/token';

jest.mock('../../models/Task');
jest.mock('../../utils/token');
jest.mock('../../utils/encryption');
const mockedGetToken = getAndVerifyToken as jest.Mock;

afterAll((done) => {
  server.close(); //Close app listener between each test suite
  done();
});

afterEach(() => {
  jest.clearAllMocks(); //Clear mocks before each test (spies, implementation mocks, etc)
});

const validTechToken = {
  id: 1,
  email: 'test@test.com',
  fullName: 'Test Test',
  role: UserRole.Technician,
};

const validManagerToken = {
  id: 1,
  email: 'test@test.com',
  fullName: 'Test Test',
  role: UserRole.Manager,
};

const mockedTask: TaskAttributes = {
  id: 1,
  userId: validTechToken.id,
  performedAt: new Date(),
  summary: 'Some summary...',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Create Task', () => {
  const mockedDecryption = encryption.decrypt as jest.Mock;
  mockedDecryption.mockImplementation(() => {
    return mockedTask.summary;
  });
  const mockedTaskCreate = Task.create as jest.Mock;
  mockedTaskCreate.mockImplementation((): TaskAttributes => {
    return mockedTask;
  });

  const encryptionSpy = jest.spyOn(encryption, 'encrypt');

  const validBody = {
    performedAt: mockedTask.performedAt.toISOString(),
    summary: mockedTask.summary,
  };

  it('should fail if user is not authenticated', async () => {
    mockedGetToken.mockImplementation((): Token => {
      //Throws error to simulate a request with no token in the header
      throw new Error('No token was found.');
    });

    const res = await request(app).post('/task').send(validBody);

    expect(res.statusCode).toEqual(UNAUTHORIZED);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'User is not authorized to access this page.',
    );
  });

  it('should fail if user is not a technician', async () => {
    mockedGetToken.mockImplementation((): Token => {
      //Returns manager token
      return validManagerToken;
    });

    const res = await request(app).post('/task').send(validBody);

    expect(res.statusCode).toEqual(UNAUTHORIZED);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'This content is only accessible for technicians.',
    );
  });

  it('should fail if date is not valid', async () => {
    mockedGetToken.mockImplementation((): Token => {
      return validTechToken;
    });

    const res = await request(app)
      .post('/task')
      .send({ performedAt: 'invalid-date', summary: validBody.summary });

    expect(res.statusCode).toEqual(UNPROCESSABLE_ENTITY);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0].param).toEqual('performedAt');
    expect(res.body.errors[0].msg).toEqual('PerformedAt is not a valid date.');
  });

  it('should fail if summary is not valid', async () => {
    mockedGetToken.mockImplementation((): Token => {
      return validTechToken;
    });

    const res = await request(app)
      .post('/task')
      .send({ performedAt: validBody.performedAt, summary: '' });

    expect(res.statusCode).toEqual(UNPROCESSABLE_ENTITY);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0].param).toEqual('summary');
    expect(res.body.errors[0].msg).toEqual('Summary cannot be empty.');
  });

  it('should create task successfully', async () => {
    mockedGetToken.mockImplementation((): Token => {
      return validTechToken;
    });

    const res = await request(app).post('/task').send(validBody);

    expect(res.statusCode).toEqual(CREATED);
    expect(encryptionSpy).toHaveBeenCalledWith(validBody.summary);
    expect(res.body.userId).toEqual(validTechToken.id);
    expect(res.body.performedAt).toEqual(validBody.performedAt);
    expect(res.body.summary).toEqual(validBody.summary);
  });
});

describe('Delete Task', () => {
  const mockedTaskDelete = Task.destroy as jest.Mock;
  const mockedTaskFindOne = Task.findOne as jest.Mock;

  it('should fail if user is not authenticated', async () => {
    mockedGetToken.mockImplementation((): Token => {
      //Throws error to simulate a request with no token in the header
      throw new Error('No token was found.');
    });

    const res = await request(app).delete(`/task/${mockedTask.id}`);

    expect(res.statusCode).toEqual(UNAUTHORIZED);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'User is not authorized to access this page.',
    );
  });

  it('should fail if user is not a manager', async () => {
    mockedGetToken.mockImplementation((): Token => {
      //Returns technician token
      return validTechToken;
    });

    const res = await request(app).delete(`/task/${mockedTask.id}`);

    expect(res.statusCode).toEqual(UNAUTHORIZED);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'This content is only accessible for managers.',
    );
  });

  it('should fail if task is not found', async () => {
    mockedGetToken.mockImplementation((): Token => {
      return validManagerToken;
    });
    mockedTaskFindOne.mockImplementation(() => {
      //Returns undefined to simulate not finding a task
      return undefined;
    });

    const res = await request(app).delete(`/task/${mockedTask.id}`);

    expect(res.statusCode).toEqual(NOT_FOUND);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('Task not found.');
  });

  it('should delete task successfully', async () => {
    mockedGetToken.mockImplementation((): Token => {
      return validManagerToken;
    });
    mockedTaskFindOne.mockImplementation(() => {
      return mockedTask.id;
    });
    mockedTaskDelete.mockImplementation(() => {
      return 1;
    });

    const res = await request(app).delete(`/task/${mockedTask.id}`);

    expect(res.statusCode).toEqual(OK);
    expect(res.body.message).toEqual('Task deleted.');
  });
});

describe('Get All Tasks', () => {
  const mockedTaskFindAll = Task.findAll as jest.Mock;
  const findAllSpy = jest.spyOn(Task, 'findAll');
  const decryptionSpy = jest.spyOn(encryption, 'decrypt');

  it('should fail if user is not authenticated', async () => {
    mockedGetToken.mockImplementation((): Token => {
      //Throws error to simulate a request with no token in the header
      throw new Error('No token was found.');
    });

    const res = await request(app).get(`/task/all`);

    expect(res.statusCode).toEqual(UNAUTHORIZED);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'User is not authorized to access this page.',
    );
  });

  it('should fail if user is neither manager nor technician', async () => {
    mockedGetToken.mockImplementation((): Token => {
      return { ...validManagerToken, role: 'Fake Role' };
    });

    const res = await request(app).get(`/task/all`);

    expect(res.statusCode).toEqual(UNAUTHORIZED);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(
      'This content is only accessible for task users.',
    );
  });

  it('should retrieve only own tasks if request is from technician', async () => {
    mockedGetToken.mockImplementation((): Token => {
      return validTechToken;
    });
    mockedTaskFindAll.mockImplementation(() => {
      return [{ dataValues: mockedTask }];
    });
    const expectedOpts: FindOptions = { where: { userId: validTechToken.id } };

    const res = await request(app).get(`/task/all`);

    expect(findAllSpy).toHaveBeenCalledWith(expectedOpts);
    expect(decryptionSpy).toHaveBeenCalledTimes(1);
    expect(decryptionSpy).toHaveBeenCalledWith(mockedTask.summary);
    expect(res.statusCode).toEqual(OK);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toEqual({
      ...mockedTask,
      performedAt: mockedTask.performedAt.toISOString(),
      createdAt: mockedTask.createdAt.toISOString(),
      updatedAt: mockedTask.updatedAt.toISOString(),
    });
  });
});
