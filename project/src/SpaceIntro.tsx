import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SpaceIntroProps {
	onComplete: () => void;
}

const PHASES = [
	'STAGE 1: LAUNCHING SPACECRAFT...',
	'STAGE 2: HYPERSPACE DRIVE ENGAGED!',
	'STAGE 3: ENTERING YEAR 2096...',
];

export const SpaceIntro = ({ onComplete }: SpaceIntroProps) => {
	const mountRef = useRef<HTMLDivElement>(null);
	const completedRef = useRef(false);
	const [phaseText, setPhaseText] = useState('LAUNCHING SPACECRAFT...');

	useEffect(() => {
		const mount = mountRef.current;
		if (!mount) return;
		completedRef.current = false;
		setPhaseText('LAUNCHING SPACECRAFT...');

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x020208, 0.015);

		const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.set(0, 2, 12);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		mount.appendChild(renderer.domElement);

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
		directionalLight.position.set(10, 20, 15);
		scene.add(directionalLight);
		const engineLight = new THREE.PointLight(0x00d2ff, 5, 20);
		scene.add(engineLight);

		const earthGroup = new THREE.Group();
		earthGroup.position.set(0, -6, -20);
		scene.add(earthGroup);

		const earthGeometry = new THREE.SphereGeometry(10, 64, 64);
		const earthMaterial = new THREE.MeshPhongMaterial({
			color: 0x1a4b8c,
			emissive: 0x031024,
			specular: 0x222222,
			shininess: 25,
		});
		const earth = new THREE.Mesh(earthGeometry, earthMaterial);
		earthGroup.add(earth);

		const atmosphereGeometry = new THREE.SphereGeometry(10.4, 64, 64);
		const atmosphereMaterial = new THREE.MeshBasicMaterial({
			color: 0x00aaff,
			transparent: true,
			opacity: 0.25,
			side: THREE.BackSide,
		});
		earthGroup.add(new THREE.Mesh(atmosphereGeometry, atmosphereMaterial));

		const shuttle = new THREE.Group();
		const bodyGeometry = new THREE.ConeGeometry(0.8, 4, 16);
		bodyGeometry.rotateX(Math.PI / 2);
		const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 });
		shuttle.add(new THREE.Mesh(bodyGeometry, bodyMaterial));

		const noseGeometry = new THREE.ConeGeometry(0.81, 1.5, 16);
		noseGeometry.rotateX(Math.PI / 2);
		const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
		const nose = new THREE.Mesh(noseGeometry, noseMaterial);
		nose.position.z = -1.2;
		shuttle.add(nose);

		const wingShape = new THREE.Shape();
		wingShape.moveTo(0, 0);
		wingShape.lineTo(2.5, -1.5);
		wingShape.lineTo(2.5, -2.5);
		wingShape.lineTo(0, -1.8);
		wingShape.closePath();
		const wingGeometry = new THREE.ExtrudeGeometry(wingShape, {
			depth: 0.1,
			bevelEnabled: true,
			bevelSegments: 2,
			steps: 1,
			bevelSize: 0.02,
			bevelThickness: 0.02,
		});
		const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5, roughness: 0.4 });
		const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
		rightWing.rotation.x = Math.PI / 2;
		rightWing.position.set(0, 0, 1.5);
		shuttle.add(rightWing);
		const leftWing = rightWing.clone();
		leftWing.scale.x = -1;
		shuttle.add(leftWing);

		const tailGeometry = new THREE.BoxGeometry(0.1, 1.2, 1.2);
		const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xcc3333 });
		const tail = new THREE.Mesh(tailGeometry, tailMaterial);
		tail.position.set(0, 0.9, 1.2);
		shuttle.add(tail);

		const thrusterGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 16);
		thrusterGeometry.rotateX(Math.PI / 2);
		const thrusterMaterial = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
		const thruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
		thruster.position.set(0, 0, 2.1);
		shuttle.add(thruster);
		shuttle.position.set(0, -1, 5);
		shuttle.scale.set(0.8, 0.8, 0.8);
		scene.add(shuttle);

		const starCount = 3000;
		const starsGeometry = new THREE.BufferGeometry();
		const starPositions = new Float32Array(starCount * 3);
		const starSpeeds = new Float32Array(starCount);
		for (let index = 0; index < starCount; index += 1) {
			starPositions[index * 3] = (Math.random() - 0.5) * 120;
			starPositions[index * 3 + 1] = (Math.random() - 0.5) * 120;
			starPositions[index * 3 + 2] = (Math.random() - 0.5) * 300 - 100;
			starSpeeds[index] = Math.random() * 0.8 + 0.2;
		}
		starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
		const starsMaterial = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.35,
			transparent: true,
			opacity: 0.9,
		});
		scene.add(new THREE.Points(starsGeometry, starsMaterial));

		const startTime = performance.now();
		const duration = 12000;
		let animationFrameId = 0;
		let activePhase = -1;

		const animate = (now: number) => {
			if (completedRef.current) return;
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			earth.rotation.y += 0.002;
			engineLight.position.set(shuttle.position.x, shuttle.position.y, shuttle.position.z + 2.5);

			const positions = starsGeometry.attributes.position.array as Float32Array;
			const phase = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;
			if (phase !== activePhase) {
				activePhase = phase;
				setPhaseText(PHASES[phase]);
			}

			if (phase === 0) {
				const phaseProgress = progress / 0.33;
				shuttle.position.y = -1 + phaseProgress * 2;
				shuttle.rotation.x = -0.2 + Math.sin(elapsed * 0.008) * 0.05;
				shuttle.rotation.z = Math.sin(elapsed * 0.005) * 0.05;
				earthGroup.position.y = -6 - phaseProgress * 8;
				earthGroup.position.z = -20 - phaseProgress * 30;
				for (let index = 0; index < starCount; index += 1) {
					positions[index * 3 + 2] += starSpeeds[index] * 0.5;
					if (positions[index * 3 + 2] > 20) positions[index * 3 + 2] = -250;
				}
			} else if (phase === 1) {
				const phaseProgress = (progress - 0.33) / 0.33;
				shuttle.rotation.x = 0.05 * Math.sin(elapsed * 0.02);
				shuttle.rotation.z = 0.08 * Math.cos(elapsed * 0.015);
				shuttle.position.x = Math.sin(elapsed * 0.003) * 0.5;
				for (let index = 0; index < starCount; index += 1) {
					positions[index * 3 + 2] += starSpeeds[index] * (3 + phaseProgress * 6);
					if (positions[index * 3 + 2] > 20) positions[index * 3 + 2] = -250;
				}
				starsMaterial.size = 0.35 + phaseProgress * 0.6;
				engineLight.intensity = 5 + phaseProgress * 10;
			} else {
				const phaseProgress = (progress - 0.66) / 0.34;
				shuttle.position.z = 5 - phaseProgress * 25;
				camera.fov = 60 + phaseProgress * 40;
				camera.updateProjectionMatrix();
				for (let index = 0; index < starCount; index += 1) {
					positions[index * 3 + 2] += starSpeeds[index] * 12;
					if (positions[index * 3 + 2] > 20) positions[index * 3 + 2] = -250;
				}
			}

			starsGeometry.attributes.position.needsUpdate = true;
			renderer.render(scene, camera);

			if (progress < 1) {
				animationFrameId = requestAnimationFrame(animate);
			} else if (!completedRef.current) {
				completedRef.current = true;
				onComplete();
			}
		};

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', handleResize);
		animationFrameId = requestAnimationFrame(animate);

		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationFrameId);
			scene.traverse((object) => {
				if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
					object.geometry.dispose();
					const materials = Array.isArray(object.material) ? object.material : [object.material];
					materials.forEach((material) => material.dispose());
				}
			});
			renderer.dispose();
			if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
		};
	}, [onComplete]);

	const handleSkip = () => {
		if (completedRef.current) return;
		completedRef.current = true;
		onComplete();
	};

	return (
		<div className="space-intro" style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#020208', color: '#fff' }}>
			<div ref={mountRef} style={{ width: '100%', height: '100%' }} />
			<div style={{ position: 'absolute', top: 30, left: 40, fontFamily: 'monospace', letterSpacing: '2px', fontSize: '14px', color: '#00f0ff', textShadow: '0 0 10px rgba(0,240,255,0.6)' }}>
				<div>[ STATUS ]: {phaseText}</div>
				<div style={{ color: '#888', marginTop: '4px' }}>MISSION: TRAVEL TO 2096</div>
			</div>
			<button
				onClick={handleSkip}
				style={{ position: 'absolute', top: 30, right: 40, padding: '10px 24px', backgroundColor: 'rgba(0, 0, 0, 0.7)', border: '1px solid #00f0ff', color: '#00f0ff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '2px', boxShadow: '0 0 15px rgba(0,240,255,0.3)', transition: 'all 0.3s ease' }}
			>
				SKIP INTRO
			</button>
			<div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
				<div style={{ fontSize: '12px', letterSpacing: '3px', color: '#aaa', marginBottom: '8px' }}>
					WARP DRIVE ENGAGED
				</div>
			</div>
		</div>
	);
};
