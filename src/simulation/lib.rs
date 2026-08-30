use borger::prelude::*;
use glam::Quat;
use rapier3d::prelude::*;

pub mod character;
pub mod input;
pub mod physics_demo;
pub mod physstep;

pub fn init() -> SimulationInitOptions {
	SimulationInitOptions {
		init_static_level_geom: Some(|state: &mut State| {
			state.physics.init_static_level_geom(
				ColliderBuilder::cuboid(100.0, 25.0, 100.0)
					.position(Pose3::from_parts(
						Vec3::new(0.0, -25.0, 0.0),
						Quat::from_axis_angle(Vec3::X, 10.0_f32.to_radians()),
					))
					.build(),
			);
		}),
		simulation_loop,
		input_merge: input::merge,
		input_validate: input::validate,
		input_server_predict_late: input::server_predict_late,
		input_client_predict_late: input::client_predict_late,
		on_server_start,
		on_client_connect,
		on_client_disconnect,
	}
}

//the deterministic-ish simulation update tick pipeline.
//this is going to run on both the server and the client.
//in a perfect world, server+client's State should
//be identical by the end of any given tick id. in
//practice this is not possible due to latency, but the
//closer you get them, the better your game feels
fn simulation_loop(ctx: &mut GameContext<Immediate>) {
	character::update_pre_physstep(ctx);
	physics_demo::update_pre_physstep(ctx);

	physstep::update(ctx);

	//use the results of physstep
	character::update_post_physstep(ctx);
	physics_demo::update_post_physstep(ctx);
}

//called on tick id 0
#[server]
pub fn on_server_start(state: &mut State, diff: &mut DiffSerializer<WaitForConsensus>) {
	physics_demo::on_server_start(state, diff);
}

//called after the client is added to State
#[server]
pub fn on_client_connect(
	state: &mut State,
	client_id: usize32,
	_tick_id: TickID,
	diff: &mut DiffSerializer<WaitForConsensus>,
) {
	character::on_client_connect(state, client_id, diff);
}

//called before the client is removed from State
#[server]
pub fn on_client_disconnect(
	state: &mut State,
	client_id: usize32,
	_tick_id: TickID,
	diff: &mut DiffSerializer<WaitForConsensus>,
) {
	character::on_client_disconnect(state, client_id, diff);
}
