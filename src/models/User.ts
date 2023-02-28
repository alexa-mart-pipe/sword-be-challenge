import { Optional, DataTypes, Model } from 'sequelize';
import sequelize from '../database';

export enum UserRole {
  Manager = 'Manager',
  Technician = 'Technician',
}

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface UserModel
  extends Model<UserAttributes, UserCreationAttributes> {}

const User = sequelize.define<UserModel>('Users', {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    autoIncrement: true,
    unique: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM, //NOTE: Could be a separate table. For the sake of simplicity, here I created an enum
    values: [UserRole.Manager, UserRole.Technician],
    allowNull: false,
  },
  createdAt: { type: DataTypes.DATE, allowNull: false },
  updatedAt: { type: DataTypes.DATE, allowNull: false },
});

export default User;
