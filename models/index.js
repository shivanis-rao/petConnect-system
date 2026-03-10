// models/index.js
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import process from "process";
import { fileURLToPath } from "url";

// Convert ES module meta to __dirname / __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment
const env = process.env.NODE_ENV || "development";

// Load config JSON using fs + JSON.parse (avoids import assertion issues)
const configPath = path.join(__dirname, "../config/config.json");
const configJSON = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const config = configJSON[env];

const db = {};

let sequelize;

// Initialize Sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

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

// Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;