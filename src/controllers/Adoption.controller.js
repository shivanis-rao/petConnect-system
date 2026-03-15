import db from "../../models/index.js";
import {
  sendAdoptionRequestToShelter,
  sendAdoptionConfirmationToApplicant,
  sendStatusUpdateToApplicant,
} from "../../utils/mailer.js"; // ← your existing mailer file

const { User, Pet, Shelter, AdoptionApplication } = db;

// GET /adoption/prefill
const getAdopterPrefillData = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "first_name",
        "last_name",
        "phone",
        "email",
        "pet_experience_years",
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res
      .status(200)
      .json({ message: "Prefill data fetched successfully", data: user });
  } catch (error) {
    console.error("Error fetching prefill data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /adoption/apply/:petId
const submitAdoptionApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { petId } = req.params;
    const {
      shelterId,
      currentOccupation,
      address,
      livingArrangement,
      familyAgreement,
      landlordAllowsPets,
      petCareWhenAway,
    } = req.body;

    if (
      !shelterId ||
      !currentOccupation ||
      !address ||
      !livingArrangement ||
      !landlordAllowsPets ||
      !petCareWhenAway
    )
      return res.status(400).json({ message: "All fields are required" });

    const validLivingArrangements = [
      "Family",
      "I live alone",
      "House/Room mates",
    ];
    const validFamilyAgreement = ["Yes", "No", "N/A"];
    const validLandlord = ["Yes", "No", "I am the owner"];

    if (!validLivingArrangements.includes(livingArrangement))
      return res
        .status(400)
        .json({ message: "Invalid livingArrangement value" });
    if (familyAgreement && !validFamilyAgreement.includes(familyAgreement))
      return res.status(400).json({ message: "Invalid familyAgreement value" });
    if (!validLandlord.includes(landlordAllowsPets))
      return res
        .status(400)
        .json({ message: "Invalid landlordAllowsPets value" });

    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const shelter = await Shelter.findByPk(shelterId);
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });

    const existing = await AdoptionApplication.findOne({
      where: {
        userId,
        petId,
        status: ["pending", "approved", "home_visit", "completed"],
      },
    });
    if (existing)
      return res
        .status(409)
        .json({ message: "You have already applied for this pet" });

    const user = await User.findByPk(userId, {
      attributes: [
        "first_name",
        "last_name",
        "phone",
        "email",
        "pet_experience_years",
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const application = await AdoptionApplication.create({
      userId,
      petId,
      shelterId,
      first_name: user.first_name,
      last_name: user.last_name,
      phoneNumber: user.phone,
      email: user.email,
      petExperienceYears: user.pet_experience_years || 0,
      currentOccupation,
      address,
      livingArrangement,
      familyAgreement: familyAgreement || "N/A",
      landlordAllowsPets,
      petCareWhenAway,
      status: "pending",
    });

    // ── Send emails (non-blocking) ─────────────────────────────────────
    try {
      await sendAdoptionRequestToShelter({
        shelterEmail: shelter.contact_email,
        shelterName: shelter.name,
        applicantFirstName: user.first_name,
        applicantLastName: user.last_name,
        applicantEmail: user.email,
        applicantPhone: user.phone,
        petName: pet.name,
        petSpecies: pet.species,
        petBreed: pet.breed,
        currentOccupation,
        address,
        livingArrangement,
        familyAgreement: familyAgreement || "N/A",
        landlordAllowsPets,
        petCareWhenAway,
        petExperienceYears: user.pet_experience_years || 0,
        applicationId: application.id,
      });

      await sendAdoptionConfirmationToApplicant({
        applicantEmail: user.email,
        applicantFirstName: user.first_name,
        petName: pet.name,
        shelterName: shelter.name,
        applicationId: application.id,
      });
    } catch (emailError) {
      // Don't fail the request if email fails — application is already saved
      console.error("Email sending failed:", emailError.message);
    }

    return res.status(201).json({
      message: "Adoption application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error submitting adoption application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /adoption/my-applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await AdoptionApplication.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "species", "breed", "age"],
        },
        { model: Shelter, as: "shelter", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      message: "Applications fetched successfully",
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /adoption/:applicationId
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: [
            "id",
            "name",
            "species",
            "breed",
            "age",
            "gender",
            "vaccinated",
            "sterilized",
            "health_status",
            "temperament",
            "adoption_fee",
            "status",
          ],
        },
        {
          model: Shelter,
          as: "shelter",
          attributes: [
            "id",
            "name",
            "contact_email",
            "contact_phone",
            "city",
            "state",
            "country",
          ],
        },
      ],
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    // Only the applicant themselves can view their application
    if (application.userId !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    // Hide shelter info until shelter approves (stage 2+)
    const shelterVisibleStatuses = ["approved", "home_visit", "completed"];
    const data = application.toJSON();
    if (!shelterVisibleStatuses.includes(data.status)) {
      data.shelter = null;
    }

    return res
      .status(200)
      .json({ message: "Application fetched successfully", data });
  } catch (error) {
    console.error("Error fetching application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /adoption/shelter/:shelterId
const getApplicationsForShelter = async (req, res) => {
  try {
    const { shelterId } = req.params;
    const shelter = await Shelter.findByPk(shelterId, {
      attributes: ["id", "name", "contact_email"],
    });
    if (!shelter) return res.status(404).json({ message: "Shelter not found" });

    const applications = await AdoptionApplication.findAll({
      where: { shelterId },
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: ["id", "name", "species", "breed", "age"],
        },
        {
          model: User,
          as: "applicant",
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      message: "Shelter applications fetched successfully",
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching shelter applications:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /adoption/:applicationId/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "approved",
      "home_visit",
      "completed",
      "rejected",
    ];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        { model: Pet, as: "pet", attributes: ["id", "name"] },
        { model: Shelter, as: "shelter", attributes: ["id", "name"] },
      ],
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();

    // ── Send email notification to adopter ────────────────────────
    try {
      await sendStatusUpdateToApplicant({
        applicantEmail: application.email,
        applicantFirstName: application.first_name,
        petName: application.pet?.name,
        shelterName: application.shelter?.name,
        status,
        applicationId: application.id,
      });
    } catch (emailError) {
      console.error("Status update email failed:", emailError.message);
    }

    return res.status(200).json({
      message: `Application status updated to '${status}'`,
      data: application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /adoption/shelter/:shelterId/application/:applicationId
const getShelterApplicationById = async (req, res) => {
  try {
    const { applicationId, shelterId } = req.params;

    const application = await AdoptionApplication.findByPk(applicationId, {
      include: [
        {
          model: Pet,
          as: "pet",
          attributes: [
            "id",
            "name",
            "species",
            "breed",
            "age",
            "gender",
            //"image_url",
            "vaccinated",
            "sterilized",
            "health_status",
            "temperament",
            "adoption_fee",
            "status",
            "special_needs",
            "good_with_kids",
          ],
        },
        {
          model: User,
          as: "applicant",
          attributes: ["id", "first_name", "last_name", "email", "phone"],
        },
      ],
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    // ✅ Make sure this application belongs to this shelter
    if (String(application.shelterId) !== String(shelterId))
      return res.status(403).json({ message: "Unauthorized" });

    return res.status(200).json({
      message: "Application fetched successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error fetching shelter application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getAdopterPrefillData,
  submitAdoptionApplication,
  getMyApplications,
  getApplicationById,
  getApplicationsForShelter,
  updateApplicationStatus,
  getShelterApplicationById,
};
