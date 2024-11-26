const { Pool } = require("pg");

//PLEASE PLEASE DO NOT PUSH THIS TO MAIN!!
const PG_URI =
  "postgres://nyyy2qgd:SENSITIVE_INVFOxdafab-2SMrFAUXGdru@peanut.db.elephantsql.com/nyqq2gd";

// create a new pool here using the connection string above
const pool = new Pool({
  connectionString: PG_URI,
});
