const mongoose = require('mongoose');

var todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false,
    required: true
  },
  startedAt: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Number
  }
});

var Todo = mongoose.model("Todo", todoSchema);

module.exports = {
  Todo
}
