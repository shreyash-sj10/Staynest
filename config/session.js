const MongoStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/wonderlust";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET || "secretcode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Session store error");
});

const sessionOptions = {
  store,
  secret: process.env.SECRET || "secretcode",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

module.exports = sessionOptions;
