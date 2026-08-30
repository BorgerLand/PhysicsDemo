import type * as Borger from "@borger/ts";
import { Group, type Camera, type Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const charactersPres = new Map<number, Group>();

const loader = new GLTFLoader();
const gruPromise = loader.loadAsync("/gru.glb").then(function (result) {
	const gru = result.scene;
	gru.position.y -= 1.5;
	gru.rotation.y = Math.PI;
	gru.scale.setScalar(0.18);
	return gru;
});

//values copied from rust
//const colliderRadius = 0.35;
const colliderHeight = 2.9;
const eyeHeight = 2.55;
/*const debugGeom = new CapsuleGeometry(colliderRadius, colliderHeight - 2 * colliderRadius);
const debugMat = new MeshBasicMaterial();
debugMat.wireframe = true;
const debugMesh = new Mesh(debugGeom, debugMat);*/

export function update(ctx: Borger.GameContext, scene: Scene, camera: Camera) {
	const localCharacterID = (ctx.output.clients().get(ctx.local_client_id)!.value as Borger.ClientOwned)
		.character_id;

	const charactersSim = ctx.output.characters({
		added(id) {
			const characterPres = new Group();
			gruPromise.then((gru) => characterPres.add(gru.clone()));
			charactersPres.set(id, characterPres);
			scene.add(characterPres);
		},

		removed(id) {
			const characterPres = charactersPres.get(id)!;
			characterPres.removeFromParent();
			charactersPres.delete(id);
		},
	});

	for (const [id, characterSim] of charactersSim) {
		const mesh = charactersPres.get(id)!;
		if (localCharacterID === id) {
			mesh.visible = false;
			camera.position.copy(characterSim.pos).y += eyeHeight - colliderHeight / 2.0;

			//players' toleration for latency between moving the mouse and seeing camera
			//movement is so extremely low that not even the Immediate multiplayer tradeoff
			//is fast enough due to the rtt of the presentation thread sending the camera
			//input, receiving a response, and interpolating towards it. so, cheat here by
			//by directly writing the latest input state to camera rotation. there is no risk
			//of mispredicting because inputs are client authoritative
			camera.rotation.set(ctx.input.get_cam_pitch(), ctx.input.get_cam_yaw(), 0, "ZYX");
		} else {
			mesh.visible = true;
			mesh.position.copy(characterSim.pos);
			mesh.quaternion.copy(characterSim.rot);
		}
	}
}
