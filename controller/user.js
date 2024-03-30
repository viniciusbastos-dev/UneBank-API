const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

const nameRegex = /^[a-zA-ZÀ-ú]+ [a-zA-ZÀ-ú]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

userRouter.post("/create", async (request, response) => {
  const { fullName, phone, email, password, ...extraFields } = request.body;

  if (Object.keys(extraFields).length > 0) {
    return response
      .status(400)
      .json({ error: "Campos extras no corpo da requisição" });
  }

  if (!nameRegex.test(fullName)) {
    return response.status(400).json({
      error: "Por favor, forneça um nome completo válido (Nome Sobrenome)",
    });
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

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    fullName,
    email,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

userRouter.post("/auth", async (request, response) => {
  const { email, password, ...rest } = request.body;

  if (Object.keys(rest).length > 0) {
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

  response.status(200).json({ email: user.email, fullName: user.fullName });
});

module.exports = userRouter;
