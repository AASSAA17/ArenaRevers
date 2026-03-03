
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { Toaster } from "sonner";

  const root = createRoot(document.getElementById("root")!);
  root.render(
    <>
      <App />
      <Toaster position="top-right" richColors />
    </>
  );
  