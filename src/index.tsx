import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const appRoot = createRoot(document.getElementById("app")!);

appRoot.render(<App />);
