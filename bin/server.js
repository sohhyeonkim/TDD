const app = require("../index");
const syncDB = require("./db-sync");

syncDB().then(() => {
  console.log("Sync Database");
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
