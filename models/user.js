import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.AdoptionApplication, { 
        foreignKey: 'userId', 
        as: 'adoptionApplications' });
    } 
  }

  User.init(
    {
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.BIGINT,
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      otp: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      role: {
        type: DataTypes.ENUM("adopter", "admin", "shelter"),
        defaultValue: "adopter",
      },
      account_status: {
        type: DataTypes.ENUM("Active", "Pending", "Banned"),
        defaultValue: "Pending",
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      living_situation: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pet_experience_years: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      preferred_species: {
        type: DataTypes.ENUM("dog", "cat", "both"),
        allowNull: true,
      },
      profile_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  User.associate = (models) => {
    User.hasOne(models.Shelter, {
      foreignKey: "owner_id",
      as: "shelter",
    });

    User.hasMany(models.ShelterFiles, {
      foreignKey: "verified_by",
      as: "verified_files",
    });
  };

  return User;
};
