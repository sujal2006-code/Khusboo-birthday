import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Sparkles, ArrowRight, Music, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audioSynth';
import PostCakeCelebration from './PostCakeCelebration';

export default function CakeCutting({ onNext, onMusicStart }) {
  const mountRef = useRef(null);
  const [knifePicked, setKnifePicked] = useState(false);
  const [cakeCut, setCakeCut] = useState(false);
  const [instruction, setInstruction] = useState("Your birthday cake is ready! Pick up the knife and cut your cake! 🎂");
  const [touchStartX, setTouchStartX] = useState(null);

  // Three.js references
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const cakeSliceRef = useRef(null);
  const knifeMeshRef = useRef(null);
  const flamesRef = useRef([]);
  const flameLightsRef = useRef([]);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5.5, 9);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const softFillLight = new THREE.DirectionalLight(0xe6e6fa, 0.8);
    softFillLight.position.set(-6, 6, -4);
    scene.add(softFillLight);

    // Warm table glow
    const tableLight = new THREE.PointLight(0xffb6c1, 1.2, 8);
    tableLight.position.set(0, 3, 0);
    scene.add(tableLight);

    // 4. Birthday Table & Platter
    // Table Top
    const tableGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.3, 40);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0xfdf7f2,
      roughness: 0.3,
      metalness: 0.1
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.15;
    table.receiveShadow = true;
    scene.add(table);

    // Platter Stand (Rose Gold / Gold)
    const platterGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.12, 40);
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0xdfba73,
      metalness: 0.8,
      roughness: 0.2
    });
    const platter = new THREE.Mesh(platterGeo, platterMat);
    platter.position.y = 0.06;
    platter.receiveShadow = true;
    scene.add(platter);

    const platterPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 0.3, 32),
      platterMat
    );
    platterPedestal.position.y = -0.05;
    scene.add(platterPedestal);

    // 5. CAKE GEOMETRIES & MATERIALS
    // Cake Group
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    // Color definitions
    const pastelPink = 0xffc4d0;
    const pastelWhite = 0xfffcf7;
    const spongeColor = 0xffeedb;
    const fillingPink = 0xff69b4;
    const roseGoldColor = 0xb76e79;

    const pinkIcingMat = new THREE.MeshStandardMaterial({
      color: pastelPink,
      roughness: 0.4,
      metalness: 0.05
    });

    const whiteIcingMat = new THREE.MeshStandardMaterial({
      color: pastelWhite,
      roughness: 0.35,
      metalness: 0.05
    });

    const crumbMat = new THREE.MeshStandardMaterial({
      color: spongeColor,
      roughness: 0.8
    });

    const fillingMat = new THREE.MeshStandardMaterial({
      color: fillingPink,
      roughness: 0.3
    });

    // Angle of the cut slice: 45 degrees (PI / 4)
    const sliceAngle = Math.PI / 4;
    const remainingAngle = Math.PI * 2 - sliceAngle;

    // --- Main Cake (remaining 315 deg) ---
    // Bottom Tier Main (radius 2.0, height 1.1)
    const bottomTierGeo = new THREE.CylinderGeometry(
      2.0, 2.0, 1.1, 36, 1, false,
      sliceAngle, remainingAngle
    );
    const bottomTier = new THREE.Mesh(bottomTierGeo, pinkIcingMat);
    bottomTier.position.y = 0.67;
    bottomTier.castShadow = true;
    bottomTier.receiveShadow = true;
    cakeGroup.add(bottomTier);

    // Top Tier Main (radius 1.3, height 0.9)
    const topTierGeo = new THREE.CylinderGeometry(
      1.3, 1.3, 0.9, 32, 1, false,
      sliceAngle, remainingAngle
    );
    const topTier = new THREE.Mesh(topTierGeo, whiteIcingMat);
    topTier.position.y = 1.67;
    topTier.castShadow = true;
    topTier.receiveShadow = true;
    cakeGroup.add(topTier);

    // Cut face walls for main bottom tier
    const cutPlaneGeoBottom = new THREE.PlaneGeometry(2.0, 1.1);
    const cutWallBottom1 = new THREE.Mesh(cutPlaneGeoBottom, crumbMat);
    cutWallBottom1.position.set(1.0, 0.67, 0);
    cutWallBottom1.rotation.y = Math.PI / 2;
    cakeGroup.add(cutWallBottom1);

    const cutWallBottom2 = new THREE.Mesh(cutPlaneGeoBottom, crumbMat);
    cutWallBottom2.position.set(
      Math.cos(sliceAngle) * 1.0,
      0.67,
      Math.sin(sliceAngle) * 1.0
    );
    cutWallBottom2.rotation.y = Math.PI / 2 + sliceAngle;
    cakeGroup.add(cutWallBottom2);

    // Decorative Rose-Gold Pearls Ring on Bottom Tier Base
    const pearlsCount = 28;
    const pearlMat = new THREE.MeshStandardMaterial({
      color: roseGoldColor,
      metalness: 0.85,
      roughness: 0.2
    });
    for (let i = 0; i < pearlsCount; i++) {
      const angle = sliceAngle + (i / pearlsCount) * remainingAngle;
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), pearlMat);
      pearl.position.set(Math.cos(angle) * 1.95, 0.18, Math.sin(angle) * 1.95);
      cakeGroup.add(pearl);
    }

    // Frosting Swirls on Top Tier Base
    const swirlsCount = 20;
    const swirlMat = new THREE.MeshStandardMaterial({
      color: pastelPink,
      roughness: 0.3
    });
    for (let i = 0; i < swirlsCount; i++) {
      const angle = sliceAngle + (i / swirlsCount) * remainingAngle;
      const swirl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), swirlMat);
      swirl.position.set(Math.cos(angle) * 1.3, 1.25, Math.sin(angle) * 1.3);
      cakeGroup.add(swirl);
    }

    // --- SEPARATE CAKE SLICE (animates outward on cut) ---
    const sliceGroup = new THREE.Group();
    cakeSliceRef.current = sliceGroup;

    // Bottom Tier Slice
    const bottomSliceGeo = new THREE.CylinderGeometry(
      2.0, 2.0, 1.1, 16, 1, false,
      0, sliceAngle
    );
    const bottomSlice = new THREE.Mesh(bottomSliceGeo, pinkIcingMat);
    bottomSlice.position.y = 0.67;
    bottomSlice.castShadow = true;
    sliceGroup.add(bottomSlice);

    // Top Tier Slice
    const topSliceGeo = new THREE.CylinderGeometry(
      1.3, 1.3, 0.9, 14, 1, false,
      0, sliceAngle
    );
    const topSlice = new THREE.Mesh(topSliceGeo, whiteIcingMat);
    topSlice.position.y = 1.67;
    topSlice.castShadow = true;
    sliceGroup.add(topSlice);

    // Cut face walls for slice
    const sliceWall1 = new THREE.Mesh(cutPlaneGeoBottom, crumbMat);
    sliceWall1.position.set(1.0, 0.67, 0);
    sliceWall1.rotation.y = -Math.PI / 2;
    sliceGroup.add(sliceWall1);

    const sliceWall2 = new THREE.Mesh(cutPlaneGeoBottom, crumbMat);
    sliceWall2.position.set(
      Math.cos(sliceAngle) * 1.0,
      0.67,
      Math.sin(sliceAngle) * 1.0
    );
    sliceWall2.rotation.y = -(Math.PI / 2 + sliceAngle);
    sliceGroup.add(sliceWall2);

    cakeGroup.add(sliceGroup);

    // --- 20 BIRTHDAY CANDLES & REALISTIC FLICKERING FLAMES ---
    const candleCount = 20;
    const candlesGroup = new THREE.Group();
    cakeGroup.add(candlesGroup);

    const candleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3
    });
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      wireframe: false
    });

    const flames = [];
    const flameLights = [];

    // Distribute candles: 12 on bottom tier rim, 8 on top tier
    for (let i = 0; i < candleCount; i++) {
      const isTop = i < 8;
      const countInRing = isTop ? 8 : 12;
      const ringIdx = isTop ? i : i - 8;
      const radius = isTop ? 1.0 : 1.75;
      const baseY = isTop ? 2.12 : 1.22;
      const angle = (ringIdx / countInRing) * Math.PI * 2;

      // Candle Stick
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 10), candleMat);
      stick.position.set(Math.cos(angle) * radius, baseY + 0.175, Math.sin(angle) * radius);
      stick.castShadow = true;
      candlesGroup.add(stick);

      // Wick
      const wick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.06, 6),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
      );
      wick.position.set(Math.cos(angle) * radius, baseY + 0.38, Math.sin(angle) * radius);
      candlesGroup.add(wick);

      // Flame Mesh (tear-drop shape)
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 8), flameMat);
      flame.position.set(Math.cos(angle) * radius, baseY + 0.44, Math.sin(angle) * radius);
      candlesGroup.add(flame);
      flames.push(flame);

      // A small point light for warm glow around top candles
      if (i % 4 === 0) {
        const pl = new THREE.PointLight(0xffa500, 0.4, 1.2);
        pl.position.copy(flame.position);
        candlesGroup.add(pl);
        flameLights.push(pl);
      }
    }
    flamesRef.current = flames;
    flameLightsRef.current = flameLights;

    // --- 3D TOPPER "20" (Rose Gold) ---
    const topperGroup = new THREE.Group();
    topperGroup.position.set(0, 2.3, 0);

    const topperMat = new THREE.MeshStandardMaterial({
      color: 0xb76e79,
      metalness: 0.9,
      roughness: 0.2
    });

    // Create a stylish "20" topper emblem
    const topperDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.05, 32),
      topperMat
    );
    topperDisc.rotation.x = Math.PI / 2;
    topperGroup.add(topperDisc);

    // Ring border
    const topperRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.03, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0xdfba73, metalness: 0.9, roughness: 0.2 })
    );
    topperRing.position.z = 0.03;
    topperGroup.add(topperRing);

    // Stem connecting into cake
    const topperStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.6, 12),
      topperMat
    );
    topperStem.position.y = -0.45;
    topperGroup.add(topperStem);

    // Inner Canvas Texture with "20"
    const canvas20 = document.createElement('canvas');
    canvas20.width = 256;
    canvas20.height = 256;
    const ctx20 = canvas20.getContext('2d');
    ctx20.fillStyle = '#FFF5F7';
    ctx20.fillRect(0, 0, 256, 256);
    ctx20.font = 'bold 120px "Playfair Display", Georgia, serif';
    ctx20.fillStyle = '#8B4853';
    ctx20.textAlign = 'center';
    ctx20.textBaseline = 'middle';
    ctx20.fillText('20', 128, 128);

    const texture20 = new THREE.CanvasTexture(canvas20);
    const badge20 = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 32),
      new THREE.MeshBasicMaterial({ map: texture20 })
    );
    badge20.position.z = 0.035;
    topperGroup.add(badge20);

    cakeGroup.add(topperGroup);

    // --- 3D CAKE KNIFE ---
    const knife = new THREE.Group();
    knifeMeshRef.current = knife;

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.12, 1.4, 0.015);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.95,
      roughness: 0.1
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.7;
    knife.add(blade);

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.8, 16);
    const handleMat = new THREE.MeshStandardMaterial({
      color: roseGoldColor,
      metalness: 0.7,
      roughness: 0.3
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.4;
    knife.add(handle);

    // Initial position of knife resting on table beside cake
    knife.position.set(2.8, 0.12, 1.0);
    knife.rotation.z = Math.PI / 2;
    knife.rotation.y = -0.3;
    scene.add(knife);

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating candle flame flicker
      if (flamesRef.current.length > 0) {
        flamesRef.current.forEach((flame, i) => {
          const s = 1 + Math.sin(elapsedTime * 12 + i) * 0.15;
          flame.scale.set(s, s * 1.1, s);
        });
      }

      // Flame light flickering
      if (flameLightsRef.current.length > 0) {
        flameLightsRef.current.forEach((light, i) => {
          light.intensity = 0.35 + Math.sin(elapsedTime * 10 + i * 2) * 0.15;
        });
      }

      // Gentle subtle rotation of cake when not interacting
      cakeGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 450;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (renderer.domElement && container) {
        container.innerHTML = '';
      }
      renderer.dispose();
    };
  }, []);

  // Step 4: Pick up knife
  const handlePickupKnife = () => {
    if (cakeCut) return;
    setKnifePicked(true);
    sound.playChime();
    setInstruction("Now drag or swipe the knife across the cake to cut! ✨");

    // Animate knife into raised cutting position above cake
    if (knifeMeshRef.current) {
      const knife = knifeMeshRef.current;
      knife.position.set(0.8, 3.2, 0.8);
      knife.rotation.set(0.3, -Math.PI / 4, Math.PI / 8);
    }
  };

  // Step 5 & 6 & 7: Cut the cake
  const executeCutAnimation = () => {
    if (cakeCut) return;
    setCakeCut(true);
    setInstruction("Happy 20th Birthday, Khusboo! 🎉✨");

    sound.playSlice();

    // 1. Knife cuts downward into cake
    if (knifeMeshRef.current) {
      const knife = knifeMeshRef.current;
      knife.position.set(0.6, 1.4, 0.6);
      knife.rotation.set(0, -Math.PI / 4, 0);

      // Retract knife after cut
      setTimeout(() => {
        if (knifeMeshRef.current) {
          knifeMeshRef.current.position.set(3.2, 0.15, 1.2);
          knifeMeshRef.current.rotation.set(0, 0, Math.PI / 2);
        }
      }, 700);
    }

    // 2. Slice separates and glides forward
    if (cakeSliceRef.current) {
      const slice = cakeSliceRef.current;
      let step = 0;
      const sliceInterval = setInterval(() => {
        step += 1;
        slice.position.x += 0.05;
        slice.position.z += 0.05;
        slice.position.y = Math.sin(step * 0.15) * 0.05;
        if (step >= 20) clearInterval(sliceInterval);
      }, 25);
    }

    // 3. Candles blow out (scale to 0)
    setTimeout(() => {
      if (flamesRef.current) {
        flamesRef.current.forEach(flame => {
          flame.scale.set(0, 0, 0);
        });
      }
      if (flameLightsRef.current) {
        flameLightsRef.current.forEach(light => {
          light.intensity = 0;
        });
      }
    }, 400);

    // 4. Confetti & Flower Petals Explosion
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FFD1DC', '#E6E6FA', '#FFDAB9', '#B76E79', '#DFBA73']
      });

      confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.3 },
        colors: ['#FFFFFF', '#FFB6C1', '#D8BFD8']
      });
    }, 600);

    // 5. Birthday instrumental music begins
    setTimeout(() => {
      sound.playBirthdayMusic();
      if (onMusicStart) onMusicStart();
    }, 900);
  };

  // Drag / Touch gestures for knife cutting
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX !== null && e.changedTouches && e.changedTouches[0]) {
      const diffX = Math.abs(e.changedTouches[0].clientX - touchStartX);
      if (diffX > 40 && knifePicked && !cakeCut) {
        executeCutAnimation();
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-start px-4 py-8 select-none">
      {/* Headings */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto text-center mb-2 z-10"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-rose-100 text-xs font-semibold text-[#8B4853] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
          <span>The Grand 20th Celebration</span>
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#4A3E3D] mb-1">
          Time to Make a Wish! 🎂
        </h2>
        <p className="text-base sm:text-lg text-[#7A5C61] font-light">
          20 looks wonderful on you! Let's celebrate!
        </p>
      </motion.div>

      {/* Instruction Pill */}
      <motion.div
        key={instruction}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel-gold border border-rose-300 text-sm font-semibold text-[#8B4853] my-3 z-10 shadow-md"
      >
        <span>{instruction}</span>
      </motion.div>

      {/* 3D Canvas Container */}
      <div
        className="relative w-full max-w-2xl h-[420px] sm:h-[480px] rounded-3xl overflow-hidden glass-panel border border-rose-100 shadow-2xl flex items-center justify-center my-2 cake-canvas-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={mountRef} className="w-full h-full" />

        {/* Interactive Overlay Helper: Click knife to pick up */}
        {!knifePicked && !cakeCut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePickupKnife}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#B76E79] to-[#D88A96] text-white font-bold text-sm shadow-xl flex items-center gap-2 animate-bounce"
            >
              <span>🗡️ Pick Up Birthday Knife</span>
            </motion.button>
          </motion.div>
        )}

        {/* Interactive Helper: Cut Cake Trigger */}
        {knifePicked && !cakeCut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={executeCutAnimation}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#DFBA73] to-[#B76E79] text-white font-extrabold text-base shadow-2xl flex items-center gap-2"
            >
              <span>✂️ Cut Your Cake!</span>
            </motion.button>
            <span className="text-xs text-[#8B4853] bg-white/80 px-3 py-1 rounded-full shadow-xs">
              Swipe on screen or tap the button above to slice!
            </span>
          </motion.div>
        )}
      </div>

      {/* Post-Cut Transition to Grand Celebration (Page 8) */}
      <AnimatePresence>
        {cakeCut && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-md mx-auto mt-6 p-6 rounded-3xl bg-white/95 border-2 border-rose-300 text-center shadow-2xl z-20"
          >
            <div className="text-4xl mb-2 animate-bounce">🎂✨</div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#8B4853] mb-2">
              The Cake is Sliced! Happy 20th! 🌟
            </h3>
            <p className="text-xs sm:text-sm text-[#7A5C61] mb-5 font-medium">
              Your special wish has been made! Now let's jump into the grand celebration!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sound.playChime();
                onNext();
              }}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#DFBA73] via-[#B76E79] to-[#D88A96] text-white font-extrabold text-base shadow-xl shadow-rose-300/50 flex items-center justify-center gap-2 mx-auto hover:shadow-2xl transition-all"
            >
              <span>Enter Grand Celebration! 🥳</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
