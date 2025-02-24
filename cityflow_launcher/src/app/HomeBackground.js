import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HomeBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let start_scene = new THREE.Scene();

    // camera
    let start_camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    start_camera.position.set(2, 1, 5);
    start_camera.lookAt(new THREE.Vector3(0, 0, 0));

    // renderer
    let renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // grid helper
    const gridSize = 20;
    const divisions = 20;
    let start_gridHelper = new THREE.GridHelper(
      gridSize,
      divisions,
      0x424242,
      0x424242
    );
    start_scene.add(start_gridHelper);
    start_gridHelper.position.y -= 1;

    // light
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    start_scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 10);
    start_scene.add(pointLight);

    // create buildings
    const buildings = [];
    const buildingMaterial = new THREE.MeshPhongMaterial({
      color: 0x282828,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < 100; i++) {
      const width = Math.random() * 0.6 + 0.1;
      const height = Math.random() * 1.4 + 0.1;
      const depth = Math.random() * 1 + 0.1;
      const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

      building.position.set(
        (Math.random() - 0.5) * 10, // x position
        height / 2 - 1, // y position (half of height to position it on the ground)
        (Math.random() - 0.5) * 10 // z position
      );

      buildings.push(building);
      start_scene.add(building);
    }

    // // create floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate the floor to be horizontal
    floor.position.y = -1.01; // Position the floor slightly below the grid
    start_scene.add(floor);

    // animate
    function animate() {
      requestAnimationFrame(animate);
      start_scene.rotation.y += 0.001; // Rotate the scene around y-axis

      renderer.render(start_scene, start_camera);
    }

    function render() {
      renderer.render(start_scene, start_camera);
    }

    window.addEventListener('resize', onWindowResize);
    function onWindowResize() {
      const renderWidth = window.innerWidth;
      const renderHeight = window.innerHeight;
      start_camera.aspect = renderWidth / renderHeight;
      start_camera.updateProjectionMatrix();
      renderer.setSize(renderWidth, renderHeight);
      render();
    }

    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      id="sceneContainer"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1,
        position: 'fixed',
      }}
    ></div>
  );
};

export default HomeBackground;
