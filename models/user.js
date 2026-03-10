import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {}
  }

  User.init(
    {
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },

      last_name: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },

      phone: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },

      role: {
        type: DataTypes.ENUM("adopter", "admin", "shelter"),
        defaultValue: "adopter"
      },

      account_status: {
        type: DataTypes.ENUM("Active", "Pending", "Banned"),
        defaultValue: "Pending"
      },

      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },

      location: {
        type: DataTypes.STRING(100)
      },

      living_situation: {
        type: DataTypes.STRING(50)
      },

      pet_experience_years: {
        type: DataTypes.INTEGER
      },

      preferred_species: {
        type: DataTypes.ENUM("dog", "cat", "both")
      },

      profile_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },

      deleted_at: {
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",

      timestamps: true,

      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  );

  return User;
};