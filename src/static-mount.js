import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui'; 

(function() {
	'use strict;'

	const renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true;
	renderer.setClearColor(0xFF0000);
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	document.body.appendChild(renderer.domElement);
	
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0xEEEEEE);
	scene.receiveShadow = true;
	
	const camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	
	const orbit = new OrbitControls(camera, renderer.domElement);
	const textureLoader = new THREE.TextureLoader();
	
	const axesHelper = new THREE.AxesHelper( 25 );		
	axesHelper.setColors( 0xFF0000, 0x00FF00, 0x0000FF );	
	axesHelper.size = 10;
	scene.add(axesHelper);

	const gridHelper = new THREE.GridHelper( 50 );
	gridHelper.receiveShadow = true;	
	scene.add(gridHelper);

	camera.position.set(-10, 30, 30);
	orbit.update();
	
	const ambientLight = new THREE.AmbientLight(0x333333);	
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
	directionalLight.position.set(5, 15, 10);
	directionalLight.castShadow = true;
	directionalLight.shadow.camera.left = 20;
	directionalLight.shadow.camera.right = -20;
	directionalLight.shadow.camera.top = 20;
	directionalLight.shadow.camera.bottom = -20;	
	scene.add(directionalLight);

	const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);	
	scene.add(dLightHelper);

	//const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
	//scene.add(dLightShadowHelper);


	// FLOOR
	//Create a plane that receives shadows (but does not cast them)
	{		
		const floorGeometry = new THREE.PlaneGeometry( 40 , 40 );
		const floorMaterial = new THREE.MeshStandardMaterial( { color: 0xCACACA } )
		const floor = new THREE.Mesh( floorGeometry, floorMaterial );
		floor.rotateX(Math.PI / -2);
		//floor.position.x = 20/2;
		floor.receiveShadow = true;
		scene.add( floor );	
	}

	const gui = new GUI();
	const config = {
		panelWidth: 1.5,
		panelHeight: 2,
		panelsInRow: 5,
		rows: 4,
		height: 0.5,
		slope: 33,
		distance: 4
	};

	let rendered = false;

	gui.add(config, 'panelWidth', 1, 3, 0.1).name('Panel width (m)');
	gui.add( config, 'panelHeight', 1, 2.2, 0.1).name('Panel height (m)');
	gui.add( config, 'rows', 4, 10, 1 ).name('Rows');
	gui.add( config, 'panelsInRow', 4, 20, 1 ).name('Panels in row');
	gui.add( config, 'height', 0.5, 2 ).name('Height above ground level (m)');
	gui.add( config, 'slope', 10, 80, 1 ).name('Slope (degrees from N)');
	gui.add( config, 'distance', 2, 10, 0.1 ).name('Distance between rows (m)');

	gui.onChange(e => {
		rendered = false;
	});

	// PANELS
	function render() {
		const width = config.panelWidth * config.panelsInRow;
		const height = config.panelHeight;

		const groundMountGeometry = new THREE.PlaneGeometry(width, height, config.panelsInRow);
		const groundMountMaterial = new THREE.MeshStandardMaterial({ 
			//color: 0x999999,		
			//shadowSide: THREE.FrontSide,
			//flatShading: true,
			map: textureLoader.load('/panel.png'),			
			side: THREE.DoubleSide,
		 });
		let groundMount = new THREE.Mesh( groundMountGeometry, groundMountMaterial );
		groundMount.receiveShadow = true;
		groundMount.castShadow = true;
		groundMount.receiveShadow = true;
		groundMount.castShadow = true;
		groundMount.position.y = config.height + height/2;
		groundMount.rotateX(-config.slope * (Math.PI / 180));				
		scene.add(groundMount);					
	}



	const groundMountMaterial = new THREE.MeshStandardMaterial({ 
		//color: 0x999999,		
		//shadowSide: THREE.FrontSide,
		//flatShading: true,
		map: textureLoader.load('/panel.png'),			
		side: THREE.DoubleSide,
	});

	const groundMounts = [];
	renderer.setAnimationLoop((time) => {	
		
		
		if(!rendered) {			
			for(let groundMount of groundMounts) {
				scene.remove(groundMount);							
			}

			groundMounts.splice(0);
			
			const width = config.panelWidth * config.panelsInRow;
			const height = config.panelHeight;
			const groundMountGeometry = new THREE.PlaneGeometry(width, height, config.panelsInRow);
			
			let z = 0;
			for(let i = 0; i < config.rows; i++) {
				const groundMount = new THREE.Mesh( groundMountGeometry, groundMountMaterial );
				groundMount.receiveShadow = true;
				groundMount.castShadow = true;
				groundMount.receiveShadow = true;
				groundMount.castShadow = true;
				groundMount.position.y = config.height + height/2;
				groundMount.position.z = z;
				groundMount.rotateX(-config.slope * (Math.PI / 180));				
				scene.add(groundMount);					
				groundMounts.push(groundMount);

				z += config.distance;
			}
			
			rendered = true;
		}

		renderer.render(scene, camera);		
	});
	
})();