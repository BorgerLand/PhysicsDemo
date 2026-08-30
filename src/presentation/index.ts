import * as Borger from "@borger/ts";
import * as UI from "@game/ui/index.tsx";
import * as Input from "@game/input.ts";
import { WebGPURenderer } from "three/webgpu";
import * as Character from "@game/character.ts";
import { AmbientLight, Color, DirectionalLight, PerspectiveCamera, Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as PhysicsDemo from "@game/physics_demo.ts";

await Borger.play(async function game(compat) {
	const canvas = await UI.init();
	const inputHandler = Input.init(canvas, compat.touchscreen.supported);

	const renderer = new WebGPURenderer({
		canvas,
		powerPreference: "high-performance",
		antialias: true,
	});

	await renderer.init();
	renderer.setClearColor(new Color(0));
	const scene = new Scene();
	const camera = new PerspectiveCamera(67);

	window.onresize = onresize;
	onresize();
	function onresize() {
		renderer.setSize(innerWidth, innerHeight);
		camera.aspect = innerWidth / innerHeight;
		camera.updateProjectionMatrix();
	}

	const directionalLight = new DirectionalLight(0xffffff, 3);
	directionalLight.position.set(1, 1, 1);
	scene.add(directionalLight);
	scene.add(new AmbientLight(0xfff5e0, 1));

	new GLTFLoader().loadAsync("/nose.glb").then(function (gltf) {
		const nose = gltf.scene;
		nose.position.y = 20;
		nose.scale.setScalar(7);
		scene.add(nose);
	});

	//purely client sided rendering pipeline. it should
	//be able to able to render the game in any state,
	//regardless of what the simulation is doing. remember
	//that rollbacks/mispredicts/reconnects can wipe out
	//data that was already rendered in a previous frame
	return function presentationLoop(_dt, ctx) {
		//populate input state from poll
		Input.update(inputHandler, ctx.input);

		Character.update(ctx, scene, camera);
		PhysicsDemo.updateCubes(ctx.output.cubes, scene);
		PhysicsDemo.updateSpheres(ctx.output.spheres, scene);

		//this line of code might have something to do with rendering
		renderer.render(scene, camera);
	};
});
