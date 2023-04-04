const mongoose = require('mongoose')

// 连接MongoDB
mongoose.connect(`mongodb://localhost:${process.env.MongoDbPort}/${process.env.MongoDbDatabase}`).then(() => {
  console.log(`MongoDB has been connected. Database name: ${process.env.MongoDbDatabase}`)
})
