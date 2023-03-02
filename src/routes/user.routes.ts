import express, { Router } from 'express';
import { CreateUser } from '../controllers/user/user.controller';
import { createUserValidator } from '../validators/user.validator';
import { validate } from '../validators/validator';

const router: Router = express.Router();

router.post('/', createUserValidator, validate, CreateUser);

export default router;
