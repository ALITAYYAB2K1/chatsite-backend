import connectDB from "./db/index.js";
import app from "./app.js";
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
