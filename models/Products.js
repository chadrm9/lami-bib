var mongoose = require('mongoose')

var ProductSchema = new mongoose.Schema({
  commodity: String,
  rank: String,
  upc: String,
  upc12: String,
  bin: String,
  description: String,
  price: String
})

mongoose.model('Product', ProductSchema)
