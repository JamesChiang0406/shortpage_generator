const mongoose = require('mongoose')

const Schema = mongoose.Schema

const shorpageSchema = new Schema({
  originUrl: String,
  shortUrl: String
})

module.exports = mongoose.model('Shortpage', shorpageSchema)