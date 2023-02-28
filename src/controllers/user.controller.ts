import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { CREATED } from 'http-status';

/**
 * Creates a new
 * user profile.
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
export async function CreateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Saving a user
    const { firstName, lastName, email, password, role } = req.body;

    const passwordHashed = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: passwordHashed,
      role: role,
    });
    return res.status(CREATED).json({
      newUser,
    });
  } catch (error) {
    next(error);
  }
}
