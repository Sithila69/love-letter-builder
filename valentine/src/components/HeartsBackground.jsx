import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

const LoveGameBackground = () => {
  const mountRef = useRef(null);

  // Create heart geometry once using useMemo
  const heartGeometry = useMemo(() => {
    const heartShape = new THREE.Shape();
    const x = 0,
      y = 0;

    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    return new THREE.ShapeGeometry(heartShape);
  }, []);

  // Create material once using useMemo
  const heartMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ff69b4",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      }),
    []
  );

  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene and camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ffecf2");

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // Create renderer with optimized settings
    const renderer = new THREE.WebGLRenderer({
      canvas: mountRef.current,
      antialias: false, // Disable antialiasing for better performance
      powerPreference: "high-performance",
      alpha: false, // Disable alpha since we have a solid background
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio

    // Resize handler with debouncing
    let resizeTimeout;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }, 250); // Debounce resize events
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Create hearts with optimized animation data
    const hearts = new Array(10).fill(null).map(() => ({
      // Reduced number of hearts
      mesh: new THREE.Mesh(heartGeometry, heartMaterial),
      rotationSpeed: Math.random() * 0.01 - 0.005, // Reduced rotation speed
      floatSpeed: Math.random() * 0.01 + 0.005, // Reduced float speed
      yOffset: Math.random() * Math.PI * 2, // Random starting phase
    }));

    hearts.forEach((heart) => {
      heart.mesh.position.set(
        Math.random() * 80 - 40,
        Math.random() * 80 - 40,
        Math.random() * 40 - 20
      );
      heart.mesh.rotation.z = Math.random() * Math.PI;
      heart.mesh.scale.set(0.2, 0.2, 0.2);
      scene.add(heart.mesh);
    });

    // Optimization: Use fixed time step for animation
    const STEP = 1 / 60;
    let lastTime = 0;
    let accumulator = 0;

    const animate = (currentTime) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      accumulator += deltaTime;

      while (accumulator >= STEP) {
        hearts.forEach((heart) => {
          heart.mesh.rotation.z += heart.rotationSpeed;
          heart.mesh.position.y +=
            Math.sin(currentTime * 0.001 + heart.yOffset) * heart.floatSpeed;

          if (heart.mesh.position.y > 40) heart.mesh.position.y = -40;
        });
        accumulator -= STEP;
      }

      renderer.render(scene, camera);
      return requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      // Proper disposal of resources
      heartGeometry.dispose();
      heartMaterial.dispose();
      renderer.dispose();

      hearts.forEach((heart) => {
        scene.remove(heart.mesh);
        heart.mesh.geometry.dispose();
      });
    };
  }, [heartGeometry, heartMaterial]);

  return (
    <canvas
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
};

export default LoveGameBackground;
