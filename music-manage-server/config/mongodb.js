const mongoose = require('mongoose')

// 连接MongoDB
mongoose
  .connect(`mongodb://${process.env.MongoDbUsername}:${process.env.MongoDbPassword}@localhost:${process.env.MongoDbPort}/${process.env.MongoDbDatabase}`)
  .then(() => {
    console.log(`MongoDB has been connected. Database name: ${process.env.MongoDbDatabase}`)
  })
  .catch(error => {
    console.log(`MongoDB Rrror: ${error}`)
  })
