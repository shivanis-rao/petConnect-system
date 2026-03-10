"use strict";

export default (sequelize, DataTypes) => {
  const Shelter = sequelize.define(
    "Shelter",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 100],
        },
      },

      description: {
        type: DataTypes.TEXT,
      },

      type: {
        type: DataTypes.ENUM("ngo", "government", "rescuer"),
        allowNull: false,
      },

      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },

      approved_by: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
        },
      },

      status: {
        type: DataTypes.ENUM("Pending", "Verified", "Rejected", "Inactive"),
        defaultValue: "Pending",
      },

      contact_email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      contact_phone: {
        type: DataTypes.STRING,
        validate: {
          isNumeric: true,
          len: [10, 15],
        },
      },

      city: {
        type: DataTypes.STRING,
        validate: {
          len: [2, 50],
        },
      },

      state: {
        type: DataTypes.STRING,
      },

      country: {
        type: DataTypes.STRING,
      },

      zipcode: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: true,
        },
      },

      approved_at: {
        type: DataTypes.DATE,
      },

      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "shelter",
      underscored: true,
    },
  );
  Shelter.associate = (models) => {
    Shelter.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "owner",
    });

    Shelter.belongsTo(models.User, {
      foreignKey: "approved_by",
      as: "approvedAdmin",
    });
  };

  return Shelter;
};
