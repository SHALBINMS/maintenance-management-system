// app import
const app = require("./app");

// PORT
const PORT = process.env.PORT || 5000;

// app.listen()
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
