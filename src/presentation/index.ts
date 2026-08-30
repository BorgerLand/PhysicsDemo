import * as Borger from "@borger/ts";
import * as UI from "@game/ui/index.tsx";

await Borger.play(async function game() {
	const canvas = await UI.init();

	window.onresize = onresize;
	onresize();
	function onresize() {
		canvas.width = innerWidth;
		canvas.height = innerHeight;
	}

	//purely client sided rendering pipeline. it should
	//be able to able to render the game in any state,
	//regardless of what the simulation is doing. remember
	//that rollbacks/mispredicts/reconnects can wipe out
	//data that was already rendered in a previous frame
	return function presentationLoop(_dt, _ctx) {};
});
