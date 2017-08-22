var express = require('express')
var cheerio = require('cheerio')
var superagent = require('superagent')
var homeData = require('./homeData.js')
var eventproxy = require("eventproxy")
var app = express()
var ep = new eventproxy()

var bodyParser = require('body-parser')
var multer = require('multer') // v1.0.5
var upload = multer() // for parsing multipart/form-data

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/home', (req, res, next) => {
  superagent.get('https://www.crov.com')
    .end(function (err, sres) {
      if (err) {
        return next(err)
      }
      var items = [], $ = cheerio.load(sres.text)

      $('.h-pd .pd-item').each(function (index, element) {
        var $element = $(element)
        items.push({
          imgUrl: `https:${$element.find(".pd-img img").attr("data-original")}`,
          href: $element.find(".pd-img a").attr("href"),
          title: $element.find(".pd-name a").attr("title"),
          price: $element.find(".origin-price").text(),
          priceType: $element.find(".price-type").text()
        })
      })
      homeData.qualityProducts = items
      res.send(homeData)
    })
})
app.get('/search', function (req, res, next) {
  superagent.get(`https://www.crov.com${req.originalUrl}`)
    .end(function (err, sres) {
      if (err) {
        return next(err)
      }
      var $ = cheerio.load(sres.text)
      var items = [], result = {
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
  superagent.get(req.query.infoId)
    .end(function (err, sres) {
      if (err) {
        return next(err)
      }
      var $ = cheerio.load(sres.text)
      var items = [], imgs = [], result = {
        productID: $("#productID").attr("value"),
        busiID: $("#busiID").attr("value"),
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
      $('.swiper-slide').each((idx, element) => {
        imgs.push(`https:${$(element).find('img').attr('src')}`)
      })
      result.imgs = imgs
      result.mainAttr = items
      res.send(result)
    })
})

app.post("/getDetailedCartList", function (req, res, next) {
  const goodsList = req.body.goodsList
  console.log(goodsList)
  goodsList.forEach(({ href, num, }) => {
    superagent.get(href)
      .end(function (err, sres) {
        var $ = cheerio.load(sres.text)
        var item = {
          productID: $("#productID").attr("value"),
          busiID: $("#busiID").attr("value"),
          title: $(".J-prodName").text(),
          retailPrice: $('.J-RetailPrice b').text(),
          imgUrl: $('.swiper-slide').find('img').attr('src')
        }
        ep.emit('done', item);
      })
  })
  ep.after('done', goodsList.length, (result) => {
    console.log(result)
    res.send(result)
  })
})

app.listen(3000, function () {
  console.log('app is listening at port 3000')
})