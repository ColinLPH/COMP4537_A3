const express = require("express")
const { handleErr } = require("./errorHandler.js")
const { asyncWrapper } = require("./asyncWrapper.js")
const dotenv = require("dotenv")
dotenv.config();
const userModel = require("./userModel.js")
const { connectDB } = require("./connectDB.js")
const cors = require("cors")

const AUTH_SERVER_PORT = 3000;
const default_access_token = `pokeUsers access token`;
const default_refresh_token = `pokeUsers refresh token`;

const {
  PokemonBadRequest,
  PokemonDbError,
  PokemonAuthError
} = require("./errors.js")

const app = express()

const start = asyncWrapper(async () => {
  await connectDB({ "drop": false });

  const doc = await userModel.findOne({ username: "admin" })
  if (!doc) {
    await userModel.create({ username: "admin", password: bcrypt.hashSync("admin", 10), role: "admin", email: "admin@admin.ca" })
  }
});

// start()

app.use(express.json())
app.use(cors({
  exposedHeaders: ['auth-token-access', 'auth-token-refresh']
}))

const bcrypt = require("bcrypt")
app.post('/register', asyncWrapper(async (req, res) => {
  const { username, password, email, role } = req.body
  if (!username || !password || !email) {
    res.status(401).send("Missing username, password or email");
  }

  if (username.length < 3 || username.length > 20) {
    res.status(401).send("Username must be between 3 and 20 characters");
  }

  if (password.length < 6 || password.length > 20) {
    res.status(401).send("Password must be between 6 and 20 characters");
  }

  if (email.length < 6 || email.length > 30) {
    res.status(401).send("Email must be between 6 and 30 characters");
  }

  if (!username.match(/^[a-zA-Z0-9]+$/)) {
    res.status(401).send("Username must be alphanumeric");
  }

  let user = await userModel.findOne({ username: username });
  if (user) {
    res.status(409).send("User already exists");
  }

  user = await userModel.findOne({ email: email });
  if (user) {
    res.status(409).send("Email already exists");
  }

  if (!role) {
    role = "user";
  }

  if (role !== "user" && role !== "admin") {
    res.status(401).send("Invalid role");
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  const userWithHashedPassword = { ...req.body, password: hashedPassword }

  user = await userModel.create(userWithHashedPassword)
  res.status(200).send(user)
}))

const jwt = require("jsonwebtoken");
const { mongo } = require("mongoose");
const { updateOne } = require("./userModel.js");
//connect to database
app.post('/requestNewAccessToken', asyncWrapper(async (req, res) => {
  // console.log(req.headers);
  const refreshToken = req.headers.authorization;
  if (!refreshToken) {
    throw new PokemonAuthError("No Token: Please provide a token.")
  }
  const prefix = refreshToken.split(" ")[0];
  if (prefix != "Refresh") {
    res.status(401).send("Invalid Token: Not a Refresh token.")
    throw new PokemonAuthError("Invalid Token: Not a Refresh token.")
  }
  const token = refreshToken.split(" ")[1];
  // const payload = jwt.verify(token, default_refresh_token)
  const user = userModel.findOne({ refresh_token: token });
  if (!user) { // replaced a db access
    res.status(401).send("Invalid Token: Please provide a valid token.")
    throw new PokemonAuthError("Invalid Token: Refresh token does not exist.")
  }
  try {
    const accessTokenPayload = {
      username: user.username,
      password: user.password,
      role: user.role,
      unique_id: Date.now()
    };

    const accessToken = jwt.sign(accessTokenPayload, default_access_token, { expiresIn: '10s' })
    res.header('Authorization', `Bearer ${accessToken}`)
    res.status(200).send("All good!")
  } catch (error) {
    throw new PokemonAuthError("Invalid Token: Please provide a valid token.")
  }
}))

app.post('/login', asyncWrapper(async (req, res) => {
  const { username, password } = req.body
  const user = await userModel.findOne({ username })
  if (!user) {
    res.status(404).send("User not found");
  }
  else {
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
      res.status(401).send("Invalid password");
    }
    else {

      const accessTokenPayload = {
        username: user.username,
        password: user.password,
        role: user.role,
        unique_id: Date.now()
      };

      const refreshTokenPayload = {
        username: user.username,
        password: user.password,
        role: user.role,
        unique_id: Date.now()
      };

      const accessToken = jwt.sign(accessTokenPayload, default_access_token, { expiresIn: '10s' })
      const refreshToken = jwt.sign(refreshTokenPayload, default_refresh_token)

      //update the user's tokens using updateOne
      await userModel.updateOne({ username: user.username }, { access_token: accessToken, refresh_token: refreshToken });

      res.header('Authorization', `Bearer ${accessToken} Refresh ${refreshToken}`)

      // res.send("All good!")
      res.status(200).send(user)
    }
  }

}))


app.get('/logout', asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({ username })
  if (!user) {
    res.status(404).send("User not found");
    throw new PokemonAuthError("User not found")
  }

  await userModel.updateOne({ username: user.username }, { access_token: default_access_token, refresh_token: default_refresh_token });

  res.status(200).send("Logged out")
}))

module.exports = { authApp: app, authStart: start() }
