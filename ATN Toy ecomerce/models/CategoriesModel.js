var mongoose = require('mongoose');
var CategorySchema = mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
         minlength: [3, 'brand name must be at least 3 characters'],
         maxlength: 20
      },
      age: string
   });
var CategoriesModel = mongoose.model('categories', CategorySchema);
module.exports = CategoriesModel;