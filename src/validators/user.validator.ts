import { check } from 'express-validator';
import { UserRole } from '../models/User';

export const createUserValidator = [
  check('email')
    .trim()
    .normalizeEmail()
    .not()
    .isEmpty()
    .withMessage('Email cannot be empty.')
    .bail()
    .isEmail()
    .withMessage('Email is not in a valid format.')
    .bail(),
  check('firstName')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('First name cannot be empty.')
    .bail(),
  check('lastName')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Last name cannot be empty.')
    .bail(),
  check('password')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Password cannot be empty.')
    .bail(),
  check('role')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Role cannot be empty.')
    .bail()
    .isIn([UserRole.Manager, UserRole.Technician])
    .withMessage('Role must be a valid value.')
    .bail(),
];
