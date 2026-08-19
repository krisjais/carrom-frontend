'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useChessTheme } from '@/context/ChessThemeContext';

export function Chess3DHeroCanvas() {
  const mountRef = useRef(null);
  const { theme } = useChessTheme();
  const [isMobile, setIsMobile] = useState(false);

  const sceneRef = useRef(null);
  const boardMatRef = useRef(null);
  const keyLightRef = useRef(null);
  const fillLightRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Three.js Initialization
  useEffect(() => {
    if (isMobile || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 8.2);
    camera.lookAt(0, 1.4, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting Setup for High-Visibility Contrast
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(6, 10, 8);
    keyLight.castShadow = true;
    keyLightRef.current = keyLight;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.8);
    fillLight.position.set(-6, 6, 6);
    fillLightRef.current = fillLight;
    scene.add(fillLight);

    // Gold Championship Rim Light
    const rimLight = new THREE.SpotLight(0xffd700, 8);
    rimLight.position.set(-7, 5, -5);
    rimLight.lookAt(0, 1.5, 0);
    scene.add(rimLight);

    // 5. Board Surface
    const boardGeo = new THREE.BoxGeometry(7.5, 0.2, 7.5);
    const boardMat = new THREE.MeshStandardMaterial({
      color: theme === 'dark' ? 0x111115 : 0x222228,
      roughness: 0.15,
      metalness: 0.8
    });
    boardMatRef.current = boardMat;
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = 0;
    board.receiveShadow = true;
    scene.add(board);

    // 6. High-Visibility Specular Metallic Chess King Piece
    const kingGroup = new THREE.Group();

    // High-Contrast Metallic Steel Material
    const pieceMat = new THREE.MeshStandardMaterial({
      color: 0x585864,
      roughness: 0.1,
      metalness: 0.92
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.15,
      metalness: 0.95
    });

    // Base
    const baseGeo = new THREE.CylinderGeometry(1.1, 1.35, 0.4, 32);
    const base = new THREE.Mesh(baseGeo, pieceMat);
    base.position.y = 0.3;
    base.castShadow = true;
    kingGroup.add(base);

    // Gold Ring 1
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.13, 0.05, 16, 32), goldAccentMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.5;
    kingGroup.add(ring1);

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.7, 1.05, 1.85, 32);
    const body = new THREE.Mesh(bodyGeo, pieceMat);
    body.position.y = 1.42;
    body.castShadow = true;
    kingGroup.add(body);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.65, 0.6, 32), pieceMat);
    neck.position.y = 2.62;
    neck.castShadow = true;
    kingGroup.add(neck);

    // Gold Ring 2
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.05, 16, 32), goldAccentMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 2.92;
    kingGroup.add(ring2);

    // Crown Top
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.92, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.65), pieceMat);
    crown.position.y = 3.22;
    crown.castShadow = true;
    kingGroup.add(crown);

    // Cross Top (Championship Gold Symbol)
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), goldAccentMat);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.14), goldAccentMat);
    crossV.position.y = 4.15;
    crossH.position.y = 4.2;
    kingGroup.add(crossV);
    kingGroup.add(crossH);

    kingGroup.position.set(0, 0, 0);
    scene.add(kingGroup);

    // 7. Floating Gold Particles
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = Math.random() * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Mouse Parallax Motion
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX = (x / width - 0.5) * 2;
      mouseY = (y / height - 0.5) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 9. Render Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Continuous gentle rotation
      kingGroup.rotation.y = elapsed * 0.22;

      // Mouse Parallax Response
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 1.3;
      camera.position.y = 3.2 - targetY * 0.7;
      camera.lookAt(0, 1.5, 0);

      particles.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);

      boardGeo.dispose();
      boardMat.dispose();
      pieceMat.dispose();
      goldAccentMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isMobile]);

  // Dynamic Theme Adaptations
  useEffect(() => {
    if (boardMatRef.current && keyLightRef.current && fillLightRef.current) {
      if (theme === 'dark') {
        boardMatRef.current.color.setHex(0x111115);
        keyLightRef.current.intensity = 2.8;
        fillLightRef.current.intensity = 1.5;
      } else {
        boardMatRef.current.color.setHex(0x222228);
        keyLightRef.current.intensity = 3.5;
        fillLightRef.current.intensity = 2.0;
      }
    }
  }, [theme]);

  if (isMobile) {
    return (
      <div className="w-full h-full relative min-h-[300px] overflow-hidden rounded-2xl">
        <img
          src="/chess_hero_banner.jpg"
          alt="Chess King 3D Visual"
          className="w-full h-full object-cover object-right filter brightness-110 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[380px] lg:min-h-[460px] relative overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing"
    />
  );
}
