// Gamma Ray Holdings - Shared 3D Animations
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function initGammaRayBackground() {
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.position.z = 5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4040ff, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffddaa, 1.5, 200);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Gamma Ray Colors
    const gammaColors = [
        0x8A2BE2, // Violet
        0x0066FF, // Blue
        0x00FFFF, // Cyan
        0x00FF41, // Green
        0xFFD700, // Yellow
        0xFF8C00, // Orange
        0xFF0040, // Red
        0xCC0000  // Deep Red
    ];

    // Central Solar Core with Gamma Ray Shader
    const coreGeometry = new THREE.IcosahedronGeometry(1.2, 15);
    const coreMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 1.0 },
            colors: { value: gammaColors.map(color => new THREE.Color(color)) }
        },
        vertexShader: `
            uniform float time;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying float noise;
            
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                vUv = uv;
                vPosition = position;
                noise = 3.0 * snoise(3.0 * position.xy + time * 0.3);
                vec3 newPosition = position + normal * noise * 0.08;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 colors[8];
            varying vec2 vUv;
            varying vec3 vPosition;
            varying float noise;
            
            void main() {
                float colorIndex = mod(time * 0.5 + noise * 2.0 + length(vPosition) * 3.0, 8.0);
                int index1 = int(floor(colorIndex));
                int index2 = int(mod(float(index1 + 1), 8.0));
                float mixFactor = fract(colorIndex);
                
                vec3 color1 = colors[index1];
                vec3 color2 = colors[index2];
                vec3 finalColor = mix(color1, color2, mixFactor);
                
                float intensity = 0.7 + 0.3 * sin(time * 2.0 + noise * 5.0);
                gl_FragColor = vec4(finalColor * intensity, 0.9);
            }
        `,
        blending: THREE.AdditiveBlending,
        transparent: true,
    });
    const solarCore = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(solarCore);

    // Gamma Ray Beams
    const rayGeometry = new THREE.CylinderGeometry(0.02, 0.02, 20, 8);
    const rays = [];
    
    for (let i = 0; i < 12; i++) {
        const rayMaterial = new THREE.MeshBasicMaterial({
            color: gammaColors[i % gammaColors.length],
            transparent: true,
            opacity: 0.6
        });
        const ray = new THREE.Mesh(rayGeometry, rayMaterial);
        
        const angle = (i / 12) * Math.PI * 2;
        ray.position.set(Math.cos(angle) * 3, Math.sin(angle) * 3, 0);
        ray.lookAt(0, 0, 0);
        ray.rotateX(Math.PI / 2);
        
        rays.push(ray);
        scene.add(ray);
    }

    // AI Neural Network (Orbiting Torus)
    const aiGeometry = new THREE.TorusKnotGeometry(2.2, 0.15, 200, 16);
    const aiMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.4,
        metalness: 0.9,
        roughness: 0.3
    });
    const aiCore = new THREE.Mesh(aiGeometry, aiMaterial);
    scene.add(aiCore);

    // Particle System for Energy
    const particleCount = 8000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3] = (Math.random() - 0.5) * 100;
        particlePositions[i3 + 1] = (Math.random() - 0.5) * 100;
        particlePositions[i3 + 2] = (Math.random() - 0.5) * 100;
        
        const color = new THREE.Color(gammaColors[Math.floor(Math.random() * gammaColors.length)]);
        particleColors[i3] = color.r;
        particleColors[i3 + 1] = color.g;
        particleColors[i3 + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Animation Loop
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Animate Solar Core
        coreMaterial.uniforms.time.value = elapsedTime;
        solarCore.rotation.y += 0.002;
        solarCore.rotation.x += 0.001;

        // Animate Gamma Rays
        rays.forEach((ray, index) => {
            const angle = (index / 12) * Math.PI * 2 + elapsedTime * 0.5;
            ray.position.set(Math.cos(angle) * 3, Math.sin(angle) * 3, 0);
            ray.lookAt(0, 0, 0);
            ray.rotateX(Math.PI / 2);
            ray.material.opacity = 0.4 + 0.3 * Math.sin(elapsedTime * 2 + index);
        });

        // Animate AI Core
        aiCore.rotation.x = elapsedTime * 0.15;
        aiCore.rotation.y = elapsedTime * 0.25;

        // Animate Particles
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;

        // Camera Movement
        camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.8 - camera.position.y) * 0.05;
        camera.position.z = 5 - window.scrollY * 0.002;

        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer };
}

// Scroll Reveal Animation
export function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));
}

// Initialize everything
export function initGammaRayEffects() {
    initGammaRayBackground();
    initScrollReveal();
}
