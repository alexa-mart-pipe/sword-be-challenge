'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('Tasks', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.BIGINT,
        references: {
          model: {
            tableName: 'Users',
          },
          key: 'id',
        },
        allowNull: false,
      },
      performedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      summary: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // Timestamps
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('Tasks');
  },
};
