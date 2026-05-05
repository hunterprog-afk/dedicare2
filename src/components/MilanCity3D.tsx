import { useEffect, useRef } from "react"
import * as THREE from "three"

// Skyline di Milano: [x, z, larghezza, profondità, altezza, tipo]
// tipo: 0=generico, 1=Torre Unicredit (spira), 2=Pirelli, 3=Velasca
const BUILDINGS: [number, number, number, number, number, number][] = [
  // Cluster centro — Torre Unicredit area
  [0, 0, 1.4, 1.4, 9.5, 1],    // Torre Unicredit
  [2.2, 0.3, 1.0, 1.0, 7.2, 2], // Pirelli
  [-2.0, -0.5, 1.2, 1.2, 5.8, 3], // Velasca-like
  [3.8, -0.8, 0.9, 1.1, 6.4, 0],
  [-3.4, 0.6, 1.1, 0.9, 4.9, 0],
  [1.2, -2.0, 1.3, 1.0, 5.2, 0],
  [-1.0, 1.8, 0.8, 1.2, 4.6, 0],
  // Secondo ring
  [5.0, 1.2, 0.8, 0.8, 4.0, 0],
  [-4.8, -1.0, 0.9, 0.7, 3.6, 0],
  [4.2, -2.5, 0.7, 0.9, 3.2, 0],
  [-3.0, 2.8, 0.8, 0.8, 2.8, 0],
  [2.0, 2.8, 0.7, 0.7, 3.0, 0],
  [-5.5, 1.5, 0.6, 0.8, 2.4, 0],
  [0.5, 3.5, 0.7, 0.6, 2.2, 0],
  [-1.8, -3.0, 0.8, 0.7, 2.6, 0],
  [5.8, -0.5, 0.6, 0.6, 2.0, 0],
  [-2.8, -2.2, 0.7, 0.8, 3.4, 0],
  [3.2, 3.0, 0.6, 0.6, 1.8, 0],
  // Fill periferia
  [6.5, 2.0, 0.5, 0.5, 1.5, 0],
  [-6.0, 0.5, 0.5, 0.6, 1.4, 0],
  [1.5, -4.0, 0.6, 0.5, 1.6, 0],
  [-0.5, -4.2, 0.5, 0.5, 1.2, 0],
  [6.0, -2.5, 0.5, 0.5, 1.8, 0],
  [-5.0, 3.0, 0.5, 0.5, 1.3, 0],
]

export function MilanCity3D() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W = el.clientWidth
    const H = el.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0f1a, 0.045)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200)
    camera.position.set(0, 7, 18)
    camera.lookAt(0, 2, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    // Lights
    const ambient = new THREE.AmbientLight(0x112240, 1.2)
    scene.add(ambient)

    const tealLight = new THREE.PointLight(0x15A89A, 3, 30)
    tealLight.position.set(0, 12, 0)
    scene.add(tealLight)

    const blueLight = new THREE.PointLight(0x0B5FA5, 2, 40)
    blueLight.position.set(-8, 8, 5)
    scene.add(blueLight)

    const rimLight = new THREE.DirectionalLight(0x15A89A, 0.4)
    rimLight.position.set(10, 15, -10)
    scene.add(rimLight)

    // Ground plane (base city)
    const groundGeo = new THREE.PlaneGeometry(30, 30)
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0d1422,
      roughness: 0.8,
      metalness: 0.3,
    })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid lines sul ground
    const gridHelper = new THREE.GridHelper(28, 28, 0x15A89A, 0x112240)
    gridHelper.position.y = 0.01
    ;(gridHelper.material as THREE.Material & { opacity: number; transparent: boolean }).opacity = 0.15
    ;(gridHelper.material as THREE.Material & { transparent: boolean }).transparent = true
    scene.add(gridHelper)

    const buildingGroup = new THREE.Group()
    scene.add(buildingGroup)

    // Materiali edifici
    const matDark = new THREE.MeshStandardMaterial({ color: 0x0e1a2e, roughness: 0.6, metalness: 0.5 })
    const matMid = new THREE.MeshStandardMaterial({ color: 0x112240, roughness: 0.5, metalness: 0.6 })
    const matTeal = new THREE.MeshStandardMaterial({ color: 0x15A89A, roughness: 0.3, metalness: 0.8, emissive: 0x0d5c55, emissiveIntensity: 0.3 })
    const matGlass = new THREE.MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.1, metalness: 0.9, emissive: 0x0B5FA5, emissiveIntensity: 0.1 })

    for (const [bx, bz, bw, bd, bh, tipo] of BUILDINGS) {
      const geo = new THREE.BoxGeometry(bw, bh, bd)
      const mat = tipo === 1 ? matGlass : tipo === 3 ? matTeal : [matDark, matMid][Math.floor(Math.random() * 2)]
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(bx, bh / 2, bz)
      mesh.castShadow = true
      mesh.receiveShadow = true
      buildingGroup.add(mesh)

      // Finestre (piccoli piani luminosi)
      if (bh > 2) {
        const floors = Math.floor(bh / 0.6)
        for (let f = 1; f < floors; f++) {
          if (Math.random() > 0.4) {
            const winGeo = new THREE.PlaneGeometry(bw * 0.85, 0.06)
            const winMat = new THREE.MeshBasicMaterial({
              color: Math.random() > 0.5 ? 0x15A89A : 0x4a9eff,
              opacity: Math.random() * 0.4 + 0.1,
              transparent: true,
            })
            const win = new THREE.Mesh(winGeo, winMat)
            win.position.set(bx, f * 0.6, bz + bd / 2 + 0.01)
            buildingGroup.add(win)
          }
        }
      }

      // Spira Torre Unicredit
      if (tipo === 1) {
        const spireGeo = new THREE.CylinderGeometry(0.05, 0.15, 2.5, 8)
        const spireMesh = new THREE.Mesh(spireGeo, matTeal)
        spireMesh.position.set(bx, bh + 1.25, bz)
        buildingGroup.add(spireMesh)

        // Luce rossa cima antenna
        const antLight = new THREE.PointLight(0x15A89A, 1.5, 6)
        antLight.position.set(bx, bh + 2.6, bz)
        buildingGroup.add(antLight)
      }
    }

    // Animazione — slow auto-rotate
    let frame: number
    let t = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      t += 0.003

      // Lenta rotazione orbitale della camera
      camera.position.x = Math.sin(t) * 18
      camera.position.z = Math.cos(t) * 18
      camera.lookAt(0, 2, 0)

      // Pulsazione luce teal
      tealLight.intensity = 2.5 + Math.sin(t * 2) * 0.5

      renderer.render(scene, camera)
    }
    animate()

    // Resize observer
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      const h = el.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[480px]"
      style={{ background: "transparent" }}
    />
  )
}
