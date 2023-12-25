/*
* Searches/recieves model in terms of json, glft, obj, or FBX form
* It returns an THREE.object3D
*/

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Objects of the Hooks
type ModelFormat = 'gltf' | 'obj' | 'fbx' | 'json';

interface RotatingModelProps {
  url: string,
  format: ModelFormat
};

const LazyModel = React.lazy(() => import('./RotatingModel'));

export const CanvasComponent: React.FC<{ url: string; format: ModelFormat }> = ({ url, format }) => {
  return (
      <Canvas>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <RotatingModel url={url} format={format} />
      </Canvas>
  );
};

const RotatingModel: React.FC<RotatingModelProps> = ({ url, format }) => {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const ref = useRef<THREE.Object3D>();

  useEffect(() => {
    useModelLoader(url, format, true).then(loadedModel => {
          setModel(loadedModel);
      });
  }, [url, format]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.01;
    }
  });

  return model ? <primitive object={model} ref={modelRef} /> : null;
};

const useModelLoader = (url: string, format: ModelFormat, isVisible: boolean): THREE.Object3D<THREE.Object3DEventMap> => {
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (isVisible && !model) {
      loadModel(url, format).then(loadedModel => {
        setModel(loadedModel);
      });
    }
  }, [url, format, isVisible, model]);

  return model == null ? new THREE.Object3D : model;
};

const loadModel = async (url: string, format: ModelFormat): Promise<THREE.Object3D> => {
  switch (format) {
    case 'gltf':
      const gltf = await new GLTFLoader().loadAsync(url);
      return gltf.scene;
    case 'obj':
      return await new OBJLoader().loadAsync(url);
    case 'fbx':
      return await new FBXLoader().loadAsync(url);
    case 'json':
      return new Promise((resolve, reject) =>
        new THREE.ObjectLoader().load(url, resolve, undefined, reject));
  }
};
