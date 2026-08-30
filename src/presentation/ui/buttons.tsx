import { useTouchscreenStore, type TouchscreenStore } from "@game/input.ts";

type ButtonField = {
	[K in keyof TouchscreenStore]: K extends `${string}Button` ? K : never;
}[keyof TouchscreenStore];

export function Buttons({ size, padding }: { size: number; padding: number }) {
	return (
		<>
			<div
				style={{
					pointerEvents: "auto",
					position: "absolute",
					display: "flex",
					flexDirection: "column",
					gap: `${padding}rem`,
					bottom: `${padding}rem`,
					right: `${padding}rem`,
				}}
			>
				<Button text="▶️" size={size} stateField="startPhysicsTestButton" />
				<Button text="☝️" size={size} stateField="jumpButton" />
			</div>
			<div
				style={{
					pointerEvents: "auto",
					position: "absolute",
					bottom: `${padding}rem`,
					left: `${padding}rem`,
				}}
			>
				<Button text="👃" size={size} stateField="blowNoseButton" />
			</div>
		</>
	);
}

function Button({ text, size, stateField }: { text: string; size: number; stateField: ButtonField }) {
	const pressed = useTouchscreenStore((s) => s[stateField]);

	return (
		<button
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: "50%",
				border: "none",
				width: `${size}rem`,
				height: `${size}rem`,
				background: pressed
					? "radial-gradient(circle, rgba(255,140,0,0.5) 0%, rgba(255,140,0,0.1) 100%)"
					: "radial-gradient(circle, rgba(128,128,128,0.6) 0%, rgba(128,128,128,0) 100%)",
				transition: "background 0.15s ease",
			}}
			onTouchStart={() => useTouchscreenStore.setState({ [stateField]: true })}
			onTouchEnd={() => useTouchscreenStore.setState({ [stateField]: false })}
			onTouchCancel={() => useTouchscreenStore.setState({ [stateField]: false })}
		>
			<span style={{ fontSize: "3rem", color: "white" }}>{text}</span>
		</button>
	);
}
