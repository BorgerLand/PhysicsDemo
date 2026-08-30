use crate::physstep::{GRAVITY, GROUP_CHARACTER, GROUP_PUSHABLE};
use borger::prelude::*;
use glam::{Quat, Vec3};
use rapier3d::control::{CharacterLength, KinematicCharacterController};
use rapier3d::parry::shape::Capsule;
use rapier3d::prelude::*;

const RADIUS: f32 = 0.35;
const HEIGHT: f32 = 2.9;
const CONTROLLER_OFFSET: f32 = 0.01;
const KINEMATIC_OFFSET: f32 = 0.3; //affects how hard characters have to push on pushables
const SPEED: f32 = 9.0; //units/sec
const TERMINAL_VELOCITY: f32 = 60.0; //units/sec
const JUMP_VELOCITY: f32 = 11.0; //units/sec

#[server]
pub fn on_client_connect(state: &mut State, client_id: usize32, diff: &mut DiffSerializer<WaitForConsensus>) {
	let client = state.clients.get_mut(client_id).unwrap().as_owned_mut().unwrap();
	let character = state.characters.add(diff);
	client.set_character_id(character.0, diff);

	let spawn_pos = to_center_pos(Vec3::ZERO);
	character.1.set_prv_pos(spawn_pos, diff).set_pos(spawn_pos, diff);
}

#[server]
pub fn on_client_disconnect(
	state: &mut State,
	client_id: usize32,
	diff: &mut DiffSerializer<WaitForConsensus>,
) {
	let client = state.clients.get_mut(client_id).unwrap().as_owned_mut().unwrap();
	let character = client.get_character_id();
	state.characters.remove(character, diff).unwrap();
}

//update kinematic: a rigid body attached to the character for the purpose
//of controllers colliding with one another + rigid bodies are pushed out
//of the way
pub fn update_pre_physstep(ctx: &mut GameContext<impl ImmediateOrWaitForServer>) {
	let phys = &mut ctx.state.physics;
	let kinematic_shape = SharedShape::new(Capsule::new_y(
		half_cyl() - KINEMATIC_OFFSET,
		RADIUS + KINEMATIC_OFFSET,
	));

	for character in ctx.state.characters.values() {
		//place a kinematic body at the previous position and
		//move it to the current position to shove objects in
		//between the 2 positions
		let rb = RigidBodyBuilder::kinematic_position_based().translation(character.get_prv_pos());
		let col = ColliderBuilder::new(kinematic_shape.clone()).collision_groups(InteractionGroups::new(
			GROUP_CHARACTER, //i am a character
			GROUP_PUSHABLE,  //i collide with pushables
			InteractionTestMode::default(),
		));

		let rb_handle = phys.rigid_bodies.insert(rb);
		phys.colliders
			.insert_with_parent(col, rb_handle, &mut phys.rigid_bodies);

		phys.rigid_bodies
			.get_mut(rb_handle)
			.unwrap()
			.set_next_kinematic_translation(character.get_pos());
	}
}

//update controller: actually moves the character given a desired translation
pub fn update_post_physstep(ctx: &mut GameContext<impl ImmediateOrWaitForServer>) {
	let diff = &mut ctx.diff;
	let controller_shape = Capsule::new_y(half_cyl(), RADIUS - CONTROLLER_OFFSET);
	let mut controller = KinematicCharacterController::default();
	controller.offset = CharacterLength::Absolute(CONTROLLER_OFFSET);

	//remember: the server "owns" all client objects.
	//a locally running client only owns their own client
	//object. the "input" field has owner visibility,
	//so effectively the server simulates all players
	//while each client only simulates their own. the
	//server then informs all players of where all the
	//other "remote" players are
	for client in ctx.state.clients.values() {
		if let Client::Owned(client) = client {
			let character = ctx.state.characters.get_mut(client.get_character_id()).unwrap();
			let input = &client.input.get().state;

			//rotation has no effect on physics but is used for camera+mesh rotation
			let cam_yaw_rot = Quat::from_axis_angle(Vec3::Y, input.cam_yaw);

			const UP: Vec3 = Vec3::Y;
			let forward = cam_yaw_rot * Vec3::NEG_Z;
			let right = forward.cross(UP);

			let mut velocity = if input.jumping && character.get_grounded() {
				Vec3::new(0.0, JUMP_VELOCITY, 0.0)
			} else {
				character.get_velocity()
			};

			let mut desired_translation = Vec3::ZERO;
			desired_translation += right * input.omnidir.x; //left/right
			desired_translation += forward * input.omnidir.y; //forward/backward
			desired_translation *= SPEED;
			desired_translation += velocity + 0.5 * GRAVITY * TickInfo::SIM_DT;
			desired_translation *= TickInfo::SIM_DT;

			let center_pos = character.get_pos();
			let phys = &ctx.state.physics;
			let result = controller.move_shape(
				TickInfo::SIM_DT,
				&phys.query(QueryFilter::default().groups(InteractionGroups::new(
					Group::ALL,                   //should always be all in a query
					Group::ALL ^ GROUP_CHARACTER, //i collide with anything except characters
					InteractionTestMode::default(),
				))),
				&controller_shape,
				&Pose3::from_parts(center_pos, Quat::IDENTITY),
				desired_translation,
				|_| {},
			);

			let hit_head = desired_translation.y > 0.0 && result.translation.y < desired_translation.y / 2.0;
			if result.grounded || hit_head {
				velocity = Vec3::ZERO
			} else {
				velocity += GRAVITY * TickInfo::SIM_DT;
				velocity = velocity.clamp_length_max(TERMINAL_VELOCITY);
			};

			character
				.set_velocity(velocity, diff)
				.set_prv_pos(center_pos, diff)
				.set_pos(center_pos + result.translation, diff)
				.set_grounded(result.grounded, diff)
				.set_rot(cam_yaw_rot, diff);
		}
	}
}

const fn half_cyl() -> f32 {
	HEIGHT / 2.0 - RADIUS
}

pub fn to_center_pos(mut foot_pos: Vec3) -> Vec3 {
	foot_pos.y += RADIUS + half_cyl();
	foot_pos
}
