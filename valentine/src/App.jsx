import React, { useState, useEffect } from "react";
import { Heart, Sparkles, Send } from "lucide-react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import CustomCursor from "./components/CustomCursor";
import FloatingHearts from "./components/FloatingHearts";
import LandingPage from "./components/LandingPage";
import GameUI from "./components/GameUi";
import "./App.css";

const VITE_LOVE_LETTER_API_URL = import.meta.env.VITE_LOVE_LETTER_API_URL;

const socket = io(`${VITE_LOVE_LETTER_API_URL}`, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

const App = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [player1Words, setPlayer1Words] = useState([]);
  const [player2Words, setPlayer2Words] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [randomEvent, setRandomEvent] = useState("");
  const [currentWordOptions, setCurrentWordOptions] = useState([]);
  const [aiLoveLetter, setAiLoveLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [gameUrl, setGameUrl] = useState("");
  const [playerRole, setPlayerRole] = useState(null); // Will be either 'player1' or 'player2'
  const [playerId, setPlayerId] = useState(null);
  const [serverLoveLetter, setServerLoveLetter] = useState("");
  const [currentPlayerId, setCurrentPlayerId] = useState(null);

  const romanticEvents = [
    "🌹 A wild rose appeared!",
    "🎻 A violin player tripped while serenading!",
    "🌈 Double rainbow forms a heart!",
    "🦄 A breakdancing unicorn prances by!",
    "🎪 Flash mob breaks into interpretive dance!",
    "🎭 Shakespeare appears (but forgot his lines)!",
    "🌟 Shooting star wrote your name wrong!",
    "🎪 Cupid shows up (but needs coffee)",
    "🐒 A monkey steals your love letter!",
    "🌪️ A glitter tornado passes through!",
    "🎨 Your words turn into floating bubbles!",
    "🎸 An air guitar solo materializes!",
  ];

  // Check if game exists when loading directly via URL
  useEffect(() => {
    const checkGameExists = async () => {
      if (gameId) {
        try {
          const response = await fetch(
            `${VITE_LOVE_LETTER_API_URL}api/game/${gameId}`
          );
          const data = await response.json();

          if (!data.exists) {
            alert("Game not found!");
            navigate("/");
          } else {
            socket.emit("joinGame", gameId);
          }
        } catch (error) {
          console.error("Error checking game:", error);
          alert("Error connecting to game");
          navigate("/");
        }
      }
    };

    checkGameExists();
  }, [gameId, navigate, socket]);

  useEffect(() => {
    function handleConnect() {
      console.log("Connected to server with ID:", socket.id);
      setIsConnected(true);
      setPlayerId(socket.id);

      if (gameId) {
        console.log("Rejoining game:", gameId);
        socket.emit("rejoinGame", { gameId, playerId: socket.id });
      }
    }

    function handleGameCreated({ gameId, gameState, role }) {
      console.log("Game created:", gameId, "role:", role);
      setWaitingForPlayer(true);
      setPlayerRole(role); // Set role when creating game (should be 'player1')
      const newGameUrl = `${window.location.origin}/game/${gameId}`;
      setGameUrl(newGameUrl);
      navigate(`/game/${gameId}`);

      // Initialize game state
      updateGameState(gameState);
    }
    function handleGameJoined({ players, gameState, role, playerId }) {
      console.log("Game joined, players:", players, "state:", gameState);
      setPlayerRole(role);
      setPlayerId(playerId); // Store the player's ID
      if (gameState) {
        updateGameState(gameState);
      }
      setWaitingForPlayer(players !== 2);
    }

    function handleGameStart({ gameState, role }) {
      console.log("Game starting with state:", gameState, "role", role);
      setPlayerRole(role); // Set the player's role when joining
      setPlayerId(playerId);
      setWaitingForPlayer(false);
      if (gameState) {
        updateGameState(gameState);
      }
    }

    function handleGameStateUpdate(gameState) {
      console.log("Game state update:", gameState);
      if (gameState.player1Words) setPlayer1Words(gameState.player1Words);
      if (gameState.player2Words) setPlayer2Words(gameState.player2Words);
      if (gameState.currentPlayer) setCurrentPlayer(gameState.currentPlayer);
      if (gameState.currentWordOptions)
        setCurrentWordOptions(gameState.currentWordOptions);
      if (gameState.gameOver !== undefined) setGameOver(gameState.gameOver);
      if (gameState.currentPlayerId) {
        setCurrentPlayerId(gameState.currentPlayerId);
      }
      if (gameState.loveLetter) {
        setServerLoveLetter(gameState.loveLetter);
        setAiLoveLetter(gameState.loveLetter);
        setLoading(false);
      }
    }

    function handlePlayerDisconnected() {
      console.log("A player disconnected!");

      if (isConnected) {
        console.log("Ignoring disconnect since I'm still here.");
        return;
      }

      alert("Other player disconnected!");
      navigate("/");
    }

    function handleError(message) {
      alert(message);
      navigate("/");
    }

    // Update game state helper function
    function updateGameState(gameState) {
      if (!gameState) {
        console.error("Game state is undefined");
        return;
      }

      if (gameState.player1Words) setPlayer1Words(gameState.player1Words);
      if (gameState.player2Words) setPlayer2Words(gameState.player2Words);
      if (gameState.currentPlayer) setCurrentPlayer(gameState.currentPlayer);
      if (gameState.currentWordOptions)
        setCurrentWordOptions(gameState.currentWordOptions);
      if (gameState.gameOver !== undefined) setGameOver(gameState.gameOver);
    }

    // Set up socket listeners
    socket.on("connect", handleConnect);
    socket.on("gameCreated", handleGameCreated);
    socket.on("gameJoined", handleGameJoined);
    socket.on("gameStart", handleGameStart);
    socket.on("gameStateUpdate", handleGameStateUpdate);
    socket.on("playerDisconnected", handlePlayerDisconnected);
    // socket.on("error", handleError);

    // Clean up listeners
    return () => {
      socket.off("connect", handleConnect);
      socket.off("gameCreated", handleGameCreated);
      socket.off("gameJoined", handleGameJoined);
      socket.off("gameStart", handleGameStart);
      socket.off("gameStateUpdate", handleGameStateUpdate);
      socket.off("playerDisconnected", handlePlayerDisconnected);
      socket.off("error", handleError);
    };
  }, [gameId, navigate]);

  // Add useEffect to automatically generate love letter when game is over
  // useEffect(() => {
  //   if (gameOver && player1Words.length === 5 && player2Words.length === 5) {
  //     handleGenerateLoveLetter();
  //   }
  // }, [gameOver, player1Words.length, player2Words.length]);

  const isPlayerTurn = () => {
    if (!playerRole || gameOver) return false;
    if (playerRole === "player1" && player1Words.length === 5) return false;
    if (playerRole === "player2" && player2Words.length === 5) return false;
    return (
      (currentPlayer === 1 && playerRole === "player1") ||
      (currentPlayer === 2 && playerRole === "player2")
    );
  };
  const createGame = () => {
    console.log("Creating new game");
    socket.emit("createGame");
  };

  const handleWordSelect = (word) => {
    if (!gameId) return;

    console.log("Selecting word:", word);
    socket.emit("selectWord", {
      gameId,
      word,
    });
  };

  const playSound = () => {
    const audio = new Audio("/bmw-bong.mp3");
    audio.play();
  };

  const renderWordSelectionButtons = () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {currentWordOptions.map((word, index) => {
        const disabled = !isPlayerTurn() || gameOver;
        return (
          <motion.button
            key={index}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={() => !disabled && (handleWordSelect(word), playSound())}
            className={`p-4 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg transition-all duration-200 shadow-md
              ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-pink-600 hover:to-purple-600"
              }`}
            disabled={disabled}
          >
            {word}
          </motion.button>
        );
      })}
    </div>
  );

  useEffect(() => {
    if (Math.random() < 0.4) {
      setRandomEvent(
        romanticEvents[Math.floor(Math.random() * romanticEvents.length)]
      );
      setTimeout(() => setRandomEvent(""), 3000);
    }
  }, [currentPlayer]);

  const handleResetGame = () => {
    if (!gameId) return;

    setLoading(false);
    setAiLoveLetter("");
    setServerLoveLetter("");
    setRandomEvent("");

    // Emit reset event to server
    socket.emit("resetGame", { gameId });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-y-auto">
      <FloatingHearts className="z-0" />
      <CustomCursor />
      <div className=" cursor-none">
        {!gameId ? (
          <LandingPage
            onCreateGame={createGame}
            gameId={gameId}
            gameUrl={gameUrl}
            waitingForPlayer={waitingForPlayer}
          />
        ) : (
          <div className="h-auto cursor-none">
            {waitingForPlayer ? (
              <LandingPage
                onCreateGame={createGame}
                gameId={gameId}
                gameUrl={gameUrl}
                waitingForPlayer={waitingForPlayer}
              />
            ) : (
              <GameUI
                randomEvent={randomEvent}
                gameOver={gameOver}
                currentPlayer={currentPlayer}
                renderWordSelectionButtons={renderWordSelectionButtons}
                player1Words={player1Words}
                player2Words={player2Words}
                loading={loading}
                serverLoveLetter={serverLoveLetter}
                aiLoveLetter={aiLoveLetter}
                handleResetGame={handleResetGame}
                playerId={playerId}
                currentPlayerId={currentPlayerId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default App;
