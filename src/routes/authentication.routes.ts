import express, { Router } from 'express';
import { Login } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/login', Login);

export default router;
