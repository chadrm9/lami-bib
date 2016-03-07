var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var passport = require('passport')
var jwt = require('express-jwt')

var auth = jwt({secret: process.env.TOKEN_SIGN, userProperty: 'payload'});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' })
})

var User = mongoose.model('User')
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'})
    }

  var user = new User()

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
      if(err){ return next(err) }
  
      return res.json({token: user.generateJWT()})
    })
})

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
      return res.status(400).json({message: 'Please fill out all fields'})
    }

  passport.authenticate('local', function(err, user, info){
      if(err) return next(err)
  
      if(user){
            return res.json({token: user.generateJWT()})
          } else {
                return res.status(401).json(info)
              }
    })(req, res, next)
})

var Product = mongoose.model('Product')
router.get('/products', function(req, res, next) {
  Product.find(function(err, products){
    if (err) return next(err)
    res.json(products)
  })
})

router.param('product', function(req, res, next, upc) {
  var query = Product.find({upc12: upc})
  query.exec(function(err, product) {
    if (err) return next(err)
    if (!product) {return next(new Error('Can\'t find product'))}
    req.product = product
    return next()
  })
})

router.get('/products/:product', function(req, res) {
  res.json(req.product)
})

module.exports = router;
