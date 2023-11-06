export const runtime = 'nodejs'

const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const PORT = 8080;

app.get("/api/home", (req: any, res: any) => {
  res.send({ message: "Welcome to the Home Page!" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


const API = () => {
  return (
    <div>
      <h1>api</h1>
    </div>
  );
};

export default API;