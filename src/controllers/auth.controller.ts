import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED, NOT_FOUND, OK, BAD_REQUEST } from 'http-status';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { UserAttributes } from '../models/User';

export async function Login(req: Request, res: Response, next: NextFunction) {
  try {
    const email = req.body?.email;
    const password = req.body?.password;

    if (!email || !password) {
      res.status(BAD_REQUEST).json({
        message: 'Invalid request. Missing parameters: email or password.',
      });

      next();
    }

    const user: UserAttributes | undefined = await User.findOne({
      where: { email: email },
    }).then((u) => u?.dataValues);

    if (!user) {
      res.status(NOT_FOUND).json({
        message: 'User not found.',
      });

      next();
    }

    if (!bcrypt.compareSync(password, user?.password ?? '')) {
      return res.status(UNAUTHORIZED).json({
        message: 'Unauthorized request. Wrong email or password.',
      });
    }

    return res.status(OK).json({
      message: 'Login successful.',
      token: jwt.sign(
        {
          email: user?.email,
          fullName: `${user?.firstName} ${user?.lastName}`,
          role: user?.role,
          id: user?.id,
        },
        process.env.JWT_SECRET ?? '',
      ),
    });
  } catch (error) {
    next(error);
  }
}
