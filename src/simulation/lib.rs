use borger::prelude::*;

pub mod input;

//simulation delta time/tick rate, in seconds/tick (30hz)
pub const SIM_DT: f32 = 1.0 / 30.0;

pub fn init() -> SimulationInitOptions {
	SimulationInitOptions {
		sim_dt: SIM_DT,
		init_static_level_geom: None,
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
fn simulation_loop(_ctx: &mut GameContext<Immediate>) {}

//called on tick id 0
#[server]
pub fn on_server_start(_state: &mut State, _diff: &mut DiffSerializer<WaitForConsensus>) {}

//called after the client is added to State
#[server]
pub fn on_client_connect(
	_state: &mut State,
	_client_id: usize32,
	_tick_id: TickID,
	_diff: &mut DiffSerializer<WaitForConsensus>,
) {
}

//called before the client is removed from State
#[server]
pub fn on_client_disconnect(
	_state: &mut State,
	_client_id: usize32,
	_tick_id: TickID,
	_diff: &mut DiffSerializer<WaitForConsensus>,
) {
}
