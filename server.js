const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");

// Database connection using Sequelize
const sequelize = new Sequelize("postgres", "postgres", "postgres", {
  host: "db",
  dialect: "postgres",
});

// Define the User model
const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discord: DataTypes.STRING,
  lodestoneid: DataTypes.STRING,
  lodestoneimage: DataTypes.STRING,
  raidmember: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  ninemember: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

// Define the Raidfloor model
const Raidfloor = sequelize.define("Raidfloor", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.STRING,
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

// Define the Raiditem model
const Raiditem = sequelize.define("Raiditem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isweapon: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  haslist: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  raidimage: DataTypes.STRING,
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

// Define the Itemdrops model with associations
const Itemdrop = sequelize.define("Itemdrop", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
});

// Define Associations
User.hasMany(Itemdrop, { foreignKey: "userid" });
Itemdrop.belongsTo(User, { foreignKey: "userid" });

Raiditem.hasMany(Itemdrop, { foreignKey: "itemid" });
Itemdrop.belongsTo(Raiditem, { foreignKey: "itemid" });

Raidfloor.hasMany(Itemdrop, { foreignKey: "floorid" });
Itemdrop.belongsTo(Raidfloor, { foreignKey: "floorid" });

// Sync all models
sequelize
  .sync({ alter: true })
  .then(() => console.log("Database synced successfully."))
  .catch((err) => console.error("Failed to sync database:", err));

// Express App Setup
const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;

// Utility function for CRUD operations
const handleCRUD = (Model, idField = "id") => {
  // Create
  app.post(`/${Model.name.toLowerCase()}s`, async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Read all
  app.get(`/${Model.name.toLowerCase()}s`, async (req, res) => {
    try {
      const items = await Model.findAll();
      res.status(200).json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Read by ID
  app.get(`/${Model.name.toLowerCase()}s/:id`, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (item) res.status(200).json(item);
      else res.status(404).json({ error: `${Model.name} not found` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update by ID
  app.put(`/${Model.name.toLowerCase()}s/:id`, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (item) {
        await item.update(req.body);
        res.status(200).json(item);
      } else {
        res.status(404).json({ error: `${Model.name} not found` });
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete by ID
  app.delete(`/${Model.name.toLowerCase()}s/:id`, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (item) {
        await item.destroy();
        res.status(204).send();
      } else {
        res.status(404).json({ error: `${Model.name} not found` });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// Initialize CRUD Routes for all models
handleCRUD(User);
handleCRUD(Raidfloor);
handleCRUD(Raiditem);
handleCRUD(Itemdrop);

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
