const accountRouter = require("express").Router();
const Account = require("../models/account");

accountRouter.get("/list-cards", async (request, response) => {
  const requestUser = request.user;

  const account = await Account.findOne({ userId: requestUser.id });

  response.json(account);
});

module.exports = accountRouter;
