import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui'; 
import { degToRad, radToDeg } from 'three/src/math/MathUtils';
import { getPosition } from 'suncalc';


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

	let dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1, 0xF7EA0F);	
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

	let stopSimulation = true;

	const gui = new GUI();
	const config = {
		panelWidth: 1.5,
		panelHeight: 2,
		panelsInRow: 5,
		rows: 4,
		height: 0.5,
		slope: 33,
		distance: 4,
		azimuth: 45,
		elevation: 60,
		latitude: 31.8,		// Jerusalem
		longitude: 35.2,	// Jerusalem
		
		day: function() {	
			stopSimulation = false;

			let hours = []; 

			[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].forEach(h => {
				hours.push(h);
				hours.push(h + 0.15);
				hours.push(h + 0.30);
				hours.push(h + 0.45);
			});
						
			const handle = setInterval(() => {
				
				if(hours.length == 0 || stopSimulation) {
					clearInterval(handle);
					return;
				}
				
				const d = new Date();	
				const h = hours.shift();
				d.setHours(Math.floor(h));
				d.setMinutes(100 * (h % 1));
				d.setSeconds(0);
				console.log(d)

				
				const pos = getPosition(d, this.latitude, this.longitude);
				const v = new THREE.Vector3(10, 0, 0);				
				console.log(pos)
				
				if(pos.altitude < 0) {
					stopSimulation = true;
					return;
				}

				console.log(`alt: ${radToDeg(pos.altitude)}, az: ${radToDeg(pos.azimuth)}`)
				
				const phi = Math.PI/2 - pos.altitude;
				const theta =  -pos.azimuth;

				
				v.setFromSphericalCoords(20, phi, theta);					
				directionalLight.position.set(v.x, v.y, v.z);
				scene.remove(dLightHelper);
				dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1, 0xF7EA0F);	
				scene.add(dLightHelper);							
				
			}, 1000);						
		},
		stop: function() {
			stopSimulation = true;
		},
		selected: function() {						
			let v = new THREE.Vector3(10, 0, 0);
			const phi = -1 * degToRad(90 - this.elevation);						
			const theta = degToRad(180 + this.azimuth);
			
			v.setFromSphericalCoords(20, phi, theta);					
						
			directionalLight.position.set(v.x, v.y, v.z);
			scene.remove(dLightHelper);
			dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1, 0xF7EA0F);	
			scene.add(dLightHelper);			
		}
	};

	let rendered = false;

	gui.add(config, 'panelWidth', 1, 3, 0.1).name('Panel width (m)');
	gui.add( config, 'panelHeight', 1, 4.5, 0.1).name('Panel height (m)');
	gui.add( config, 'rows', 4, 10, 1 ).name('Rows');
	gui.add( config, 'panelsInRow', 4, 20, 1 ).name('Panels in row');
	gui.add( config, 'height', 0.1, 2 ).name('Height above ground level (m)');
	gui.add( config, 'slope', 10, 80, 1 ).name('Slope (degrees from N)');
	gui.add( config, 'distance', 2, 10, 0.1 ).name('Distance between rows (m)');	
	gui.add( config, 'azimuth', -80, 80, 1 ).name('Azimuth (deg)');
	gui.add( config, 'elevation', 5, 90, 1 ).name('Elevation (deg)');	
	gui.add( config, 'latitude', -90, 90, 1 ).name('Latitude (deg)');	
	gui.add( config, 'longitude', 0, 180, 1 ).name('Longitude (deg)');	
	// buttons		
	gui.add( config, 'selected' ).name('Render given az/el');
	gui.add( config, 'day' ).name('Simulate day');
	gui.add( config, 'stop' ).name('Stop simulation');

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