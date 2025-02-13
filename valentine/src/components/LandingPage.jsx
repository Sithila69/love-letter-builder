import React from "react";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Share2 } from "lucide-react";
import "../App.css";

const LandingPage = ({ onCreateGame, gameId, gameUrl, waitingForPlayer }) => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameUrl);
  };

  if (gameId && waitingForPlayer) {
    return (
      <div className="flex flex-col items-center justify-center h-auto py-20 max-w-screen-lg mx-auto overflow-hidden">
        <motion.div className="max-w-md w-full bg-transparent p-8" {...fadeIn}>
          <div className="text-center space-y-8">
            <Heart className="text-pink-500 w-16 h-16 mx-auto animate-pulse" />
            <h2 className="text-4xl font-extrabold text-white">
              Waiting for your partner...
            </h2>
            <div className="space-y-5">
              <p className="text-xl text-gray-300">
                Share this link with your special someone:
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={gameUrl}
                  readOnly
                  className="flex-grow px-4 py-3 text-lg bg-transparent border border-pink-500/20 rounded-lg text-gray-300 overflow-auto"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Share2 className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-transparent flex items-center justify-center p-4 max-w-screen-lg mx-auto overflow-hidden">
      <motion.div className="max-w-2xl w-full" {...fadeIn}>
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Heart className="text-pink-500 w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4 break-words">
              Love Letter Builder
            </h1>
            <p className="text-center rounded-lg p-4 text-gray-300  text-sm md:text-2xl max-w-md mx-auto">
              Craft heartfelt, hilarious, or unexpected love letters with your
              partner. Let our AI turn your words into magic!
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center items-center "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center items-center">
              <div className="text-center">
                <div className="relative">
                  <p className="relative  rounded-lg p-4 text-gray-300  text-sm md:text-2xl max-w-md mx-auto">
                    Looking for a fun and creative way to connect with your
                    partner? <br />
                    <br />
                    Try our love letter game! You and your partner each choose 5
                    words. Our AI takes those words and weaves them into a
                    one-of-a-kind love letter. Will it be romantic? Hilarious?
                    The surprise is part of the fun!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={onCreateGame}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full text-lg hover:from-pink-600 hover:to-purple-600 transition-all whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your Love Letter
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
