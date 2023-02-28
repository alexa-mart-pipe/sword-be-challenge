import { NextFunction, Request, Response } from 'express';
import { UNAUTHORIZED } from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

export interface RequestWithToken extends Request {
  token: string | Token;
}

export interface Token extends JwtPayload {
  email: string;
  fullName: string;
  role: string;
  id: number;
}

/**
 * Checks if the "user" property is
 * set on the request and if the role is Manager,
 * which will be
 * if a valid Bearer token was sent
 * in the request previously.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export async function managerAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getAndVerifyToken(req);

    if (token.role !== UserRole.Manager)
      return res.status(UNAUTHORIZED).json({
        message: 'This content is only accessible for managers.',
      });

    (req as RequestWithToken).token = token;
    next();
  } catch (err) {
    return res.status(UNAUTHORIZED).json({
      message: 'User is not authorized to access this page.',
    });
  }
}

/**
 * Checks if the "user" property is
 * set on the request and if the role is Manager,
 * which will be
 * if a valid Bearer token was sent
 * in the request previously.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export async function technicianAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getAndVerifyToken(req);

    if (token.role !== UserRole.Technician)
      return res.status(UNAUTHORIZED).json({
        message: 'This content is only accessible for technicians.',
      });

    (req as RequestWithToken).token = token;

    next();
  } catch (err) {
    return res.status(UNAUTHORIZED).json({
      message: 'User is not authorized to access this page.',
    });
  }
}

export async function taskUserAuthorization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = getAndVerifyToken(req);

    if (token.role !== UserRole.Technician && token.role !== UserRole.Manager)
      return res.status(UNAUTHORIZED).json({
        message: 'This content is only accessible for task users.',
      });

    (req as RequestWithToken).token = token;

    next();
  } catch (err) {
    return res.status(UNAUTHORIZED).json({
      message: 'User is not authorized to access this page.',
    });
  }
}

const getAndVerifyToken = (req: Request) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) throw new Error('No token was found.');

  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET ?? '');

  return verifiedToken as Token;
};
