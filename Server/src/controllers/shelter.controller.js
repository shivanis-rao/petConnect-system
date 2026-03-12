import db from "../../models/index.js";

const { Shelter } = db;

/*
GET ALL SHELTERS
GET /api/shelters
*/
export const getAllShelters = async (req, res) => {
  try {
    const shelters = await Shelter.findAll({
      where: { deleted_at: null },
      attributes: ["id", "name", "city", "state", "type"],
    });

    return res.status(200).json({
      total: shelters.length,
      data: shelters,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch shelters",
      details: error.message,
    });
  }
};

/*
GET SHELTER BY ID
GET /api/shelters/:id
*/
export const getShelterById = async (req, res) => {
  try {
    const shelter = await Shelter.findByPk(req.params.id, {
      attributes: ["id", "name", "city", "state", "type", "contact_email"],
    });

    if (!shelter) {
      return res.status(404).json({ error: "Shelter not found" });
    }

    return res.status(200).json({ data: shelter });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch shelter",
      details: error.message,
    });
  }
};