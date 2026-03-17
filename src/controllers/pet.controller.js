import { v2 as cloudinary } from "cloudinary";
import db from "../../models/index.js";


const { Pet, PetImage,Shelter, Sequelize } = db;
const { Op } = Sequelize;

// ADD THIS at the top of pet.controller.js after imports
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

/*
CREATE PET
POST /api/shelter/pets
*/

// REPLACE your existing moveFile and saveImages with this

const imageInclude = {
  model: PetImage,
  as: "images",
  attributes: ["id", "file_url", "public_id", "display_order"],
};

// REPLACE moveFile and saveImages with this simpler version

const saveImages = async (petId, files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // file.path = full Cloudinary URL already — just save it directly
    // file.filename = public_id including folder
    await PetImage.create({
      pet_id: petId,
      file_url: file.path,       // direct Cloudinary URL — no rename needed
      public_id: file.filename,  // full public_id with folder
      display_order: i,
    });
  }
};
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
    if (req.files?.length) {
      await saveImages(pet.id, req.files);
    }

    // ADD THIS — re-fetch pet with images included
    const petWithImages = await Pet.findByPk(pet.id, {
      include: [imageInclude],
    });

    return res.status(201).json({
      message: "Pet created successfully",
      data: petWithImages,
    });
  } catch (error) {
    console.error("Create Pet Error:", error); // ADD THIS
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
      include: [imageInclude],  
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
    const pet = await Pet.findByPk(req.params.id, {
      include: [imageInclude],          // ADD THIS
    });

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

    if (req.files?.length) {
      const oldImages = await PetImage.findAll({ where: { pet_id: pet.id } });
      for (const img of oldImages) {
        await cloudinary.uploader.destroy(img.public_id, { resource_type: "image" });
      }
      await PetImage.destroy({ where: { pet_id: pet.id } });
      await saveImages(pet.id, req.files);
    }

    const updated = await Pet.findByPk(pet.id, { include: [imageInclude] }); 

    return res.status(200).json({
      message: "Pet updated successfully",
      data: updated,
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

    const images = await PetImage.findAll({ where: { pet_id: pet.id } });
    for (const img of images) {
      await cloudinary.uploader.destroy(img.public_id, { resource_type: "image" });
    }
    await PetImage.destroy({ where: { pet_id: pet.id } });

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
        imageInclude,
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
