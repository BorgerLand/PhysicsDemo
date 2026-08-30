import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { HUD } from "@game/ui/hud.tsx";

//warning this root component doesn't hot reload. changing it
//requires a full page refresh. try modifying hud instead
export function init() {
	return new Promise<HTMLCanvasElement>(function (resolve) {
		createRoot(document.getElementById("root")!).render(
			<StrictMode>
				<div
					style={{
						height: "100vh",
						width: "100vw",
						touchAction: "none",
						userSelect: "none",
						overflow: "hidden",
						overscrollBehavior: "none",
					}}
					onContextMenu={(e) => e.preventDefault()}
				>
					<GameCanvas />
					<HUD />
				</div>
			</StrictMode>,
		);

		function GameCanvas() {
			const canvasRef = useRef<HTMLCanvasElement>(null);

			useEffect(() => {
				resolve(canvasRef.current as HTMLCanvasElement);
			}, []);

			return (
				<div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
					<canvas ref={canvasRef} style={{ height: "100%", width: "100%" }} />
				</div>
			);
		}
	});
}
