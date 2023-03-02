import { NextFunction, Request, Response } from 'express';
import { CREATED, FORBIDDEN, NOT_FOUND, OK } from 'http-status';
import { FindOptions } from 'sequelize';
import { Task } from '../../models/Task';
import { UserRole } from '../../models/User';
import { decrypt, encrypt } from '../../utils/encryption';
import { RequestWithToken, Token } from '../../utils/token';

export async function CreateTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = (req as RequestWithToken).token as Token;

    const { performedAt, summary } = req.body;

    const encryptedSummary = encrypt(summary);

    const newTask = await Task.create({
      userId: token.id,
      performedAt,
      summary: encryptedSummary,
    });

    if (!newTask)
      throw new Error('A problem has occurred during task creation in the db.');

    return res.status(CREATED).json(newTask);
  } catch (error) {
    next(error);
  }
}

export async function UpdateTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = (req as RequestWithToken).token as Token;
    const { performedAt, summary } = req.body;
    const { taskId } = req.params;

    const task = await Task.findOne({ where: { id: taskId } });

    if (!task) {
      res.status(NOT_FOUND).json({
        message: 'Task not found.',
      });

      next();
    }

    if (token.id !== task?.dataValues.userId) {
      res.status(FORBIDDEN).json({
        message: 'Cannot update another technicians task.',
      });

      next();
    }

    let updateRequest: { performedAt?: Date; summary?: string } = {};

    if (performedAt) updateRequest.performedAt = performedAt;
    if (summary) updateRequest.summary = summary;

    if (!performedAt && !summary) {
      res.status(OK).json({ message: 'No change.' });
    } else {
      const updatedTask = await Task.update(updateRequest, {
        where: { id: taskId },
      });

      res.status(OK).json({ taskId: updatedTask[0] });
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function DeleteTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { taskId } = req.params;

    const task = await Task.findOne({ where: { id: taskId } });

    if (!task) {
      res.status(NOT_FOUND).json({
        message: 'Task not found.',
      });

      next();
    }

    await Task.destroy({
      where: { id: taskId },
    });

    res.status(OK).json({
      message: 'Task deleted.',
    });

    next();
  } catch (error) {
    next(error);
  }
}

export async function GetAllTasks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = (req as RequestWithToken).token as Token;

    let opts: FindOptions = {};

    if (token.role === UserRole.Technician) {
      opts = { where: { userId: token.id } };
    }

    const tasks = await Task.findAll(opts);

    const mappedTasks = tasks.map((task) => {
      const data = task.dataValues;

      return { ...data, summary: decrypt(data.summary) };
    });

    res.status(OK).json(mappedTasks);
  } catch (error) {
    next(error);
  }
}
