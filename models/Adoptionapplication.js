import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class AdoptionApplication extends Model {
    static associate(models) {
      AdoptionApplication.belongsTo(models.User, {
        foreignKey: "userId",
        as: "applicant",
      });
      AdoptionApplication.belongsTo(models.Pet, {
        foreignKey: "petId",
        as: "pet",
      });
      AdoptionApplication.belongsTo(models.Shelter, {
        foreignKey: "shelterId",
        as: "shelter",
      });
    }
  }

  AdoptionApplication.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      petId: { type: DataTypes.INTEGER, allowNull: false },
      shelterId: { type: DataTypes.INTEGER, allowNull: false },
      first_name: { type: DataTypes.STRING(50), allowNull: false },
      last_name: { type: DataTypes.STRING(50), allowNull: true },
      phoneNumber: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      petExperienceYears: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      currentOccupation: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: false },
      livingArrangement: {
        type: DataTypes.ENUM("Family", "I live alone", "House/Room mates"),
        allowNull: false,
      },
      familyAgreement: {
        type: DataTypes.ENUM("Yes", "No", "N/A"),
        allowNull: false,
        defaultValue: "N/A",
      },
      landlordAllowsPets: {
        type: DataTypes.ENUM("Yes", "No", "I am the owner"),
        allowNull: false,
      },
      petCareWhenAway: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "approved",
          "rejected",
          "home_visit",
          "completed",
        ),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "AdoptionApplication",
      tableName: "AdoptionApplications",
    },
  );

  return AdoptionApplication;
};
