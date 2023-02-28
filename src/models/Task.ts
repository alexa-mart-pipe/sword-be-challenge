import { Optional, DataTypes, Model, ForeignKey } from 'sequelize';
import sequelize from '../database';
import User, { UserAttributes, UserModel } from './User';

export interface TaskAttributes {
  id: number;
  userId: ForeignKey<UserAttributes['id']>;
  performedAt: Date;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

type TaskCreationAttributes = Optional<
  TaskAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

interface TaskModel extends Model<TaskAttributes, TaskCreationAttributes> {}

export const Task = sequelize.define<TaskModel>('Tasks', {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.BIGINT,
    references: {
      model: {
        tableName: 'Users',
        schema: 'schema',
      },
      key: 'id',
    },
    allowNull: false,
  },
  performedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
});

export default User;
