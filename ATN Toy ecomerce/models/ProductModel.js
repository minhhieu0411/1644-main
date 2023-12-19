var mongoose = require('mongoose');
var ProductSchema = mongoose.Schema({
   name: String,
   price: String,
   publisher: String,
   category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories'  // 'category': collection
   }
});
//Relationship : product (many) - category (one)

var ProductModel = mongoose.model('products', ProductSchema); // 'product' : collection
module.exports = ProductModel;