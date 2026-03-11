// // models/index.js
// import { pathToFileURL } from "url";
// import Sequelize from "sequelize";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// // Load .env variables
// dotenv.config();

// // Convert ES module meta to __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const db = {};

// // Determine environment
// const env = process.env.NODE_ENV || "development";

// // Build config from env variables
// const config = {
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   host: process.env.DB_HOST,
//   dialect: process.env.DB_DIALECT || "postgres",
// };

// // Initialize Sequelize
// const sequelize = new Sequelize(config.database, config.username, config.password, {
//   host: config.host,
//   dialect: config.dialect,
// });

// // Dynamically import models
// const modelFiles = fs
//   .readdirSync(__dirname)
//   .filter(
//     file =>
//       file.indexOf(".") !== 0 &&
//       file !== path.basename(__filename) &&
//       file.slice(-3) === ".js" &&
//       !file.endsWith(".test.js")
//   );

// for (const file of modelFiles) {
//   const modelModule = await import(path.join(__dirname, file));
//   const model = modelModule.default(sequelize, Sequelize.DataTypes);
  
//   db[model.name] = model;
// }

// // Apply associations
// for (const modelName of Object.keys(db)) {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// }

// // Export db object
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// export default db;

import Sequelize from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load .env variables
dotenv.config();

// Convert ES module meta to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

// Determine environment
const env = process.env.NODE_ENV || "development";

// Build config from env variables
const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || "postgres",
};

// Initialize Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
});

// Dynamically import models
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    file =>
      file.indexOf(".") !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === ".js" &&
      !file.endsWith(".test.js")
  );

for (const file of modelFiles) {
  console.log("Loading model:", file);
  const modelModule = await import(path.join(__dirname, file));
  const model = modelModule.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Apply associations
for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
}

// Export db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;