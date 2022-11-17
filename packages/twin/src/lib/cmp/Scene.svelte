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

	let renderer = new WebGLRenderer({
		powerPreference: 'high-performance'
	});

	let scene = new Scene();
	let camera =  new PerspectiveCamera(90, window.innerHeight / window.innerWidth, 0.1, 2000);
	let composer = new EffectComposer(renderer);
	let controls: CameraController;
	let clock = new Clock();

	setContext("render", {
		getRenderer: () => renderer,
		getScene: () => scene,
		getCamera: () => camera,
	});

	onMount(() => {

		document.body.append(renderer.domElement);

		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.pixelRatio = window.devicePixelRatio;
		composer.setPixelRatio(window.devicePixelRatio);
		composer.setSize(window.innerWidth, window.innerHeight);

		scene.add(camera);

		controls = new CameraController(camera);

		camera.position.set(5, 5, 5);		

		scene.background = new Color(0xF9F9F9);

		scene.add(new AxesHelper(150));

		scene.add(new AmbientLight(0xF9F9F9, 0.5));
		scene.add(new DirectionalLight(0xF9F9F9, 0.2));

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

	const animate = () => 
	{
		requestAnimationFrame(animate);
		const delta = clock.getDelta();
		controls.update(delta);
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

                scene.add( gltf.scene );

                //gltf.animations; // Array<THREE.AnimationClip>
                //gltf.scene; // THREE.Group
                //gltf.scenes; // Array<THREE.Group>
                //gltf.cameras; // Array<THREE.Camera>
                //gltf.asset; // Object

                console.log(gltf.scene);

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