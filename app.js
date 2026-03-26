require("dotenv").config();

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const connectDB = require("./config/db");
const sessionConfig = require("./config/session");
const configurePassport = require("./config/passport");
const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const reviewRoutes = require("./routes/reviews");
const { setFlashLocals, notFound, errorHandler } = require("./middleware");

const app = express();
const port = process.env.PORT || 8080;

connectDB().catch((err) => console.log(err));
configurePassport();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "https://res.cloudinary.com"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use((req, res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }

  if (req.query) {
    mongoSanitize.sanitize(req.query);
  }

  if (req.params) {
    mongoSanitize.sanitize(req.params);
  }

  next();
});
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(setFlashLocals);

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.use("/auth", authRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

app.all(/.*/, notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`port is listening on ${port}`);
});
