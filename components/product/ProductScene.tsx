import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'

// Explicitly set Draco decoder path for high-quality loading (module scope)
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'
useGLTF.setDecoderPath(DRACO_PATH)

export default function ProductScene({ modelUrl }: { modelUrl: string }) {
  const { scene } = useGLTF(modelUrl)
  return <primitive object={scene} />
}

export function ProductSceneWrapper({ modelUrl }: { modelUrl: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ProductScene modelUrl={modelUrl} />
      <OrbitControls autoRotate enableZoom={false} />
      <Environment preset="city" />
    </Canvas>
  )
}
