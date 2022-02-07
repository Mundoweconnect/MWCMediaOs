if (process.env.NODE_ENV == "production") {
  module.exports = {
    mongoURI: process.env.MONGO_URL_PRODUTION,
  };
} else {
  module.exports = {
    mongoURI: process.env.MONGO_URL,
  };
}
