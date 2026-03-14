import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Pet extends Model {
    static associate(models) {

      // Shelter relation
      Pet.belongsTo(models.Shelter, {
        foreignKey: "shelter_id",
        as: "shelter",
      });

      // Created by user
      Pet.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });

      // Updated by user
      Pet.belongsTo(models.User, {
        foreignKey: "updated_by",
        as: "updater",
      });
      Pet.hasMany(models.AdoptionApplication, { 
        foreignKey: 'petId', 
        as: 'adoptionApplications' 
      });

    }
  }

  Pet.init(
    {
      name: DataTypes.STRING,

      species: DataTypes.STRING,

      breed: DataTypes.STRING,

      age: DataTypes.INTEGER,

      gender: DataTypes.STRING,

      vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      sterilized: {
        type: DataTypes.ENUM(
          "not_sterilized",
          "neutered",
          "spayed"
        ),
      },

      special_needs: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      health_status: DataTypes.TEXT,

      temperament: DataTypes.TEXT,

      rescue_story: DataTypes.TEXT,

      adoption_fee: DataTypes.INTEGER,

      status: {
        type: DataTypes.ENUM(
          "Available",
          "Reserved",
          "Adopted",
          "OnHold"
        ),
        defaultValue: "Available",
      },

      good_with_kids: DataTypes.BOOLEAN,

      shelter_id: DataTypes.INTEGER,

      listed_at: DataTypes.DATE,

      adopted_at: DataTypes.DATE,

      deleted_at: DataTypes.DATE,

      created_by: DataTypes.INTEGER,

      updated_by: DataTypes.INTEGER,
    },
    {
      sequelize,
  modelName: "Pet",
  tableName: "pets",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
    }
  );

  return Pet;
};