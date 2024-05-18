const mongoose = require("mongoose");
const Beach = require("../models/beaches");

mongoose
  .connect("mongodb://localhost:27017/beach-ph")
  .then(() => console.log("CONNECTION OPEN"))
  .catch((err) => console.log("CONNECTION ERROR!", err));

const seedDB = async () => {
  const desc =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti error doloremque blanditiis sint deserunt nisi ducimus, impedit aut reprehenderit a facere sapiente facilis, ea quam exercitationem. Quibusdam rem voluptas deserunt.";

  // Find all documents in the Beach collection
  const beaches = await Beach.find({});

  // Loop through each document and update with a unique random number
  for (let i = 0; i < beaches.length; i++) {
    const randomNum = Math.floor(Math.random() * 15) + 1;
    await Beach.updateOne(
      { _id: beaches[i]._id },
      { $set: { image: `${randomNum}.jpg`, description: desc } }
    );
  }
};

seedDB();
