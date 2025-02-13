import React from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Send } from "lucide-react";

const GameUI = ({
  randomEvent,
  gameOver,
  currentPlayer,
  renderWordSelectionButtons,
  player1Words,
  player2Words,
  loading,
  serverLoveLetter,
  aiLoveLetter,
  handleResetGame,
  playerRole,
  playerId, // Add this
  currentPlayerId, // Add this
}) => {
  const isPlayer1 = playerRole === "player1";
  const isPlayerTurn = currentPlayerId === playerId;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      {/* Game Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center gap-2">
          Love Letter Builder
          <Heart className="text-pink-500" size={32} />
        </h1>
      </motion.div>

      {/* Random Event Banner */}
      {randomEvent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 text-center"
        >
          <p className="text-pink-400 font-medium">{randomEvent}</p>
        </motion.div>
      )}

      {/* Game Status */}
      {!gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl p-6 mb-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            {isPlayerTurn ? "Your Turn" : "Your Partner's Turn"}
          </h2>
          <p className="text-gray-300 mt-2">
            {isPlayerTurn
              ? "Select a word to continue"
              : "Waiting for your partner to choose..."}
          </p>
        </motion.div>
      )}

      {/* Word Selection Area */}
      {!gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-pink-400 mb-4">
            {isPlayerTurn ? "Choose your word:" : "Your partner is choosing..."}
          </h3>
          {isPlayerTurn && (
            <div className="grid gap-2">{renderWordSelectionButtons()}</div>
          )}
        </motion.div>
      )}

      {/* Players' Words Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {/* Your Words */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
            Your Words
            <span className="text-sm bg-pink-500/20 px-2 py-1 rounded-full">
              {isPlayer1 ? player1Words.length : player2Words.length}/5
            </span>
          </h3>
          <div className="space-y-2">
            {(isPlayer1 ? player1Words : player2Words).map((word, index) => (
              <div
                key={index}
                className="bg-pink-500/10 text-pink-300 p-3 rounded-lg font-medium"
              >
                {word}
              </div>
            ))}
          </div>
        </div>

        {/* Partner's Words */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
            Partner's Words
            <span className="text-sm bg-purple-500/20 px-2 py-1 rounded-full">
              {isPlayer1 ? player2Words.length : player1Words.length}/5
            </span>
          </h3>
          <div className="space-y-2">
            {(isPlayer1 ? player2Words : player1Words).map((word, index) => (
              <div
                key={index}
                className="bg-purple-500/10 text-purple-300 p-3 rounded-lg font-medium"
              >
                {word}
              </div>
            ))}
          </div>
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
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-6 flex items-center justify-center gap-2">
              Your AI Love Letter
              <Sparkles className="text-pink-500" size={24} />
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"></div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap bg-white/5 p-6 rounded-lg text-gray-300 font-medium text-left">
                {serverLoveLetter || aiLoveLetter}
              </pre>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResetGame}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Write Another Letter
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default GameUI;
