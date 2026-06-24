import { useTexture } from "@react-three/drei"
import * as THREE from "three"

export default function Book({ front,spine,back,height,width,depth }) {


  const [frontTexture, spineTexture, backTexture] = useTexture([
    front,
    spine,
    back,
  ])

  frontTexture.colorSpace = THREE.SRGBColorSpace
  spineTexture.colorSpace = THREE.SRGBColorSpace
  backTexture.colorSpace = THREE.SRGBColorSpace

  const sideMaterial = new THREE.MeshStandardMaterial ({
    color:"#eeeedd",
  })

  const materials = [
    sideMaterial,
    new THREE.MeshStandardMaterial ({ map: spineTexture }),
    sideMaterial,
    sideMaterial,
    new THREE.MeshStandardMaterial ({ map: frontTexture }),
    new THREE.MeshStandardMaterial ({ map: backTexture }),
  ]

  return (
    <mesh
      rotation={[Math.PI / 15, Math.PI / 4, 0]}
      material={materials}
    >
      <boxGeometry
args={[
  3*(width/height),
  3,
  3*(depth/height),
]}
      />
    </mesh>
  )
}