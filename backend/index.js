import express from "express";
import cors from "cors";
import loveLetterRoutes from "./routes/loveLetter.js";
import dotenv from"dotenv";

dotenv.config();

const app = express();
app.use(cors()); // Allow frontend requests
app.use(express.json());

app.use("/api/loveletter", loveLetterRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
