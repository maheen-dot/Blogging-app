const { Schema, model } = require('mongoose');

const blogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {   
    type: String,
    required: true
  },

  coverImgUrl: {
    type: String,
  },

  author:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 
}, { timestamps: true });       


module.exports = model('Blog', blogSchema);