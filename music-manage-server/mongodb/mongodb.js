const mongoose = require('mongoose')

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/music-system').then(() => {
  console.log('MongoDB has been connected. Please have a great coding')
})
