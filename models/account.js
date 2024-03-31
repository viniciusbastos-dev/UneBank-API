const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    requireD: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  card: {
    cardName: String,
    cardNumber: String,
    cvv: String,
    expiryDate: String,
  },
});

accountSchema.plugin(uniqueValidator);

accountSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.accountId = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Account", accountSchema);
