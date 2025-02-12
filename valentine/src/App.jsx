import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000", {
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
  const [playerId, setPlayerId] = useState(null);

  const handleGenerateLoveLetter = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/loveletter/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add CORS headers if needed
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            player1Words: player1Words,
            player2Words: player2Words,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAiLoveLetter(data.loveLetter || "AI didn't respond. Try again!");
    } catch (error) {
      console.error("Error fetching love letter:", error);
      setAiLoveLetter("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
            `http://localhost:5000/api/game/${gameId}`
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
  }, [gameId, navigate]);

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

    function handleGameCreated({ gameId, gameState }) {
      console.log("Game created:", gameId);
      setWaitingForPlayer(true);
      const newGameUrl = `${window.location.origin}/game/${gameId}`;
      setGameUrl(newGameUrl);
      navigate(`/game/${gameId}`);

      // Initialize game state
      updateGameState(gameState);
    }

    function handleGameJoined({ players, gameState }) {
      console.log("Game joined, players:", players, "state:", gameState);
      if (gameState) {
        updateGameState(gameState);
      }
      setWaitingForPlayer(players !== 2);
    }

    function handleGameStart({ gameState }) {
      console.log("Game starting with state:", gameState);
      setWaitingForPlayer(false);
      if (gameState) {
        updateGameState(gameState);
      }
    }

    function handleGameStateUpdate(gameState) {
      console.log("Game state update:", gameState);
      updateGameState(gameState);
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

  useEffect(() => {
    if (Math.random() < 0.4) {
      setRandomEvent(
        romanticEvents[Math.floor(Math.random() * romanticEvents.length)]
      );
      setTimeout(() => setRandomEvent(""), 3000);
    }
  }, [currentPlayer]);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-pink-200 to-purple-200">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        {!gameId ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-pink-700 mb-6">
              Love Letter Builder
            </h1>
            <button
              onClick={createGame}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full"
            >
              Create New Game
            </button>
          </div>
        ) : waitingForPlayer ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">
              Waiting for player to join...
            </h2>
            <p className="mb-4 text-purple-700">
              Share this link with your partner:
            </p>
            <div className="flex items-center gap-2 mb-4 text-purple-700">
              <input
                type="text"
                value={gameUrl}
                readOnly
                className="w-full p-2 border rounded"
              />
              <button
                onClick={() => navigator.clipboard.writeText(gameUrl)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Copy
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Title with Heart Icon */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-pink-700 mb-6 flex items-center justify-center gap-3"
            >
              Love Letter Builder <Heart className="text-red-600" size={32} />
            </motion.h1>

            {/* Random Event Banner */}
            {randomEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-3 px-6 bg-pink-100 rounded-full mb-6 text-pink-800 font-medium shadow-sm animate-bounce"
              >
                {randomEvent}
              </motion.div>
            )}

            {/* Player Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-semibold text-purple-700">
                {!gameOver ? `Player ${currentPlayer}'s Turn` : "Game Over!"}
              </h2>
              <p className="text-gray-700 font-medium mt-2">
                {!gameOver && `Select a word to continue`}
              </p>
            </motion.div>

            {/* Word Selection Area */}
            {!gameOver && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Choose a word:
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {currentWordOptions.map((word, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWordSelect(word)}
                      className="p-4 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-all duration-200 shadow-md"
                    >
                      {word}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Players' Selected Words */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              <div className="bg-pink-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-pink-700 mb-4">
                  Player 1's Words ({player1Words.length}/5)
                </h3>
                <ul className="space-y-2">
                  {player1Words.map((word, index) => (
                    <li
                      key={index}
                      className="text-pink-800 p-3 bg-pink-100 rounded-lg font-medium shadow-sm"
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-purple-700 mb-4">
                  Player 2's Words ({player2Words.length}/4)
                </h3>
                <ul className="space-y-2">
                  {player2Words.map((word, index) => (
                    <li
                      key={index}
                      className="text-purple-800 p-3 bg-purple-100 rounded-lg font-medium shadow-sm"
                    >
                      {word}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Game Over and AI Letter Section */}
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold text-pink-700 mb-6">
                  Your AI Love Letter:
                </h2>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-lg text-gray-800 font-medium mb-8 shadow-inner text-left">
                    {aiLoveLetter}
                  </pre>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPlayer1Words([]);
                    setPlayer2Words([]);
                    setGameOver(false);
                    setAiLoveLetter("");
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg text-lg"
                >
                  Write Another Letter
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default App;
