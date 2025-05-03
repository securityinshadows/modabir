const mongoose = require('mongoose');

// we define the schema of posts
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please add content'],
      maxlength: [1000, 'Content cannot be more than 1000 characters']
    },
    media: {
      type: [String],
      validate: {
        validator: function(media) {
          return media.length <= 5;
        },
        message: 'Cannot upload more than 5 media items per post'
      }
    },
    operation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operation',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);