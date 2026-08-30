import {
	BoxGeometry,
	InstancedMesh,
	Matrix4,
	MeshLambertMaterial,
	Quaternion,
	SphereGeometry,
	Vector3,
	type BufferGeometry,
	type Scene,
} from "three";
import type * as Borger from "@borger/ts";

const tmpTransform = new Matrix4();
const tmpPos = new Vector3();
const tmpQuat = new Quaternion();

const INITIAL_CAPACITY = 1024;
const GROWTH_RATE = 1.5;

function updatePhysicsObject(geometry: BufferGeometry, material: MeshLambertMaterial) {
	let instancedMesh: InstancedMesh | undefined;

	return function (objsSim: Borger.SlotMap<{ pos: Borger.Vec3; rot: Borger.Quat }>, scene: Scene) {
		const len = objsSim.len();
		if (!instancedMesh || len > instancedMesh.count) {
			instancedMesh?.dispose();
			instancedMesh?.removeFromParent();
			instancedMesh = new InstancedMesh(
				geometry,
				material,
				Math.ceil(
					Math.max(INITIAL_CAPACITY, len * GROWTH_RATE, (instancedMesh?.count ?? 0) * GROWTH_RATE),
				),
			);
			instancedMesh.frustumCulled = false;
			scene.add(instancedMesh);
		}

		let i = 0;
		for (const [, objSim] of objsSim()) {
			tmpPos.copy(objSim.pos);
			tmpQuat.copy(objSim.rot);
			tmpTransform.makeRotationFromQuaternion(tmpQuat).setPosition(tmpPos);
			instancedMesh!.setMatrixAt(i++, tmpTransform);
		}

		instancedMesh!.count = len;
		instancedMesh!.instanceMatrix.needsUpdate = true;
	};
}

export const updateCubes = updatePhysicsObject(
	new BoxGeometry(),
	new MeshLambertMaterial({ color: 0xffff00 }),
);

export const updateSpheres = updatePhysicsObject(new SphereGeometry(0.5), new MeshLambertMaterial());
