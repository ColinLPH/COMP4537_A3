const mongoose = require("mongoose")
const express = require("express")
const { connectDB } = require("./connectDB.js")
const { populatePokemons } = require("./populatePokemons.js")
const { getTypes } = require("./getTypes.js")
const { handleErr } = require("./errorHandler.js")
const morgan = require("morgan")
const cors = require("cors")


const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError,
  PokemonAuthError
} = require("./errors.js")

const { asyncWrapper } = require("./asyncWrapper.js")

const default_access_token = `pokeUsers access token`;
const default_refresh_token = `pokeUsers refresh token`;

const dotenv = require("dotenv")
dotenv.config();

const app = express()
// const port = 5000
var pokeModel = null;

const start = asyncWrapper(async () => {
  await connectDB({ "drop": false });
  // const pokeSchema = await getTypes();
  // pokeModel = await populatePokemons(pokeSchema);
  // pokeModel = mongoose.model('pokemons', pokeSchema);
})
// start()
app.use(express.json())
const jwt = require("jsonwebtoken")
// const { findOne } = require("./userModel.js")
const userModel = require("./userModel.js")


// app.use(morgan("tiny"))
app.use(morgan(":method"))

app.use(cors())


const authUser = asyncWrapper(async (req, res, next) => {
  // const token = req.body.appid
  const token = req.header('Authorization').split(' ');
  if (!token) {
    // throw new PokemonAuthError("No Token: Please provide an appid query parameter.")
    res.status(401).send("Invalid access token. No access.")
  }
  
  try {
    if (token[0] != 'Bearer')
    {
      res.status(401).send("Invalid access token. No access.")
    }

    actual_token = token[1];
    // const verified = jwt.verify(actual_token, default_access_token);
    const user = await userModel.findOne({ access_token: actual_token });
    if(!user)
    {
      res.status(401).send("Invalid access token. No access.")
    }
    next()
  } catch (err) {
    res.status(401).send("Invalid access token. No access.")
    throw new PokemonAuthError("Invalid Token Verification. Log in again.")
  }
})

const authAdmin = asyncWrapper(async (req, res, next) => {
  // const payload = jwt.verify(req.header('Authorization').split(" ")[1], default_access_token)
  // if (payload?.user?.role == "admin") {
  //   return next()
  // }
  // throw new PokemonAuthError("Access denied")
  const token = req.header('Authorization');
  if (!token) {
    // throw new PokemonAuthError("No Token: Please provide an appid query parameter.")
    res.status(401).send("Not authorized to access this route.")
  }
  tokens = token.split(" ");
  if (tokens[0] != 'Bearer')
  {
    res.status(401).send("Not access token. No access");
  }
  let result = await userModel.findOne({ access_token: tokens[1] });
  if (result.role != "admin" || !result)
  {
    res.status(401).send("Not authorized to access this route.");
  }
  next();
})

app.use(authUser) // Boom! All routes below this line are protected
app.get('/api/v1/pokemons', asyncWrapper(async (req, res) => {
  if (!req.query["count"])
    req.query["count"] = 10
  if (!req.query["after"])
    req.query["after"] = 0
  // try {
  const docs = await pokeModel.find({})
    .sort({ "id": 1 })
    .skip(req.query["after"])
    .limit(req.query["count"])
  res.json(docs)
  // } catch (err) { res.json(handleErr(err)) }
}))

app.get('/api/v1/pokemon', asyncWrapper(async (req, res) => {
  // try {
  // const { id } = req.query
  // const docs = await pokeModel.find({ "id": id })
  // if (docs.length != 0) res.json(docs)
  // else res.json({ errMsg: "Pokemon not found" })
  // } catch (err) { res.json(handleErr(err)) }
  res.status(200).send("Here's your pokemon. Enjoy!");
}))

// app.get("*", (req, res) => {
//   // res.json({
//   //   msg: "Improper route. Check API docs plz."
//   // })
//   throw new PokemonNoSuchRouteError("");
// })

app.use(authAdmin)
app.post('/api/v1/pokemon/', asyncWrapper(async (req, res) => {
  // try {
  console.log(req.body);
  if (!req.body.id) throw new PokemonBadRequestMissingID()
  const poke = await pokeModel.find({ "id": req.body.id })
  if (poke.length != 0) throw new PokemonDuplicateError()
  const pokeDoc = await pokeModel.create(req.body)
  res.json({
    msg: "Added Successfully"
  })
  // } catch (err) { res.json(handleErr(err)) }
}))

app.delete('/api/v1/pokemon', asyncWrapper(async (req, res) => {
  // try {
  const docs = await pokeModel.findOneAndRemove({ id: req.query.id })
  if (docs)
    res.json({
      msg: "Deleted Successfully"
    })
  else
    // res.json({ errMsg: "Pokemon not found" })
    throw new PokemonNotFoundError("");
  // } catch (err) { res.json(handleErr(err)) }
}))

app.put('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  // try {
  const selection = { id: req.params.id }
  const update = req.body
  const options = {
    new: true,
    runValidators: true,
    overwrite: true
  }
  const doc = await pokeModel.findOneAndUpdate(selection, update, options)
  // console.log(docs);
  if (doc) {
    res.json({
      msg: "Updated Successfully",
      pokeInfo: doc
    })
  } else {
    // res.json({ msg: "Not found", })
    throw new PokemonNotFoundError("");
  }
  // } catch (err) { res.json(handleErr(err)) }
}))

app.patch('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  // try {
  const selection = { id: req.params.id }
  const update = req.body
  const options = {
    new: true,
    runValidators: true
  }
  const doc = await pokeModel.findOneAndUpdate(selection, update, options)
  if (doc) {
    res.json({
      msg: "Updated Successfully",
      pokeInfo: doc
    })
  } else {
    // res.json({  msg: "Not found" })
    throw new PokemonNotFoundError("");
  }
  // } catch (err) { res.json(handleErr(err)) }
}))



app.get('/report', (req, res) => {
  console.log("Report requested");
  res.send(`Table ${req.query.id}`)
})


app.use(handleErr)

module.exports = {appApp: app, appStart: start()}