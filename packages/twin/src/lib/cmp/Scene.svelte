<script lang="ts">
	import { CameraController } from '$lib/utils/CameraController';
	import { Model } from '$lib/utils/Model';
	import type { IStatusMessage, IWebSocketData } from "@metalizzsas/nuster-typings/build/hydrated/";
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import type { Group } from 'three';
	import { AmbientLight, AxesHelper, Box3, Clock, Color, DirectionalLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three';
	import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
	import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

	const translucentMeshesNames = ["USC-SIDE-3", "USC-FRONT-1_1", "USC-SIDE-2"];

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

	let modelController: Model | undefined;

	let gltfLoaded: Group | undefined;

	const shadowMapSize = 2048;

	setContext("render", {
		getRenderer: () => renderer,
		getScene: () => scene,
		getCamera: () => camera,
	});

	onMount(() => {

		websocket = new WebSocket("ws://localhost:4080/ws/");

		websocket.onmessage = (ev: MessageEvent) => {
			const parsed = JSON.parse(ev.data) as IWebSocketData;

			if(parsed.type == "status")
			{
				$data = parsed.message as IStatusMessage;

				if(modelController === undefined)
				{
					modelController = new Model($data.machine.model as "metalfog" | "uscleaner");
					modelController.loadModel().then(g => {
						scene.add(g);
						data.subscribe(modelController!.updateModel.bind(modelController));
					})
				}
			}
		};

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

		const ambLight = new AmbientLight(0xF9F9F9, 0.45);
		scene.add(ambLight);

		const directLight = new DirectionalLight(0xFAF5EA, 1);
		directLight.position.set(20, 25, 20)
		directLight.lookAt(0,0,0);
		directLight.castShadow = true;
		directLight.shadow.mapSize.height = shadowMapSize;
		directLight.shadow.mapSize.width = shadowMapSize;

		const directLight2 = new DirectionalLight(0xFAF5EA, 0.3);
		directLight2.position.set(-20, 25, -20);
		directLight2.lookAt(0, 0, 0);
		directLight2.castShadow = true;
		directLight2.shadow.mapSize.height = shadowMapSize;
		directLight2.shadow.mapSize.width = shadowMapSize;

		scene.add(directLight);
		scene.add(directLight2);

		animate();

        //loadModel();

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

	const animate = () => 
	{
		requestAnimationFrame(animate);
		const delta = clock.getDelta();
		controls.update(delta);

		if(gltfLoaded)
			controls.updateRaycast(gltfLoaded.children[0] as Group);
		
		composer.render(delta);
		renderer.render(scene, camera);
	}
	const resize = () => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		composer.setSize(window.innerWidth, window.innerHeight);
		camera.updateProjectionMatrix();
	}

</script>

<svelte:window on:resize={resize} />