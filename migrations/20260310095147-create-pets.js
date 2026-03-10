'use strict';

/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pets', {
      id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        type: Sequelize.STRING

      },

      species: {
        type: Sequelize.STRING,
        comment: "dog|cat"
      },

      breed: {
        type: Sequelize.STRING
      },

      age: {
        type: Sequelize.INTEGER
      },

      gender: {
        type: Sequelize.STRING,
        comment: "male|female"
      },

      vaccinated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      sterilized: {
        type: Sequelize.STRING
      },

      special_needs: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      health_status: {
        type: Sequelize.TEXT
      },

      temperament: {
        type: Sequelize.TEXT
      },

      rescue_story: {
        type: Sequelize.TEXT
      },

      adoption_fee: {
        type: Sequelize.INTEGER
      },

      status: {
        type: Sequelize.STRING,
        defaultValue: "Available"
      },

      good_with_kids: {
        type: Sequelize.BOOLEAN
      },

      shelter_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      listed_at: {
        type: Sequelize.DATE
      },

      adopted_at: {
        type: Sequelize.DATE
      },

      deleted_at: {
        type: Sequelize.DATE
      },

      created_by: {
        type: Sequelize.INTEGER
      },

      updated_by: {
        type: Sequelize.INTEGER
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Pets');
  }
};