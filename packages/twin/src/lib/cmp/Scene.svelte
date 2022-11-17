<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { DirectionalLight } from 'three';
	import { Clock } from 'three';
	import { AmbientLight } from 'three';
	import { AxesHelper, Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
    import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
	import { CameraController } from '$lib/utils/CameraController';
	import type { IStatusMessage, IWebSocketData } from "@metalizzsas/nuster-typings/build/hydrated/";
	import { writable } from 'svelte/store';
	import { MeshBasicMaterial } from 'three';
	import { Mesh } from 'three';
	import type { Group } from 'three';
	import { PlaneGeometry } from 'three';
	import { Vector3 } from 'three';
	import { MeshStandardMaterial } from 'three';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
	import { DirectionalLightHelper } from 'three';

	const translucentMeshesNames = ["USC-BACK-1_1", "USC-SIDE-3", "USC-FRONT-1_1", "USC-SIDE-2"];

	let renderer = new WebGLRenderer({
		antialias: true,
		powerPreference: 'high-performance'
	});

	let websocket: WebSocket;

	let data = writable<IStatusMessage | undefined>(undefined);

	let scene = new Scene();
	let camera =  new PerspectiveCamera(60, window.innerHeight / window.innerWidth, 0.1, 2000);
	let composer = new EffectComposer(renderer);
	let controls: CameraController;
	let clock = new Clock();

	let gltfLoaded: Group | undefined;

	setContext("render", {
		getRenderer: () => renderer,
		getScene: () => scene,
		getCamera: () => camera,
	});

	onMount(() => {

		websocket = new WebSocket("ws://127.0.0.1:4080/ws/");

		websocket.onmessage = (ev: MessageEvent) => {
			const parsed = JSON.parse(ev.data) as IWebSocketData;

			if(parsed.type == "status")
			{
				$data = parsed.message as IStatusMessage;
			}
		};
		
		websocket.onopen = () => {
			data.subscribe(dataUpdatedSubscribe);
		}

		document.body.append(renderer.domElement);

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.pixelRatio = window.devicePixelRatio;
		renderer.shadowMap.enabled = true;
		composer.setPixelRatio(window.devicePixelRatio);
		composer.setSize(window.innerWidth, window.innerHeight);

		composer.addPass(new RenderPass(scene, camera));

		scene.add(camera);

		controls = new CameraController(camera);

		camera.position.set(100, 100, 100);
		camera.lookAt(new Vector3(0, 50, 0));		

		scene.background = new Color(0xF9F9F9);

		scene.add(new AxesHelper(150));

		const floor = new Mesh(new PlaneGeometry(30, 30), new MeshStandardMaterial({color: 0x888888, roughness: 1}));

		floor.receiveShadow = true;
		floor.castShadow = false;

		floor.rotateX(-Math.PI / 2);

		scene.add(floor);

		const ambLight = new AmbientLight(0xF6F6F6, 0.8);
		scene.add(ambLight);

		const directLight = new DirectionalLight(0xF6F6F6, 1);
		directLight.position.set(20, 25, 20)
		directLight.lookAt(0,0,0);
		directLight.castShadow = true;

		const directLight2 = new DirectionalLight(0xF6F6F6, 0.3);
		directLight2.position.set(-20, 25, -20);
		directLight2.lookAt(0, 0, 0);
		directLight2.castShadow = true;

		const lightHelper = new DirectionalLightHelper(directLight);
		const lightHelper2 = new DirectionalLightHelper(directLight2);

		scene.add(directLight);
		scene.add(lightHelper);
		scene.add(directLight2);
		scene.add(lightHelper2);

		animate();

        loadModel();

		renderer.domElement.addEventListener("click", () => {
			if(document.pointerLockElement == renderer.domElement)
				return;
			renderer.domElement.requestPointerLock();
		});

		document.addEventListener("pointerlockchange", (ev) => {
			if(document.pointerLockElement === renderer.domElement)
			{
				controls.updateMouseLock(true)
			}
			else
				controls.updateMouseLock(false);
		});
	});

	const dataUpdatedSubscribe = () => {
		if($data !== undefined && gltfLoaded !== undefined)
		{
			const pumpData = $data.io.find(p => p.name == "pump#enable");
			if(pumpData !== undefined)
			{
				gltfLoaded.children[0].children[3].children[0].traverse(o => {
					if(o instanceof Mesh)
					{
						(o.material as MeshStandardMaterial).transparent = false;
						(o.material as MeshStandardMaterial).color = new Color(pumpData.value == 1 ? 0x028A0F : 0xFF0000);
					}
				});
			}

			const ventilData = $data.io.find(p => p.name == "temperature#ventilation");
			if(ventilData !== undefined)
			{
				gltfLoaded.children[0].children[11].children.forEach(c => {
					if(!c.name.includes("70371"))
						return;
					c.traverse(o => {
						if(o instanceof Mesh)
						{
							(o.material as MeshStandardMaterial).color = new Color(ventilData.value == 1 ? 0x028A0F : 0xFF0000);
						}
					})
				})
			}

			const usData = $data.io.find(p => p.name == "us-power");
			if(usData !== undefined)
			{
				gltfLoaded.children[0].children[4].children.forEach(c => {
					if(!c.name.includes("US_t"))
						return;
					c.traverse(o => {
						if(o instanceof Mesh)
							(o.material as MeshStandardMaterial).color = new Color(usData.value == 1 ? 0x028A0F : 0xFF0000);
					});
				})
			}
		}
	}

	const animate = () => 
	{
		requestAnimationFrame(animate);
		const delta = clock.getDelta();
		controls.update(delta);
		composer.render(delta);
		renderer.render(scene, camera);
	}
	const resize = () => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		composer.setSize(window.innerWidth, window.innerHeight);
		camera.updateProjectionMatrix();
	}

    const loadModel = () => {
        const loader = new GLTFLoader();

        // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
        loader.setDRACOLoader( dracoLoader );

        // Load a glTF resource
        loader.load(
            // resource URL
            '3D/uscleaner.gltf',
            // called when the resource is loaded
            function ( gltf ) {

				gltfLoaded = gltf.scene;

				console.log(gltf.scene);

				gltfLoaded.scale.set(10, 10, 10);
				gltfLoaded.translateY(9.75);
				gltfLoaded.translateX(7);
				gltfLoaded.translateZ(5)

				gltfLoaded.traverse((o) => {

					if(o instanceof Mesh)
					{							
						o.receiveShadow = true;
						o.castShadow = true;
						o.material = new MeshStandardMaterial({ color: 0x666666, roughness: 1 });
					}
				});

				gltfLoaded.traverse(o => {
					if(translucentMeshesNames.includes(o.name))
					{
						console.log(o.name, "should be transparent");
						const newMat = new MeshBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.1});

						if(o instanceof Mesh)
						{
							o.material = newMat;
						}
						
						o.traverse(o2 => {
							console.log(" >", o2.name, "too")
							if(o2 instanceof Mesh)
							{
								o2.material = newMat;
								console.log(o2.material);
							}
						});
						return;
					}
				});

                scene.add( gltfLoaded );

				renderer.shadowMap.needsUpdate = true;

				console.log(gltfLoaded);

            },
            // called while loading is progressing
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {

                console.log( 'An error happened' );

            }
        );
    }

	

</script>

<svelte:window on:resize={resize} />