import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    if (!req.uploadFolder) {
      req.uploadFolder = `shelters/temp_${Date.now()}`;
    }
    return {
      folder: req.uploadFolder,
      public_id: `${Date.now()}_${file.fieldname}`,
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      resource_type: "auto",
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPEG, PNG files are allowed"));
    }
  },
});

export default upload;
