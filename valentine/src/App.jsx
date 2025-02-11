import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import {motion} from "framer-motion"

const App = () => {
  const [player1Words, setPlayer1Words] = useState([]);
  const [player2Words, setPlayer2Words] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [randomEvent, setRandomEvent] = useState("");
  const [currentWordOptions, setCurrentWordOptions] = useState([]);
  const [aiLoveLetter, setAiLoveLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateLoveLetter = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/loveletter/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Add CORS headers if needed
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          player1Words: player1Words,
          player2Words: player2Words,
        }),
      });
  
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
  

  const wordBank = {
    actions: [
      "dramatically spotted", "accidentally licked", "interpretively danced with", 
      "ninja-kicked", "romantically stalked", "awkwardly high-fived",
      "telepathically sensed", "heroically rescued", "gracefully tripped into",
      "magically summoned", "accidentally photocopied", "mysteriously followed"
    ],
    features: [
      "majestic nostrils", "glowing aura", "mystical toe collection",
      "sparkly beard", "rainbow hair", "disco moves",
      "dramatic cape", "singing eyebrows", "magical sneeze",
      "jazzy walk", "glittering socks", "mysterious accent"
    ],
    qualities: [
      "surprisingly squeaky", "mysteriously wiggly", "cartoonishly perfect",
      "enchantingly chaotic", "ridiculously graceful", "magically clumsy",
      "fashionably confused", "adorably dangerous", "charmingly weird",
      "epically awkward", "dramatically peaceful", "majestically silly"
    ],
    adventures: [
      "fought ninjas in pajamas", "rode a breakdancing unicorn", "invented a new sandwich dance",
      "time-traveled to last Tuesday", "started a squirrel revolution", "opened a dragon café",
      "joined a pirate book club", "founded a sock puppet theater", "became professional cloud watchers",
      "trained ninja hamsters", "started an underwater disco", "organized a tea party for aliens"
    ],
    petNames: [
      "cosmic potato", "dancing cactus", "chocolate-covered hero",
      "rainbow unicorn", "glitter ninja", "waffle warrior",
      "disco dinosaur", "sparkle shark", "moonlight muffin",
      "sunshine sasquatch", "pizza princess", "taco tiger"
    ],
    promises: [
      "dramatically serenade", "write haikus about", "juggle flaming pineapples for",
      "knit sweaters for", "paint portraits of", "compose rap songs about",
      "bake questionable cakes for", "chase butterflies with", "plant a garden of memes for",
      "build pillow forts with", "start a band of kazoos with", "learn interpretive dance for"
    ],
    signatures: [
      "Your Secret Admirer", "Captain Love", "Chief Romance Officer",
      "Supreme Commander of Hearts", "Minister of Hugs", "Professional Swooner",
      "Lord of the Love Letters", "Keeper of the Sacred Memes", "Grand Wizard of Woo",
      "Director of Dramatic Gestures", "Chancellor of Charm", "Admiral of Adoration"
    ]
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
    "🎸 An air guitar solo materializes!"
  ];

  // Helper function to add "a" or "an" before a word
  const addArticle = (word) => {
    if (!word) return "";
    const firstLetter = word[0].toLowerCase();
    return /[aeiou]/.test(firstLetter) ? `an ${word}` : `a ${word}`;
  };

  useEffect(() => {
    if (Math.random() < 0.4) {
      setRandomEvent(romanticEvents[Math.floor(Math.random() * romanticEvents.length)]);
      setTimeout(() => setRandomEvent(""), 3000);
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (!player1Words.length && !player2Words.length) {
      // Ensure a category is selected at the start
      const category = ['actions', 'features', 'qualities', 'adventures', 'petNames', 'promises', 'signatures'][Math.floor(Math.random() * 7)];
      setCurrentWordOptions([...wordBank[category]].sort(() => 0.5 - Math.random()).slice(0, 4));
    } else {
      // Continue generating words normally based on turns
      const totalWords = player1Words.length + player2Words.length;
      const category = ['actions', 'features', 'qualities', 'adventures', 'petNames', 'promises', 'signatures'][totalWords % 7];
      
      if (wordBank[category]) {
        const shuffled = [...wordBank[category]].sort(() => 0.5 - Math.random());
        setCurrentWordOptions(shuffled.slice(0, 4));
      }
    }
  }, [player1Words, player2Words, currentPlayer]);
  

  useEffect(() => {
    if (player1Words.length === 5 && player2Words.length === 4 && !gameOver) {
      setGameOver(true);
      handleGenerateLoveLetter(); // Call AI function when game ends
    }
  }, [player1Words, player2Words]);

  // Build the love letter with proper grammar
  const buildLoveLetter = () => {
    const dear = player2Words[0] || "_____";
    const action = player1Words[0] || "_____";
    const feature = player2Words[1] ? addArticle(player2Words[1]) : "_____";
    const quality = player1Words[1] || "_____";
    const feeling = player2Words[2] || "_____";
    const adventure = player1Words[2] || "_____";
    const petName = player2Words[3] || "_____";
    const promise = player1Words[3] || "_____";
    const signature = player1Words[4] || "_____";

    return `
      Dear ${dear},

      ${randomEvent ? randomEvent + "\n" : ""}
      From the moment I ${action} you and noticed ${feature}, 
      I knew you were the one. Your ${quality} nature makes me feel ${feeling}, 
      and I can't stop thinking about the time we ${adventure} together. 
      You are my ${petName}, and I promise to ${promise} you.
      
      Forever yours,
      ${signature}
    `;
  };

  const handleWordSelect = (word) => {
    if (currentPlayer === 1) {
      setPlayer1Words([...player1Words, word]);
    } else {
      setPlayer2Words([...player2Words, word]);
    }
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };


  
  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-pink-200 to-purple-200">
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
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
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose a word:</h3>
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
              <li key={index} className="text-pink-800 p-3 bg-pink-100 rounded-lg font-medium shadow-sm">
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
              <li key={index} className="text-purple-800 p-3 bg-purple-100 rounded-lg font-medium shadow-sm">
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
          <h2 className="text-3xl font-bold text-pink-700 mb-6">Your AI Love Letter:</h2>

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
    </div>
  </div>
);
};
export default App;