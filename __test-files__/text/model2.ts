const dotenv = { PG_URI: "secret-key" };

const pool2 = new Pool({
  connectionString: dotenv.PG_URI,
});
