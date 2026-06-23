import app from "./app.js";
import { testConnection } from "./db/connection.js";

const port = Number(process.env.PORT) || 5000;

try {
  await testConnection();
  app.listen(port, () => {
    console.log(`Studentų registro API veikia: http://localhost:${port}`);
  });
} catch (error) {
  console.error("Nepavyko prisijungti prie PostgreSQL:", error.message);
  process.exit(1);
}

