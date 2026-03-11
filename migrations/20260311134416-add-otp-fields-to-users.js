'use strict';

/** @type {import('sequelize-cli').Migration} */

// migration file
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'otp', {
      type: Sequelize.STRING(6),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'otp_expires_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'otp');
    await queryInterface.removeColumn('users', 'otp_expires_at');
  }
};