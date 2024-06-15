const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const multer = require("multer");
const app = express();
const upload = multer({ dest: "uploads/" });
const localport = 8844;
const path = require("path");
const Beach = require("./models/beaches");
const morgan = require("morgan");
const AppError = require("./utils/AppError");
const wrapAsync = require("./utils/wrapAsync");

mongoose
  .connect("mongodb://localhost:27017/beach-ph")
  .then(() => console.log("CONNECTION OPEN"))
  .catch((err) => console.log("CONNECTION ERROR!", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use ejsMate for all .ejs files
app.engine("ejs", ejsMate);

// Serve static files from the 'assets' directory
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

// Middleware for checking the edit form if there is an image uploaded
app.use("/beaches/:id", (req, res, next) => {
  if (req.method === "PUT" || req.method === "POST") {
    const new_image = req.body.beaches.image;
    const current_image = req.body.beaches.temp_image;
    if (!new_image) {
      req.body.beaches.image = current_image;
      console.log("No new image uploaded");
    } else {
      console.log("New image uploaded");
    }
  }
  next();
});

// Index page
app.get("/", (req, res) => res.send("Welcome, Beaches!"));

// Home page
app.get("/home", (req, res) => res.render("home"));

// Index list of beaches
app.get(
  "/beaches",
  wrapAsync(async (req, res) => {
    const beaches = await Beach.find({});
    res.render("beaches/index", { beaches });
  })
);

// Create new beach page
app.get("/beaches/new", (req, res) => res.render("beaches/new"));

// Processing the new beach form
app.post(
  "/beaches",
  upload.single("image"),
  wrapAsync(async (req, res) => {
    const beach = new Beach(req.body.beaches);
    await beach.save();
    res.redirect("/beaches");
  })
);

// Edit beach page
app.get(
  "/beaches/:id/edit",
  wrapAsync(async (req, res) => {
    const beach = await Beach.findById(req.params.id);
    res.render("beaches/edit", { beach });
  })
);

// Update beach form
app.put(
  "/beaches/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Beach.findByIdAndUpdate(
      id,
      { ...req.body.beaches },
      { runValidators: true }
    );
    res.redirect(`/beaches/${id}`);
  })
);

// Delete beach page
app.delete(
  "/beaches/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Beach.findByIdAndDelete(id);
    res.redirect("/beaches");
  })
);

// Show beach page for a specific beach
app.get(
  "/beaches/:id",
  wrapAsync(async (req, res, next) => {
    const beach = await Beach.findById(req.params.id);
    if (!beach) {
      throw new AppError("Beach not found", 404);
    }
    res.render("beaches/show", { beach });
  })
);

// Middleware for handling non-existent pages
app.use((req, res, next) => {
  next(new AppError("Page not found", 404));
});

app.listen(localport, () => console.log(`Listening on port ${localport}`));
