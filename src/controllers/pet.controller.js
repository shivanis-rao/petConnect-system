import db from "../../models/index.js";

const { Pet, Shelter, Sequelize } = db;
const { Op } = Sequelize;

/*
CREATE PET
POST /api/shelter/pets
*/
export const createPet = async (req, res) => {
  try {
    if (req.user.role !== "shelter") {
      return res.status(403).json({ error: "Only shelter users can add pets" });
    }

    const pet = await Pet.create({
      ...req.body,
      listed_at: new Date(),
      shelter_id: req.user.shelter.id, // from logged-in user
      created_by: req.user.id,
    });

    return res.status(201).json({
      message: "Pet created successfully",
      data: pet,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create pet",
      details: error.message,
    });
  }
};
/*
GET ALL PETS FOR SHELTER
GET /api/shelter/pets
*/
export const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.findAll({
      where: {
        shelter_id: req.user.shelter.id, // or req.body.shelter_id
        deleted_at: null,
      },
    });

    return res.status(200).json({
      data: pets,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch pets",
    });
  }
};
/*
GET PET BY ID
GET /api/shelter/pets/:id
*/
export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);

    if (!pet) {
      return res.status(404).json({
        error: "Pet not found",
      });
    }

    return res.status(200).json({
      data: pet,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch pet",
    });
  }
};
/*
UPDATE PET
PUT /api/shelter/pets/:id
*/
export const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);

    // First, check if the pet exists
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // Then check if logged-in user is a shelter and owns this pet
    if (
      !req.user.shelter ||
      Number(pet.shelter_id) !== Number(req.user.shelter.id)
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this pet" });
    }

    await pet.update({
      ...req.body,
      updated_by: req.user.id,
    });

    return res.status(200).json({
      message: "Pet updated successfully",
      data: pet,
    });
  } catch (error) {
    console.error("Update Pet Error:", error);
    return res.status(500).json({
      error: "Failed to update pet",
      details: error.message,
    });
  }
};
/*
UPDATE PET STATUS
PATCH /api/shelter/pets/:id/status
*/
export const updatePetStatus = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);

    if (!pet) return res.status(404).json({ error: "Pet not found" });

    if (
      !req.user.shelter ||
      Number(pet.shelter_id) !== Number(req.user.shelter.id)
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this pet" });
    }

    pet.status = req.body.status;
    if (req.body.status === "Adopted") pet.adopted_at = new Date();

    await pet.save();

    return res.status(200).json({
      message: "Pet status updated",
      data: pet,
    });
  } catch (error) {
    console.error("Update Pet Status Error:", error);
    return res.status(500).json({
      error: "Failed to update pet status",
      details: error.message,
    });
  }
};
/*
DELETE PET
DELETE /api/shelter/pets/:id
*/
export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);

    if (!pet) return res.status(404).json({ error: "Pet not found" });

    if (
      !req.user.shelter ||
      Number(pet.shelter_id) !== Number(req.user.shelter.id)
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this pet" });
    }

    await pet.update({ deleted_at: new Date() });

    return res.status(200).json({ message: "Pet listing deleted" });
  } catch (error) {
    console.error("Delete Pet Error:", error);
    return res.status(500).json({
      error: "Failed to delete pet",
      details: error.message,
    });
  }
};
export const browsePets = async (req, res) => {
  try {
    const {
      species,
      breed,
      gender,
      vaccinated,
      special_needs,
      good_with_kids,
      age_min,
      age_max,
      zipcode,
      city,
      page = 1,
      limit = 9,
      sort = "newest",
    } = req.query;

    const where = {
      deleted_at: null,
      status: "Available",
    };

    // PET FILTERS

    if (species) where.species = species;
    if (breed) where.breed = { [Op.iLike]: `%${breed}%` };

    if (gender) where.gender = gender;

    if (vaccinated !== undefined) where.vaccinated = vaccinated === "true";

    if (special_needs !== undefined)
      where.special_needs = special_needs === "true";

    if (good_with_kids !== undefined)
      where.good_with_kids = good_with_kids === "true";

    if (age_min || age_max) {
      where.age = {};
      if (age_min) where.age[Op.gte] = age_min;
      if (age_max) where.age[Op.lte] = age_max;
    }

    // SHELTER LOCATION FILTER

    const shelterFilter = {};

    // if (zipcode) shelterFilter.zipcode = zipcode;

    if (city) shelterFilter.city = { [Op.iLike]: `%${city}%` };

    // PAGINATION

    const offset = (page - 1) * limit;

    // SORTING

    let order = [["listed_at", "DESC"]];

    if (sort === "oldest") {
      order = [["listed_at", "ASC"]];
    }//gives the newest listed pets 

    const pets = await Pet.findAndCountAll({
      where,
      include: [
        {
          model: Shelter,
          as: "shelter",
          attributes: ["name", "city", "state", "zipcode"],
          where: Object.keys(shelterFilter).length ? shelterFilter : undefined,
          required: Object.keys(shelterFilter).length ? true : false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
    });

    return res.status(200).json({
      total: pets.count,
      page: Number(page),
      totalPages: Math.ceil(pets.count / limit),
      pets: pets.rows,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to browse pets",
      details: error.message,
    });
  }
};
