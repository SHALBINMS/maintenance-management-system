// app import
const app = require("./app");

const pool = require("./config/db");

// PORT
const PORT = process.env.PORT || 5000;

pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("✅ PostgreSQL Connected");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL Connection Failed:", err.message);
  });

// app.listen()
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
