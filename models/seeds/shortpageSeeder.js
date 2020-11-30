const Shortpage = require('../shortpage')
const pages = require('./pages.json')

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/shortpage_generator', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')

  pages.forEach(page => {
    Shortpage.create(page)
  })
})