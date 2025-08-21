require("dotenv").config();
const mongoose = require("mongoose");

// Load your User model definition
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const col = mongoose.connection.collection("users");

    console.log("Before indexes:");
    console.table(await col.indexes());

    // Option A: safest — reconcile indexes to match schema
    await User.syncIndexes();

    // If you still see duplicates after this, uncomment Option B once,
    // then re-run this script. (Be careful on very large collections.)
    // await col.dropIndexes();      // drops all except _id_
    // await User.syncIndexes();     // recreates only what the schema defines

    console.log("After indexes:");
    console.table(await col.indexes());
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
