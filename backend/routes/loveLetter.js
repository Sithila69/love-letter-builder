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
        closing: player2Words[4], // Added for player2's 5th word
      },
    };

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Write a playful and romantic love letter that's both humorous and charming. 
    
    Use these exact words in a natural way:
    
    From Player 1:
    - Action: "${wordContext.player1.action}"
    - Quality: "${wordContext.player1.quality}"
    - Adventure: "${wordContext.player1.adventure}"
    - Promise: "${wordContext.player1.promise}"
    - Signature: "${wordContext.player1.signature}"
    
    From Player 2:
    - Pet Name: "${wordContext.player2.petName}"
    - Feature: "${wordContext.player2.feature}"
    - Feeling: "${wordContext.player2.feeling}"
    - Nickname: "${wordContext.player2.nickname}"
    - Closing: "${wordContext.player2.closing}"

    Guidelines:
    - Make it whimsical and light-hearted
    - Include some humor and playful exaggeration
    - Maintain a romantic undertone
    - Use creative metaphors or similes
    - Keep it between 150-200 words
    - Format it as a proper letter with Dear [Pet Name] and signed with the Signature
    - Make natural transitions between the words
    - Include at least one silly or over-the-top declaration of love
    - Try to incorporate the Closing word near the end of the letter before the signature

    The letter should feel cohesive and flow naturally, not just string the words together.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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

// Add an endpoint to retrieve cached letter
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
