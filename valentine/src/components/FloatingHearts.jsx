import React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const FloatingHearts = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
          }}
          animate={{
            y: -100,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 2,
          }}
        >
          <div className="relative">
            {/* Outer glow */}
            <motion.div
              className="absolute inset-0 bg-pink-500 rounded-full blur-xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Inner glow */}
            <motion.div
              className="absolute inset-0 bg-pink-400 rounded-full blur-md"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <Heart
              className="relative z-10 text-pink-300"
              size={20 + Math.random() * 20}
              fill="#ec4899"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
