import db from "../../models/index.js";

const Pet = db.Pet;

/*
CREATE PET
POST /api/shelter/pets
*/
export const createPet = async (req, res) => {
  try {

    const pet = await Pet.create({
      ...req.body,
      listed_at: new Date()
    });

    return res.status(201).json({
      message: "Pet created successfully",
      data: pet
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to create pet",
      details: error.message
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
        shelter_id: req.user?.id, // or req.body.shelter_id
        deleted_at: null
      }
    });

    return res.status(200).json({
      data: pets
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch pets"
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
        error: "Pet not found"
      });
    }

    return res.status(200).json({
      data: pet
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch pet"
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

    if (!pet) {
      return res.status(404).json({
        error: "Pet not found"
      });
    }

    await pet.update({
      ...req.body,
      updated_by: req.user?.id
    });

    return res.status(200).json({
      message: "Pet updated successfully",
      data: pet
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to update pet"
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

    if (!pet) {
      return res.status(404).json({
        error: "Pet not found"
      });
    }

    pet.status = req.body.status;

    if (req.body.status === "Adopted") {
      pet.adopted_at = new Date();
    }

    await pet.save();

    return res.status(200).json({
      message: "Pet status updated",
      data: pet
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to update status"
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

    if (!pet) {
      return res.status(404).json({
        error: "Pet not found"
      });
    }

    await pet.update({
      deleted_at: new Date()
    });

    return res.status(200).json({
      message: "Pet listing deleted"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete pet"
    });
  }
};