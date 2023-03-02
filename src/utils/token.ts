import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface RequestWithToken extends Request {
  token: string | Token;
}

export interface Token extends JwtPayload {
  email: string;
  fullName: string;
  role: string;
  id: number;
}

export const getAndVerifyToken = (req: Request) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) throw new Error('No token was found.');

  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET ?? '');

  return verifiedToken as Token;
};
