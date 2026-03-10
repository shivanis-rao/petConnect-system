// models/user.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      // define associations here
      // Example: User.hasMany(models.Post);
    }
  }

  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users", // optional
      timestamps: true, // optional
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
