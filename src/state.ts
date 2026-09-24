import { codeGenerator } from "@borger/code_generator";
import { eventDispatcher } from "@borger/event_dispatcher";

//make sure field names are snake_case or else you will anger rustc
codeGenerator()
	.plugin(eventDispatcher)
	.flatulate({
		physics: { netVisibility: "untracked", type: "crate::physics::Physics" },
		balls: { netVisibility: "private", type: "SlotMap", content: "i32" },
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
					},
				},
			},
		},
	});
