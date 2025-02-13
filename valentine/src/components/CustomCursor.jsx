import { useState, useEffect } from "react";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isClicking, setIsClicking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.matchMedia("(hover: none) and (pointer: coarse)").matches
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (isMobile) return;

    let lastUpdate = 0;
    const TRAIL_INTERVAL = 50;

    const updatePosition = (e) => {
      const now = Date.now();
      setPosition({ x: e.clientX, y: e.clientY });

      if (now - lastUpdate > TRAIL_INTERVAL) {
        setTrail((prevTrail) =>
          [
            ...prevTrail,
            {
              x: e.clientX,
              y: e.clientY,
              id: now,
              size: Math.random() * 8 + 4,
            },
          ].slice(-15)
        );
        lastUpdate = now;
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const cleanupInterval = setInterval(() => {
      setTrail((prevTrail) =>
        prevTrail.filter((heart) => Date.now() - heart.id < 1000)
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
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]);

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
            fill="#fda4af"
          />
        </svg>
      </div>
    );
  };

  if (isMobile) return null;

  return (
    <>
      {trail.map((heart) => (
        <TrailingHeart key={heart.id} {...heart} />
      ))}

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
        <div className="absolute inset-0 animate-pulse bg-pink-200 rounded-full blur-md opacity-50 w-8 h-8" />
        <div
          className={`relative w-8 h-8 transition-transform duration-150 ${
            isClicking ? "scale-90" : "scale-100"
          }`}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#ec4899"
              className="drop-shadow-md"
            />
          </svg>
        </div>
      </div>

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
