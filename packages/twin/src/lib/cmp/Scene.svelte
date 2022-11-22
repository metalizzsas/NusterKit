<script lang="ts">
	import { CameraController } from '$lib/utils/CameraController';
	import type { ChartData } from '$lib/utils/ChartTypes';
	import { Model } from '$lib/utils/Model';
	import type { IStatusMessage, IWebSocketData } from "@metalizzsas/nuster-typings/build/hydrated/";
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { AmbientLight, AxesHelper, Clock, Color, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three';
	import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
	import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
	import Graph from './Graph.svelte';
	import Sidebar from './Sidebar.svelte';

	let renderer = new WebGLRenderer({
		antialias: true,
		powerPreference: 'high-performance'
	});

	let websocket: WebSocket;

	let data = writable<IStatusMessage | undefined>(undefined);

	let scene = new Scene();
	let camera =  new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
	let composer = new EffectComposer(renderer);
	let controls: CameraController;
	let clock = new Clock();

	let modelController: Model | undefined;

	let gltfLoaded = false;
	let selectedObject: Mesh | undefined = undefined;
	let meshData: any | undefined = undefined;
	let graphData: ChartData = {times: [], data: []};
	let tracked: string[] = [];

	const shadowMapSize = 2048;

	setContext("render", {
		getRenderer: () => renderer,
		getScene: () => scene,
		getCamera: () => camera,
	});

	onMount(() => {

		websocket = new WebSocket("ws://192.168.49.143/ws/");

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
						gltfLoaded = true;
						console.log(g);
						data.subscribe(modelController!.updateModel.bind(modelController));
						data.subscribe(appendGraphData)
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

		const appendGraphData = (data: IStatusMessage | undefined) => {
			if(data === undefined)
				return;
			
			graphData.times = [...graphData.times, `${new Date().getMinutes()}:${new Date().getSeconds()}`];
			
			for(const track of tracked)
			{
				const dataset = graphData.data.find(k => k.label == track);
				const dataToAdd = data.io.find(k => k.name == track)?.value ?? 0;

				if(dataset === undefined){
					graphData.data = [...graphData.data, {
						label: track,
						data: [dataToAdd]

					}];
					continue;
				}

				dataset.data = [...dataset.data, dataToAdd];
			}
		};

	});

	const animate = () => 
	{
		requestAnimationFrame(animate);
		const delta = clock.getDelta();
		controls.update(delta);

		if(modelController?.gltfGroup !== undefined)
			selectedObject = controls.updateRaycast(modelController.gltfGroup);
		
		composer.render(delta);
		renderer.render(scene, camera);
	}
	const resize = () => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		composer.setSize(window.innerWidth, window.innerHeight);
		camera.updateProjectionMatrix();
	}

	$: if(modelController !== undefined && $data !== undefined) { modelController.getReactive(selectedObject, $data).then(v => meshData = v)}

</script>

<svelte:window on:resize={resize} />

<div style="position: absolute; top: 1em; right: 1em; display: flex; flex-direction: column; gap: 1em;">
	<Sidebar style="align-self: end;">
		<div style="display:flex; flex-direction: column; gap: 3px;">
			<span style="align-self: center; font-weight: 600;">Légende</span>
			
			<div style="display: flex; flex-direction: row; gap: 0.5em; justify-items: center; align-items: center;;">
				<div style="height: 1em; aspect-ratio: 1 / 1; background-color: green; border-radius: 3px;" />
				<span>Sortie activée</span>
			</div>
			<div style="display: flex; flex-direction: row; gap: 0.5em; justify-items: center; align-items: center;;">
				<div style="height: 1em; aspect-ratio: 1 / 1; background-color: red; border-radius: 3px;" />
				<span>Sortie désactivée</span>
			</div>

			<div style="display: flex; flex-direction: row; gap: 0.5em; justify-items: center; align-items: center;;">
				<div style="height: 1em; aspect-ratio: 1 / 1; background-color: blue; border-radius: 3px;" />
				<span>Entrée activée</span>
			</div>
			<div style="display: flex; flex-direction: row; gap: 0.5em; justify-items: center; align-items: center;;">
				<div style="height: 1em; aspect-ratio: 1 / 1; background-color: purple; border-radius: 3px;" />
				<span>Entrée désactivée</span>
			</div>
		</div>
	</Sidebar>
	{#if selectedObject !== undefined}
		<Sidebar>
			<div style="display:flex; flex-direction: column; gap: 3px;">
				<span style="align-self: center; font-weight: 600;">Objet visé: {selectedObject.name}</span>
				{#if selectedObject.parent !== null}
					<span>Parent 1: {selectedObject.parent.name}</span>
					{#if selectedObject.parent.parent !== null}
						<span>Parent 2: {selectedObject.parent.parent.name}</span>
						{#if selectedObject.parent.parent.parent !== null}
							<span>Parent 3: {selectedObject.parent.parent.parent.name}</span>
							{#if selectedObject.parent.parent.parent.parent !== null}
								<span>Parent 4: {selectedObject.parent.parent.parent.parent.name}</span>
							{/if}
						{/if}
					{/if}
				{/if}
				{#if meshData !== undefined}
					<span style="align-self: center; font-weight: 600;">Data</span>
					<span>IO: {meshData.name}</span>
					<span>Value: {meshData.value}</span>d
					<span>Bus: {meshData.bus}</span>
					<button on:click={() => { 
						if(!tracked.includes(meshData.name))
							tracked.push(meshData.name)
						else
							tracked = tracked.filter(k => k != meshData.name);
						console.log(tracked);
					}}>Track</button>
				{/if}

			</div>
		</Sidebar>
	{/if}
</div>

<div style="position: absolute; bottom: 1em; left: 1em;">
	<Graph bind:chartData={graphData}/>
</div>


<!-- Crosshair -->
<div style="position: absolute; top: 50%; right: 50%; height: 3px; width: 16px; transform: translate3d(-1.5px, 8px, 0); background-color: black;"/>
<div style="position: absolute; top: 50%; right: 50%; height: 16px; width: 3px; transform: translate3d(-8px, 1.5px, 0); background-color: black;"/>