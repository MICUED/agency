var express = require('express')
var cheerio = require('cheerio')
var superagent = require('superagent')
var homeData = require('./homeData.js')
var app = express()
app.get('/home', (req, res, next) => {
    res.send(homeData)
})
app.get('/search', function (req, res, next) {
  superagent.get(`https://www.crov.com${req.originalUrl}`)
    .end(function (err, sres) {
      if (err) {
        return next(err)
      }
      var $ = cheerio.load(sres.text)
      var items = [],result = {
        results: parseInt($('.co-weight').text())
      }
      $('.list-item').each(function (idx, element) {
        var $element = $(element)
        items.push({
          price: $element.find(".pds-price span").text(),
          url: $element.find(".products-link").attr('href'),
          img: `https:${$element.find(".product-wrap-box img").attr('data-original')}`,
          info: $element.find(".pds-info a").html(),
        })
      })
      result.items = items
      res.send(result)
    })
})
// 详情页
app.get('/p', function (req, res, next) {
  superagent.get(`https://www.crov.com/p/free-shipping-thxsilk-pure-19mm-mulberry-silk-queen-seamless-duvet-cover-with-buttons-open---artichoke-green_bBDHqWvMgJVk.html`)
    .end(function (err, sres) {
      if (err) {
        return next(err)
      }
      var $ = cheerio.load(sres.text)
      console.log($('.total-item .total span').text())
      var items = [],result = {
        title: $(".J-prodName").text(),
        retailPrice: $('.J-RetailPrice b').text(),
        attrItem0Name: $('.prod-attr.m-form.mian-attr > .attr-item').first().find('.attr-name').text(),
        attrItem0Val: $('.prod-attr.m-form.mian-attr .attr-item').find('.spec-box.J-prodSpec').text(),
        wrapName: $('.attr-item.qty-item.J-qtyWrap .attr-name').text(),
        wrapPrice: $('.input-price input').val(),
        wrapHolder: $('.input-price input').attr('placeholder'),
        wrapStock: $('.input-price input').attr('stock'),
        wrapType: $('.input-price .J-unitType').text(),
        wrapError: $('.qty-error.J-qtyError').text(),
        totalName: $('.total-item .attr-name').text(),
        totalValue: $('.total-item .total').text()
      }
      $('.prod-select.for-m .attr-item').each(function (idx, element) {
        var $element = $(element)
        items.push({
          attrName: $element.find(".attr-name").text(),
          attrInner: $element.find(".attr-inner").text(),
        })
      })
      result.mainAttr = items
      res.send(result)
    })
})
app.listen(3000, function () {
  console.log('app is listening at port 3000')
})