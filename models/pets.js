import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Pet extends Model {
    static associate(models) {
      Pet.belongsTo(models.Shelter, {
        foreignKey: "shelter_id",
        as: "shelter",
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

      sterilized: DataTypes.STRING,

      special_needs: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      health_status: DataTypes.TEXT,
      temperament: DataTypes.TEXT,
      rescue_story: DataTypes.TEXT,

      adoption_fee: DataTypes.INTEGER,

      status: DataTypes.STRING,

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
    }
  );

  return Pet;
};