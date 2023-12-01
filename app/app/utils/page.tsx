export const runtime = "nodejs";

const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
const app = express();
app.use(cors()); 

const PORT = 8080;

async function runApp() {
  console.log('ran runapp')
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: "ora_afahimi",
      password: "a13006549",
      connectionString: "dbhost.students.cs.ubc.ca:1522/stu",
    });
    console.log("Successfully connected to Oracle Database"); // Create a table
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) { 
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
runApp();

const API = () => {
  return (
    <div>
      <h1>api</h1>
    </div>
  );
};

export default API;
