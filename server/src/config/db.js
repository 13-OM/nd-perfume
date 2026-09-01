const dns = require('dns');

// Use reliable public DNS for MongoDB Atlas SRV resolution
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');

/**
 * Connect to MongoDB (Atlas or local) using the MONGODB_URI env var.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ndperfume';

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log(
    `✔ MongoDB connected → ${conn.connection.host}/${conn.connection.name}`
  );

  return conn;
}

module.exports = { connectDB };
