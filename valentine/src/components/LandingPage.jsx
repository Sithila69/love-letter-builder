import React from "react";
import { motion } from "framer-motion";
import { Heart, ArrowRight, Share2 } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8"
          {...fadeIn}
        >
          <div className="text-center space-y-6">
            <Heart className="text-pink-500 w-12 h-12 mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold text-white">
              Waiting for your partner...
            </h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                Share this link with your special someone:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gameUrl}
                  readOnly
                  className="w-full px-4 py-2 bg-white/5 border border-pink-500/20 rounded-lg text-gray-300"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div className="max-w-2xl w-full" {...fadeIn}>
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Heart className="text-pink-500 w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
              Love Letter Creator
            </h1>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 px-4">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-left">
              <h3 className="text-xl font-semibold text-pink-400 mb-3">
                How It Works
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">1.</span>
                  Create a game and invite your partner
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">2.</span>
                  Each person chooses 5 meaningful words
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">3.</span>
                  Our AI crafts a unique love letter using your words
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-left">
              <h3 className="text-xl font-semibold text-purple-400 mb-3">
                Perfect For
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li>• Surprising your partner</li>
                <li>• Date night activities</li>
                <li>• Creating memorable moments</li>
                <li>• Expressing your feelings</li>
              </ul>
            </div>
          </div>

          <motion.button
            onClick={onCreateGame}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-full text-lg hover:from-pink-600 hover:to-purple-600 transition-all"
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
