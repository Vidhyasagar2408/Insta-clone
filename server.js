require("dotenv").config();
const app = require("./src/app");
const connectToDb = require("./src/config/Databse");

connectToDb();

app.listen(3000, () => {
  console.log("server is running on port number 3000");
});
