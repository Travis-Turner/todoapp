const mongoose = require('mongoose');
if (process.env.NODE_ENV === 'production'){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost:27017/todo-app-data');
}
mongoose.Promise = global.Promise;

module.exports = {
  mongoose
};
