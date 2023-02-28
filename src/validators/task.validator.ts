import { check } from 'express-validator';

export const createTaskValidator = [
  check('performedAt')
    .isISO8601()
    .toDate()
    .withMessage('PerformedAt is not a valid date.')
    .bail()
    .custom((value) => {
      const now = new Date();
      if (value > now) {
        throw new Error('Task cannot have been performed in the future!');
      }
      return true;
    })
    .withMessage('Task cannot have been performed in the future!')
    .bail(),
  check('summary')
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage('Summary cannot be empty.')
    .bail()
    .isLength({ max: 2500 })
    .withMessage('Summary has exceeded max length of 2500 characters.'),
];

export const updateTaskValidator = [
  check('performedAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('PerformedAt is not a valid date.')
    .bail()
    .custom((value) => {
      const now = new Date();
      if (value > now) {
        throw new Error('Task cannot have been performed in the future!');
      }
      return true;
    })
    .withMessage('Task cannot have been performed in the future!')
    .bail(),
  check('summary')
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .bail()
    .isLength({ max: 2500 })
    .withMessage('Summary has exceeded max length of 2500 characters.')
    .bail(),
];
