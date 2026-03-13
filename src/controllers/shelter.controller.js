import db from "../../models/index.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const { Shelter, ShelterNgoDetails, ShelterFiles } = db;

/*
 GET /api/shelters/:id
 Get shelter details
*/
export const getShelterById = async (req, res) => {
  try {
    const { id } = req.params;

    const shelter = await Shelter.findByPk(id);

    if (!shelter) {
      return res.status(404).json({
        message: "Shelter not found",
      });
    }

    res.json(shelter);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createNgoShelter = async (req, res) => {
  try {
    const {
      name,
      type,
      registration_type,
      registration_number,
      year_of_registration,
      city,
      state,
      country,
      zipcode,
      contact_email,
      contact_phone,
    } = req.body;

    if (
      !name ||
      !type ||
      !registration_type ||
      !registration_number ||
      !year_of_registration ||
      !city ||
      !state ||
      !country ||
      !zipcode ||
      !contact_email ||
      !contact_phone
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files?.registration_certificate) {
      return res
        .status(400)
        .json({ message: "Registration certificate is required" });
    }
    // Check if user already has a shelter
const existingShelter = await Shelter.findOne({ 
  where: { owner_id: req.user.id } 
});

if (existingShelter) {
  return res.status(409).json({ 
    message: "You already have a shelter registered" 
  });
}

    const shelter = await Shelter.create({
      name,
      type,
      city,
      state,
      country,
      zipcode,
      contact_email,
      contact_phone,
      owner_id: req.user.id,
    });

    const ngoDetails = await ShelterNgoDetails.create({
      shelter_id: shelter.id,
      registration_type,
      registration_number,
      year_of_registration,
    });

    const moveFile = async (oldPublicId, resourceType = "image") => {
      const newPublicId = oldPublicId.replace(
        /shelters\/temp_\d+/,
        `shelters/shelter_${shelter.id}`,
      );

      await cloudinary.uploader.rename(oldPublicId, newPublicId, {
        resource_type: resourceType,
      });

      return newPublicId;
    };

    const fileRecords = [];

    const certFile = req.files.registration_certificate[0];

    const certResourceType =
      certFile.mimetype === "application/pdf" ? "raw" : "image";
    const newCertPublicId = await moveFile(certFile.filename, certResourceType);
    fileRecords.push(
      await ShelterFiles.create({
        shelter_id: shelter.id,
        file_url: certFile.path.replace(certFile.filename, newCertPublicId),
        public_id: newCertPublicId,
        file_type: "registration_certificate",
      }),
    );

    if (req.files?.additional_document) {
      for (const file of req.files.additional_document) {
        const resourceType =
          file.mimetype === "application/pdf" ? "raw" : "image";
        const newPublicId = await moveFile(file.filename, resourceType);
        fileRecords.push(
          await ShelterFiles.create({
            shelter_id: shelter.id,
            file_url: file.path.replace(file.filename, newPublicId),
            public_id: newPublicId,
            file_type: "additional_document",
          }),
        );
      }
    }

    res.status(201).json({
      message: "NGO shelter registered successfully",
      shelter_id: shelter.id,
      ngo_details: ngoDetails,
      files: fileRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
