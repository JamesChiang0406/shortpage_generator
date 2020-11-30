const mongoose = require('mongoose')

const Schema = mongoose.Schema

const shorpageSchema = new Schema({
  originalURL: {
    type: String,
    required: true
  },
  shortURL: {
    type: String
  }
})

module.exports = mongoose.model('Shortpage', shorpageSchema)