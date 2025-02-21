const fs = require("fs");
//const https = require("https");
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");

// Database connection using Sequelize
const sequelize = new Sequelize("postgres", "postgres", "postgres", {
  host: "db",
  dialect: "postgres",
});

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discord: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lodestoneid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lodestoneimage: { type: DataTypes.STRING, allowNull: true },
  raidmember: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  ninemember: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
});

// Sync DB
sequelize.sync().then(() => console.log("Database synced"));

const app = express();
//const port = 3443
//const privateKey = fs.readFileSync("/app/certs/acac-api.key", "utf8");
//const certificate = fs.readFileSync("/app/certs/acac-api.crt", "utf8");
//const credentials = { key: privateKey, cert: certificate };

app.use(cors());
app.use(express.json());

// CRUD Routes
app.get("/users", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const { name, discord, lodestoneid, lodestoneimage, raidmember, ninemember, admin } = req.body;
  try {
    const user = await User.create({ name, discord, lodestoneid, lodestoneimage, raidmember, ninemember, admin });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/users/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ error: "User not found" });
});

app.put("/users/:id", async (req, res) => {
  const { name, discord, lodestoneid, lodestoneimage, raidmember, ninemember, admin } = req.body;
  const user = await User.findByPk(req.params.id);
  if (user) {
    user.name = name;
    user.discord = discord;
    user.lodestoneid = lodestoneid;
    user.lodestoneimage = lodestoneimage;
    user.raidmember = raidmember;
    user.ninemember = ninemember;
    user.admin = admin;
    await user.save();
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    await user.destroy();
    res.json({ message: "User deleted" });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Start Server
 app.listen(3001, () => {
   console.log("Server running on port 3001");
 }); 

// const httpsServer = https.createServer(credentials, app).listen(port, () => {
//    console.log(`Server running on port ${port}`);
// });