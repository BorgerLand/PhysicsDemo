use borger::prelude::*;
use std::f32::consts::{PI, TAU};

//a single client has multiple input states per simulation
//tick due to vsync outpacing the simulation tick rate.
//this function merges them down into one
pub fn merge(_combined: &Input, _new: &Input) -> Input {
	Input {}
}

//given a suspicious, untrustworthy input state,
//return a new sanitized version
pub fn validate(_sus: &Input) -> Input {
	//be sure to pass all floating point (decimal) numbers
	//through valid_fXX(). otherwise you have a security
	//problem where an evil client can blow up the game.
	//any math equation that receives an infinity/nan
	//value will return even more infinity/nan values, and
	//the whole game state is taken down like a jessie j
	//domino

	//this should only validate that the one isolated
	//input state it receives makes sense. checking for
	//eg. debounce or other timings between multiple
	//input state objects is out of scope

	Input {}
}

//the server needs to continue simulating even if it hasn't
//received inputs from all clients yet due to latency. this
//function lets you choose how the engine fabricates an input,
//given the previous tick's input. do not try to access
//state.client.input; it will be wrong; use prv instead.
//is_timed_out indicates that the client took too long
//to send an input for this tick, so the server is forcing
//consensus without it. push-and-hold buttons (eg. left click,
//controller triggers) are also usually safe to predict they are
//still in the same position. discrete taps (eg. reload, talk to
//npc) are normally safe to predict false or else you risk
//triggering some action twice
#[server]
pub fn server_predict_late(_prv: &Input, _state: &State, _client_id: usize32, _is_timed_out: bool) -> Input {
	Input {}
}

//the client needs to continue simulating even if the
//presentation thread stuttered and missed a tick. the same
//rules apply here as server_predict_late
pub fn client_predict_late(_prv: &Input, _state: &State, _client_id: usize32) -> Input {
	Input {}
}

///Wrap angle in range [-PI, PI)
pub fn wrap_angle(angle: f32) -> f32 {
	let mut diff = ((angle + PI) % TAU) - PI;
	if diff < -PI {
		diff += TAU;
	}

	diff
}

pub fn valid_f32(sus: f32) -> f32 {
	if sus.is_finite() { sus } else { 0.0 }
}

pub fn valid_f64(sus: f64) -> f64 {
	if sus.is_finite() { sus } else { 0.0 }
}
