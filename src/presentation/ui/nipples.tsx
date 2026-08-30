import { useTouchscreenStore } from "@game/input.ts";
import type { Vector2 } from "three";

export function Nipples({ areolaSize }: { areolaSize: number }) {
	const move = useTouchscreenStore((s) => s.move);
	const look = useTouchscreenStore((s) => s.look);
	const dpr = useTouchscreenStore((s) => s.dpr);

	return (
		<div
			style={{
				pointerEvents: "none",
				position: "absolute",
				left: 0,
				top: 0,
				height: "100%",
				width: "100%",
			}}
		>
			{move.active && <Nipple start={move.start} dpr={dpr} areolaSize={areolaSize} />}
			{look.active && <Nipple start={look.start} dpr={dpr} areolaSize={areolaSize} />}
		</div>
	);
}

function Nipple({ start, dpr, areolaSize }: { start: Vector2; dpr: number; areolaSize: number }) {
	return (
		<div
			style={{
				position: "absolute",
				transform: "translate(-50%, -50%)",
				borderRadius: "50%",
				width: `${areolaSize}rem`,
				height: `${areolaSize}rem`,
				left: start.x / dpr,
				top: (window.innerHeight - start.y) / dpr,
				background: "radial-gradient(circle, rgba(128,128,128,0.6) 0%, rgba(128,128,128,0) 100%)",
			}}
		/>
	);
}
