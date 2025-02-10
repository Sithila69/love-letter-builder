import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const App = () => {
  const [player1Words, setPlayer1Words] = useState([]);
  const [player2Words, setPlayer2Words] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [randomEvent, setRandomEvent] = useState("");
  const [currentWordOptions, setCurrentWordOptions] = useState([]);

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
    const totalWords = player1Words.length + player2Words.length;
    const category = [
      'actions', 'features', 'qualities', 'adventures', 
      'petNames', 'promises', 'signatures'
    ][totalWords % 7];
    
    const shuffled = [...wordBank[category]].sort(() => 0.5 - Math.random());
    setCurrentWordOptions(shuffled.slice(0, 4));
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

  if (player1Words.length === 5 && player2Words.length === 4 && !gameOver) {
    setGameOver(true);
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-pink-100 to-purple-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-pink-600 mb-4 flex items-center justify-center gap-2">
          Love Letter Builder <Heart className="text-red-500" />
        </h1>
        
        {randomEvent && (
          <div className="text-center py-2 px-4 bg-pink-100 rounded-full mb-4 animate-bounce">
            {randomEvent}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-pink-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-pink-600 mb-2">Player 1's Words</h3>
            <ul className="space-y-1">
              {player1Words.map((word, index) => (
                <li key={index} className="text-pink-700">{word}</li>
              ))}
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-600 mb-2">Player 2's Words</h3>
            <ul className="space-y-1">
              {player2Words.map((word, index) => (
                <li key={index} className="text-purple-700">{word}</li>
              ))}
            </ul>
          </div>
        </div>

        {!gameOver ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-pink-600">
              Player {currentPlayer}'s Turn
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {currentWordOptions.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleWordSelect(word)}
                  className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full hover:from-pink-500 hover:to-purple-500 transform hover:scale-105 transition-all"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">Your Love Letter:</h2>
            <pre className="whitespace-pre-wrap bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-lg text-gray-800 font-medium mb-6">
              {buildLoveLetter()}
            </pre>
            <button
              onClick={() => {
                setPlayer1Words([]);
                setPlayer2Words([]);
                setGameOver(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full hover:from-pink-500 hover:to-purple-500 transform hover:scale-105 transition-all"
            >
              Write Another Letter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;