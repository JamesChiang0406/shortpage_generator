const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const Shortpage = require('./models/shortpage')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/shortpage_generator', { useNewUrlParser: true, useUnifiedTopology: true })

db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

const app = express()
const port = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded({ extended: true }))

function randomGenerator() {
  const numbers = '1234567890'
  const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz'
  const UpperCaseLetters = lowerCaseLetters.toUpperCase()
  let collection = numbers + lowerCaseLetters + UpperCaseLetters
  let urlText = ''

  for (let i = 0; i < 5; i++) {
    let index = Math.floor(Math.random() * collection.length)
    urlText += collection[index]
    collection = collection.slice(0, index) + collection.slice(index + 1, collection.length)
  }

  return urlText
}

app.get('/', (req, res) => {
  return res.render('index')
})

app.post('/', (req, res) => {
  const originUrl = req.body.originalUrl

  // 尋找資料庫中是否存在輸入的網站
  Shortpage.find({ originUrl: originUrl })
    .lean()
    .then(results => {
      if (results.length === 0) {
        let shortUrl = `${req.protocol}://${req.headers.host}/${randomGenerator()}`

        Shortpage.find()
          .lean()
          .then(pages => {
            // 確定資料庫中不存在相同的短網址
            pages.forEach(page => {
              if (page.shortUrl === shortUrl) {
                shortUrl = `${req.protocol}://${req.headers.host}/${randomGenerator()}`
              }
            })

            const newPage = new Shortpage({
              originUrl: originUrl,
              shortUrl: shortUrl
            })
            return newPage.save()
              .then(() => {
                Shortpage.find({ originUrl: originUrl })
                  .lean()
                  .then(results => res.render('index', { result: results[0] }))
                  .catch(error => console.log(error))
              })
          })
      } else {
        res.render('index', { result: results[0] })
      }
    })
    .catch(error => console.log(error))
})

app.get('/:position', (req, res) => {
  const shortUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`

  Shortpage.find({ shortUrl: shortUrl })
    .lean()
    .then(result => res.redirect(`${result[0].originUrl}`))
    .catch(error => console.log(error))
})

app.listen(port, () => {
  console.log(`Express is listening on https://localhost:${port}`)
})