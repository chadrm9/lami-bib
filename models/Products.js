var mongoose = require('mongoose')

var ProductSchema = new mongoose.Schema({
  _id: String,
  upc12: String,
  description: String,
  price: Number
})

mongoose.model('Product', ProductSchema)
