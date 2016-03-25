var mongoose = require('mongoose')

var NoteSchema= new mongoose.Schema({
  user: String,
  title: String,
  message: String
},{ timestamps: true
})

mongoose.model('Note', NoteSchema)
