import type { Field, State } from "@borger/code_generator/state_schema.ts";

//make sure field names are snake_case or else you will anger rustc
export default {
	physics: { netVisibility: "untracked", type: "crate::physics::Physics" },
	clients: {
		netVisibility: "public",
		presentation: "clone",
		type: "SlotMap",
		typeName: "Client",
		content: {
			input: {
				netVisibility: "owner",
				type: "struct",
				typeName: "Input",
				content: {
					//inputs should represent REQUESTS to perform ACTIONS,
					//not the specific buttons/combos that trigger them,
					//because different platforms require triggering the
					//same gameplay action with different controls. also
					//keep in mind client-sided stuff like "mute" or "open
					//inventory" generally don't belong here. only inputs
					//that affect the multiplayer simulation should be
					//listed here. input.rs must be updated accordingly

					//the camera's target spherical coordinate
					cam_yaw: { netVisibility: "owner", type: "f32" }, //horizontal,
					cam_pitch: { netVisibility: "owner", type: "f32" }, //vertical

					//omnidirectional movement - 2D analog stick
					//x = left/right, y = forward/back
					//all axes in range [-1, 1]
					omnidir: { netVisibility: "owner", type: "Vec2" },
					jumping: { netVisibility: "owner", type: "bool" },

					start_physics_test: { netVisibility: "owner", type: "bool" },
					blow_nose: { netVisibility: "owner", type: "bool" },
				},
			},

			character_id: { netVisibility: "owner", presentation: "clone", type: "usize32" },
		},
	},
	characters: {
		netVisibility: "public",
		presentation: "clone",
		type: "SlotMap",
		typeName: "Character",
		content: {
			prv_pos: { netVisibility: "public", type: "Vec3" }, //optimization potential: remove me
			pos: { netVisibility: "public", presentation: "interpolate", type: "Vec3" },
			rot: { netVisibility: "public", presentation: "interpolate", type: "Quat" },
			velocity: { netVisibility: "public", type: "Vec3" },
			grounded: { netVisibility: "public", type: "bool" },
		},
	},
	running_physics_test: { netVisibility: "public", type: "bool" },
	cubes: rigidBody("PhysicsCube"),
	spheres: rigidBody("PhysicsSphere"),
} satisfies State;

function rigidBody(typeName: string): Field {
	return {
		netVisibility: "public",
		presentation: "clone",
		type: "SlotMap",
		typeName,
		content: {
			pos: { netVisibility: "public", presentation: "interpolate", type: "Vec3" },
			rot: { netVisibility: "public", presentation: "interpolate", type: "Quat" },
			linvel: { netVisibility: "public", type: "Vec3" },
			angvel: { netVisibility: "public", type: "Vec3" },
			sleeping: { netVisibility: "public", type: "bool" },
			time_since_can_sleep: { netVisibility: "public", type: "f32" },
			rb_handle: {
				netVisibility: "untracked",
				type: "rapier3d::prelude::RigidBodyHandle",
			},
		},
	};
}
