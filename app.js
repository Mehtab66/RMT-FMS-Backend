// // app.js
// require("dotenv").config();

// const createError = require("http-errors");
// const express = require("express");
// const path = require("path");
// const cookieParser = require("cookie-parser");
// const logger = require("morgan");
// const cors = require("cors");

// // Import routes
// const authRoutes = require("./routes/authRoutes");
// const folderRoutes = require("./routes/folderRoutes");
// const fileRoutes = require("./routes/fileRoutes");
// const permissionRoutes = require("./routes/permissionRoutes");
// const sharedRoutes = require("./routes/sharedRoutes");
// const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");

// // Import middlewares
// const errorMiddleware = require("./middlewares/errorMiddleware");

// const app = express();

// // View engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

// // Middleware setup
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "http://localhost:5173",
//       "http://127.0.0.1:5173",
//     ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );
// app.use(logger("dev"));
// app.use(express.json({ limit: "500mb" }));
// app.use(express.urlencoded({ extended: false, limit: "500mb" }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// // Serve uploaded files statically
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use("/", indexRouter);
// app.use("/users", usersRouter);

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/folders", folderRoutes);
// app.use("/api/files", fileRoutes);
// app.use("/api/permissions", permissionRoutes);
// app.use("/api/shared", sharedRoutes);

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     message: "Server is running",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// // Error handler
// app.use((err, req, res, next) => {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   res.status(err.status || 500);
//   res.render("error");
// });

// // Custom error middleware
// app.use(errorMiddleware);

// module.exports = app;

// app.js
require("dotenv").config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/authRoutes");
const folderRoutes = require("./routes/folderRoutes");
const fileRoutes = require("./routes/fileRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const sharedRoutes = require("./routes/sharedRoutes");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

// Import middlewares
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middleware setup
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Disposition"], // Add this line
  })
);

app.use(logger("dev"));
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: false, limit: "500mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

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

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// Custom error middleware
app.use(errorMiddleware);

// ---------------------------
// START THE SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`✅ Server is running on port ${PORT}`);
//   console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
// });

module.exports = app;
