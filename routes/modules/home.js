const express = require('express')
const router = express.Router()
const Shortpage = require('../../models/shortpage')
require('../../config/mongoose')

// 首頁
router.get('/', (req, res) => {
  return res.render('index')
})

// 提交原網址後的處理
router.post('/', (req, res) => {
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

// 導向原本網址
router.get('/:urlTail', (req, res) => {
  const shortUrl = `${req.protocol}://${req.headers.host}/${req.params.urlTail}`

  Shortpage.find({ shortUrl: shortUrl })
    .lean()
    .then(result => res.redirect(`${result[0].originUrl}`))
    .catch(error => console.log(error))
})

module.exports = router

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