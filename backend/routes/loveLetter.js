import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache generated letters by game ID to ensure consistency
const letterCache = new Map();

router.post("/generate", async (req, res) => {
  try {
    const { player1Words, player2Words, gameId } = req.body;

    // Check if we already generated a letter for this game
    if (gameId && letterCache.has(gameId)) {
      return res.json({ loveLetter: letterCache.get(gameId) });
    }

    if (
      !player1Words ||
      !player2Words ||
      !Array.isArray(player1Words) ||
      !Array.isArray(player2Words)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid input: player words must be arrays" });
    }

    // Validate word counts
    if (player1Words.length !== 5 || player2Words.length !== 5) {
      return res.status(400).json({
        error:
          "Invalid word counts: Player 1 and Player 2 must each have 5 words",
      });
    }

    // Create word categories for better context
    const wordContext = {
      player1: {
        action: player1Words[0],
        quality: player1Words[1],
        adventure: player1Words[2],
        promise: player1Words[3],
        signature: player1Words[4],
      },
      player2: {
        petName: player2Words[0],
        feature: player2Words[1],
        feeling: player2Words[2],
        nickname: player2Words[3],
        closing: player2Words[4],
      },
    };

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert love letter writer. Write a charming and playful love letter incorporating specific words naturally into the text. Follow this exact structure:

1. Start with "Dear [Pet Name]," on its own line
2. Write 3-4 paragraphs of romantic content
3. End with "Love," on its own line
4. Sign with the signature word on the final line

Required words to include (use exact spelling and integrate naturally):
FROM PLAYER 1:
- Action word: "${wordContext.player1.action}"
- Quality: "${wordContext.player1.quality}"
- Adventure: "${wordContext.player1.adventure}"
- Promise: "${wordContext.player1.promise}"
- Signature: "${wordContext.player1.signature}"

FROM PLAYER 2:
- Pet Name: "${wordContext.player2.petName}" (use in greeting)
- Feature: "${wordContext.player2.feature}"
- Feeling: "${wordContext.player2.feeling}"
- Nickname: "${wordContext.player2.nickname}"
- Closing: "${wordContext.player2.closing}" (use near the end)

Style requirements:
- Write 150-200 words
- Use warm, affectionate tone
- Include gentle humor
- Make one playfully dramatic declaration of love
- Maintain proper letter formatting with clear paragraphs
- Ensure natural flow between sentences
- Avoid forced or awkward word placement

DO NOT:
- Include the word lists in the output
- Use placeholder text
- Break from the letter format
- End abruptly
- Make meta-comments about the writing

Example structure:
Dear [Pet Name],

[First paragraph with some required words]

[Second paragraph with more required words]

[Final paragraph with remaining words and closing]

Love,
[Signature]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Validate the response has minimum components
    if (
      !text.includes("Dear") ||
      !text.includes("Love,") ||
      text.length < 100 ||
      text.includes("Player 1") ||
      text.includes("Player 2")
    ) {
      throw new Error("Generated letter does not meet quality requirements");
    }

    // Cache the generated letter if we have a gameId
    if (gameId) {
      letterCache.set(gameId, text);

      // Optional: Clean up cache after some time
      setTimeout(() => {
        letterCache.delete(gameId);
      }, 1000 * 60 * 60); // Clean up after 1 hour
    }

    res.json({ loveLetter: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Failed to generate love letter",
      details: error.message,
    });
  }
});

router.get("/letter/:gameId", (req, res) => {
  const { gameId } = req.params;

  if (!letterCache.has(gameId)) {
    return res
      .status(404)
      .json({ error: "Love letter not found for this game" });
  }

  res.json({ loveLetter: letterCache.get(gameId) });
});

export default router;
