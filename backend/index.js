import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import loveletterRoutes from "./routes/loveLetter.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Store active games
const games = new Map();
const wordBankPath = path.resolve("word-bank/word-bank.json");

// ✅ Load word bank with error handling
let wordBank = {};
try {
  wordBank = JSON.parse(fs.readFileSync(wordBankPath, "utf-8"));
} catch (error) {
  console.error("Error loading word bank:", error.message);
}

// ✅ API endpoint to check if a game exists
app.get("/api/game/:gameId", (req, res) => {
  const { gameId } = req.params;
  const gameExists = games.has(gameId);
  res.json({ exists: gameExists });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Create a new game
  socket.on("createGame", () => {
    const gameId = uuidv4();

    if (!wordBank || Object.keys(wordBank).length === 0) {
      socket.emit("error", "Word bank is empty");
      return;
    }

    // ✅ Select initial words from a random category
    const categories = Object.keys(wordBank);
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const initialWords =
      wordBank[randomCategory]?.sort(() => 0.5 - Math.random()).slice(0, 4) ||
      [];

    const gameData = {
      id: gameId,
      players: [{ id: socket.id, isCreator: true }],
      player1Words: [],
      player2Words: [],
      currentPlayer: 1,
      gameOver: false,
      currentWordOptions: initialWords,
      created: Date.now(),
    };

    games.set(gameId, gameData);
    socket.join(gameId);

    console.log(`Game ${gameId} created by ${socket.id}`);
    socket.emit("gameCreated", {
      gameId,
      gameState: gameData,
      role: "player1",
    });
  });

  socket.on("joinGame", (gameId) => {
    console.log(`Join request for game ${gameId} from ${socket.id}`);
    const game = games.get(gameId);

    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    if (game.players.length >= 2) {
      socket.emit("error", "Game is full");
      return;
    }

    // Check if the player already exists (prevents duplicates)
    const existingPlayer = game.players.find((p) => p.id === socket.id);
    if (!existingPlayer) {
      game.players.push({ id: socket.id, isCreator: false });
    }

    socket.join(gameId);

    socket.emit("gameJoined", {
      gameId,
      players: game.players.length,
      gameState: game,
      role: "player2",
    });

    // Send updated game state
    io.to(gameId).emit("gameJoined", {
      gameId,
      players: game.players.length,
      gameState: {
        player1Words: game.player1Words,
        player2Words: game.player2Words,
        currentPlayer: game.currentPlayer,
        currentWordOptions: game.currentWordOptions,
        gameOver: game.gameOver,
      },
    });

    // Start game when 2 players are confirmed
    if (game.players.length === 2) {
      game.players.forEach((player) => {
        io.to(player.id).emit("gameStart", {
          gameState: game,
          role: player.isCreator ? "player1" : "player2",
        });
      });
    }
  });

  socket.on("rejoinGame", ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    // Check if player was already in the game
    const existingPlayer = game.players.find((p) => p.id === playerId);

    if (!existingPlayer) {
      socket.emit("error", "Player not in game");
      return;
    }

    console.log(`Player ${playerId} rejoined game ${gameId}`);
    socket.join(gameId);

    // Send updated game state
    io.to(socket.id).emit("gameStateUpdate", {
      player1Words: game.player1Words,
      player2Words: game.player2Words,
      currentPlayer: game.currentPlayer,
      currentWordOptions: game.currentWordOptions,
      players: game.players.length,
      gameOver: game.gameOver,
      role: existingPlayer.isCreator ? "player1" : "player2",
    });
  });

  // ✅ Handle word selection
  socket.on("selectWord", ({ gameId, word }) => {
    if (!gameId || !word) {
      socket.emit("error", "Game ID and word are required");
      return;
    }

    const game = games.get(gameId);

    if (!game) {
      socket.emit("error", "Game not found");
      return;
    }

    const playerIndex = game.players.findIndex((p) => p.id === socket.id);
    if (playerIndex === -1) {
      socket.emit("error", "Player not in this game");
      return;
    }

    const isPlayer1 = playerIndex === 0;
    if (isPlayer1) {
      game.player1Words.push(word);
    } else {
      game.player2Words.push(word);
    }

    if (game.player1Words.length === 5 && game.player2Words.length === 5) {
      game.gameOver = true;
      // Emit game over with final state
      io.to(gameId).emit("gameStateUpdate", {
        player1Words: game.player1Words,
        player2Words: game.player2Words,
        currentPlayer: game.currentPlayer,
        currentWordOptions: game.currentWordOptions,
        gameOver: true,
      });
      return;
    }

    game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;

    // ✅ Update current word options
    const totalWords = game.player1Words.length + game.player2Words.length;
    const categories = [
      "actions",
      "features",
      "qualities",
      "adventures",
      "petNames",
      "promises",
      "signatures",
    ];
    const category = categories[totalWords % categories.length];

    if (wordBank[category]) {
      game.currentWordOptions = wordBank[category]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
    } else {
      console.error(`Category '${category}' not found in word bank`);
      game.currentWordOptions = [];
    }

    // ✅ Broadcast updated game state to all players
    io.to(gameId).emit("gameStateUpdate", {
      player1Words: game.player1Words,
      player2Words: game.player2Words,
      currentPlayer: game.currentPlayer,
      currentWordOptions: game.currentWordOptions,
    });

    // ✅ Check if game is over
    if (game.player1Words.length === 5 && game.player2Words.length === 4) {
      game.gameOver = true;
      io.to(gameId).emit("gameOver");
    }
  });

  // ✅ Handle player disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const [gameId, game] of games.entries()) {
      const playerIndex = game.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players = game.players.filter((p) => p.id !== socket.id);
        if (game.players.length === 0) {
          games.delete(gameId);
        } else {
          io.to(gameId).emit("playerDisconnected", { gameId });
        }
      }
    }
  });
});

app.use("/api/loveletter", loveletterRoutes);

// ✅ Start server with error handling
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
