import { useState, useEffect } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    let lastUpdate = 0;
    const TRAIL_INTERVAL = 50; // Adjust this to control trail density

    const updatePosition = (e) => {
      const now = Date.now();
      setPosition({ x: e.clientX, y: e.clientY });

      // Add new trail heart if enough time has passed
      if (now - lastUpdate > TRAIL_INTERVAL) {
        setTrail((prevTrail) =>
          [
            ...prevTrail,
            {
              x: e.clientX,
              y: e.clientY,
              id: now,
              size: Math.random() * 8 + 4, // Random size between 4-12px
            },
          ].slice(-15)
        ); // Keep only last 15 hearts
        lastUpdate = now;
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Clean old trail hearts periodically
    const cleanupInterval = setInterval(() => {
      setTrail((prevTrail) =>
        prevTrail.filter(
          (heart) => Date.now() - heart.id < 1000 // Remove hearts older than 1 second
        )
      );
    }, 100);

    document.addEventListener("mousemove", updatePosition);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
      clearInterval(cleanupInterval);
    };
  }, []);

  const TrailingHeart = ({ x, y, size, id }) => {
    const age = Date.now() - id;
    const opacity = Math.max(0, 1 - age / 1000);

    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: "translate(-50%, -50%)",
          opacity,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className="animate-float"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#fda4af" // Tailwind rose-300
          />
        </svg>
      </div>
    );
  };

  return (
    <>
      {/* Trail hearts */}
      {trail.map((heart) => (
        <TrailingHeart key={heart.id} {...heart} />
      ))}

      {/* Main cursor heart */}
      <div
        className={`fixed pointer-events-none z-50 transition-transform duration-75 ${
          isClicking ? "scale-75" : "scale-100"
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer glow effect */}
        <div className="absolute inset-0 animate-pulse bg-pink-200 rounded-full blur-md opacity-50 w-8 h-8" />

        {/* Main heart */}
        <div
          className={`relative w-8 h-8 transition-transform duration-150 ${
            isClicking ? "scale-90" : "scale-100"
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#ec4899" // Tailwind pink-500
              className="drop-shadow-md"
            />
          </svg>
        </div>
      </div>

      {/* Add floating animation */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translate(-50%, -50%) translateY(0px) rotate(0deg);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px) rotate(10deg);
          }
          100% {
            transform: translate(-50%, -50%) translateY(-20px) rotate(20deg);
          }
        }
        .animate-float {
          animation: float 1s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
