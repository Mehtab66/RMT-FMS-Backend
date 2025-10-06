require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/authRoutes");
const folderRoutes = require("./routes/folderRoutes");
const fileRoutes = require("./routes/fileRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const sharedRoutes = require("./routes/sharedRoutes");

// Import middlewares
const errorMiddleware = require("./middlewares/errorMiddleware");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middleware setup
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Removed express-fileupload, multer will handle it

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/shared", sharedRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// Custom error middleware
app.use(errorMiddleware);
const PORT = process.env.PORT || 3000;

module.exports = app;
