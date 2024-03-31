const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Account = require("../models/account");
const jwt = require("jsonwebtoken");

const nameRegex = /^[a-zA-ZÀ-ú]+ [a-zA-ZÀ-ú]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateAccountNumber = async () => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const accountLength = 10;
  let accountNumber = "";

  while (true) {
    for (let i = 0; i < accountLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      accountNumber += characters[randomIndex];
    }
    const existingAccount = await Account.findOne({ accountNumber });
    if (!existingAccount) {
      break;
    } else {
      accountNumber = "";
    }
  }

  return accountNumber;
};

userRouter.post("/create", async (request, response) => {
  const { fullName, phone, email, password, ...extraFields } = request.body;

  if (Object.keys(extraFields).length > 0) {
    return response
      .status(400)
      .json({ error: "Campos extras no corpo da requisição" });
  }

  const emailFound = await User.findOne({ email });

  if (emailFound !== null) {
    return response
      .status(409)
      .json({ error: "Este endereço de e-mail já está sendo utilizado." });
  }

  if (!nameRegex.test(fullName)) {
    return response.status(400).json({
      error: "Por favor, forneça um nome completo válido (Nome Sobrenome).",
    });
  }

  if (!email) {
    return response.status(400).json({ error: "Por favor, forneça um email." });
  }

  if (!emailRegex.test(email)) {
    return response
      .status(400)
      .json({ error: "Por favor, forneça um email válido." });
  }

  if (!password || password.length < 6) {
    return response.status(400).json({
      error: "Por favor, forneça uma senha com pelo menos 6 caracteres.",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    fullName,
    phone,
    email,
    passwordHash,
  });

  const savedUser = await user.save();

  const accountNumber = await generateAccountNumber();

  const account = new Account({
    userId: savedUser._id,
    accountNumber,
    balance: 0, // Pode definir o saldo inicial da conta aqui
  });

  await account.save();

  response.status(201).json(savedUser);
});

userRouter.post("/auth", async (request, response) => {
  const { email, password, ...extraFields } = request.body;

  if (Object.keys(extraFields).length > 0) {
    return response
      .status(400)
      .json({ error: "Campos extras no corpo da requisição" });
  }

  if (!email) {
    return response.status(400).json({ error: "Por favor, forneça um email" });
  }

  if (!emailRegex.test(email)) {
    return response
      .status(400)
      .json({ error: "Por favor, forneça um email válido" });
  }

  if (!password || password.length < 6) {
    return response.status(400).json({
      error: "Por favor, forneça uma senha com pelo menos 6 caracteres",
    });
  }

  const user = await User.findOne({ email });
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: "Email ou senha inválida" });
  }

  const userForToken = {
    email: user.email,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: "7d",
  });

  response
    .status(200)
    .json({ token, email: user.email, fullName: user.fullName });
});

module.exports = userRouter;
