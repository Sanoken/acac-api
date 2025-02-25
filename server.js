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
  floorimage: DataTypes.STRING,
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
  floorid: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

// Define the Alternate model
const Alternate = sequelize.define("Alternate", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  first_choice: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  second_choice: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define the Itemdrops model with associations
const Itemdrop = sequelize.define("Itemdrop", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  itemid: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userid: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

// Define the Waitinglist model
const Waitinglist = sequelize.define("Waitinglist", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  raiditemid: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userid: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

// Define Associations
User.hasMany(Itemdrop, { foreignKey: "userid" });
Itemdrop.belongsTo(User, { foreignKey: "userid" });

Raiditem.hasMany(Itemdrop, { foreignKey: "itemid" });
Itemdrop.belongsTo(Raiditem, { foreignKey: "itemid" });

Raidfloor.hasMany(Itemdrop, { foreignKey: "floorid" });
Itemdrop.belongsTo(Raidfloor, { foreignKey: "floorid" });

User.hasMany(Alternate, { foreignKey: "userid" });
Alternate.belongsTo(User, { foreignKey: "userid" });

User.hasMany(Waitinglist, { foreignKey: "userid" });
Waitinglist.belongsTo(User, { foreignKey: "userid" });

Raiditem.hasMany(Waitinglist, { foreignKey: "raiditemid" });
Waitinglist.belongsTo(Raiditem, { foreignKey: "raiditemid" });

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

// Waitinglist Endpoints
app.get("/waitinglists/raiditem/:raiditemid", async (req, res) => {
  try {
    const waitinglist = await Waitinglist.findAll({
      where: { raiditemid: req.params.raiditemid },
      include: [
        {
          model: User,
        },
        {
          model: Raiditem,
          include: [
            {
              model: Itemdrop,
              where: { itemid: req.params.raiditemid },
              include: [
                {
                  model: Raidfloor,
                  attributes: ["id", "name", "order"], // Adjust attributes as needed
                },
              ],
              required: false, // Include even if no itemdrops exist
            },
          ],
        },
      ],
    });
    res.status(200).json(waitinglist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/waitinglists", async (req, res) => {
  try {
    const waitinglist = await Waitinglist.findAll({
      include: [
        {
          model: User,
        },
        {
          model: Raiditem,
          include: [
            {
              model: Itemdrop,
              include: [
                {
                  model: Raidfloor,
                  attributes: ["id", "name", "order"], // Include relevant fields
                },
              ],
              required: false, // Include even if no itemdrops exist
            },
          ],
        },
      ],
    });
    res.status(200).json(waitinglist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/waitinglists/:raiditemid/:userid", async (req, res) => {
  try {
    const { raiditemid, userid } = req.params;
    const waitinglistEntry = await Waitinglist.findOne({
      where: { raiditemid, userid },
    });

    if (waitinglistEntry) {
      await waitinglistEntry.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Waitinglist entry not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize CRUD Routes for all models
handleCRUD(User);
handleCRUD(Raidfloor);
handleCRUD(Raiditem);
handleCRUD(Itemdrop);
handleCRUD(Alternate);
handleCRUD(Waitinglist);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});