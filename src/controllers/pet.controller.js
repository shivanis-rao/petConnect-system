import db from "../../models/index.js";

const { Pet, Shelter, AdoptionRequest,Sequelize } = db;
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
      adopted_at: req.body.status === 'Adopted' && !pet.adopted_at ? new Date() : pet.adopted_at,
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
    }

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
export const getAnalytics = async (req, res) => {
  try {
    const shelterId = req.user.shelter.id

    // Fetch all pets for this shelter
    const pets = await Pet.findAll({
      where: { shelter_id: shelterId, deleted_at: null },
    })

    const totalPets = pets.length
    const available = pets.filter(p => p.status === 'Available').length
    const adopted = pets.filter(p => p.status === 'Adopted').length
    const reserved = pets.filter(p => p.status === 'Reserved').length
    const onHold = pets.filter(p => p.status === 'OnHold').length
    const adoptionRate = totalPets > 0 ? Math.round((adopted / totalPets) * 100) : 0

    // Average days from listed_at to adopted_at
    const adoptedPets = pets.filter(p => p.status === 'Adopted' && p.adopted_at && p.listed_at)
    const avgDays = adoptedPets.length > 0
      ? Math.round(
          adoptedPets.reduce((sum, p) => {
            const diff = new Date(p.adopted_at) - new Date(p.listed_at)
            return sum + diff / (1000 * 60 * 60 * 24)
          }, 0) / adoptedPets.length
        )
      : 0

    // Top 5 most adopted breeds
    const breedCount = {}
    pets
      .filter(p => p.status === 'Adopted' && p.breed)
      .forEach(p => {
        breedCount[p.breed] = (breedCount[p.breed] || 0) + 1
      })
    const topBreeds = Object.entries(breedCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([breed, count]) => ({ breed, count }))

    // Adoption trend - last 6 months
    const adoptionTrend = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleString('default', { month: 'short' })
      const year = d.getFullYear()
      const month = d.getMonth()
      const count = pets.filter(p => {
        if (!p.adopted_at) return false
        const a = new Date(p.adopted_at)
        return a.getMonth() === month && a.getFullYear() === year
      }).length
      adoptionTrend.push({ month: label, adoptions: count })
    }

    // Adoption request status counts from adoption_requests table
    const requests = await AdoptionRequest.findAll({
      where: { shelter_id: shelterId },
    })
    const totalRequests = requests.length
    const pending = requests.filter(r => r.status === 'Pending').length
    const approved = requests.filter(r => r.status === 'Approved').length
    const rejected = requests.filter(r => r.status === 'Rejected').length
    const homeVisit = requests.filter(r => r.status === 'HomeVisit').length
    const interviewing = requests.filter(r => r.status === 'Interviewing').length

    return res.status(200).json({
      data: {
        totalPets,
        available,
        adopted,
        reserved,
        onHold,
        adoptionRate,
        avgDays,
        topBreeds,
        adoptionTrend,
        requests: {
          total: totalRequests,
          pending,
          approved,
          rejected,
          homeVisit,
          interviewing,
        }
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message,
    })
  }
}