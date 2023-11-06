const express = require("express");
const app = express();

const PORT = 8080;

app.get("/api/home", (req, res) => {
  res.send({ message: "Welcome to the Home Page!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
