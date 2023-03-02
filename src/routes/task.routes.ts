import { create } from 'domain';
import express, { Router } from 'express';
import {
  CreateTask,
  DeleteTask,
  GetAllTasks,
  UpdateTask,
} from '../controllers/task/task.controller';
import {
  managerAuthorization,
  taskUserAuthorization,
  technicianAuthorization,
} from '../middleware/authorizationHandling';
import {
  createTaskValidator,
  updateTaskValidator,
} from '../validators/task.validator';
import { validate } from '../validators/validator';

const router: Router = express.Router();

router.post(
  '/',
  createTaskValidator,
  [technicianAuthorization, validate],
  CreateTask,
);

router.patch(
  '/:taskId',
  updateTaskValidator,
  [technicianAuthorization, validate],
  UpdateTask,
);

router.delete('/:taskId', [managerAuthorization], DeleteTask);

router.get('/all', [taskUserAuthorization], GetAllTasks);

export default router;
