import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function main() {
  const port = Number(process.env.PORT || 3001);
  const url = `http://localhost:${port}/api/init-metadata`;

  const res = await axios.post(url, {});
  console.log(res.data);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
