var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var passport = require('passport')
var jwt = require('express-jwt')

var User = mongoose.model('User')
var Product = mongoose.model('Product')
var Note = mongoose.model('Note')

var auth = jwt({secret: process.env.TOKEN_SIGN, userProperty: 'payload'})

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index')
})

router.get('/notes', function(req, res, next) {
  Note.find(function(err, notes){
    if (err) return next(err)
    res.json(notes)
  })
})

router.param('note', function(req, res, next, id) {
  var query = Note.findById(id)

  query.exec(function (err, note){
    if (err) { return next(err) }
    if (!note) { return next(new Error('can\'t find note')) }

    req.note = note
    return next()
  })
})

router.get('/notes/:note', function(req, res) {
  res.json(req.note)
})

router.post('/notes', auth, function(req, res, next) {
  var note = new Note(req.body)
  note.user = req.payload.username
  note.save(function(err, note){
    if(err) return next(err)
    res.json(note)
  })
})

// router.delete('/notes/:id', auth, function(req, res) {
//   Note.remove({_id: req.params.id},
//     function(err, note){
//       if(err) return next(err)
//   })
// })

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

module.exports = router
