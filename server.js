var express = require('express')
var cheerio = require('cheerio')
var superagent = require('superagent')
var app = express()
app.get('/search', function (req, res, next) {
  superagent.get(`https://www.crov.com${req.originalUrl}`)
    .end(function (err, sres) {
      if (err) {
        return next(err)
      }
      var $ = cheerio.load(sres.text)
      var items = []
      $('.list-item').each(function (idx, element) {
        var $element = $(element)
        items.push({
          price: $element.find(".pds-price span").text(),
          url: $element.find(".products-link").attr('href'),
          img: `https:${$element.find(".product-wrap-box img").attr('data-original')}`,
          info: $element.find(".pds-info a").html(),
        })
      })

      res.send(items)
    })
})
app.listen(3000, function () {
  console.log('app is listening at port 3000')
})