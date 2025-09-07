
import "./App.css";
import { Outlet } from "react-router";

function App() {
  return (
    <>
      {/* <div className="p-4 text-xl font-semibold">chat-experiment</div> */}
      <Outlet />
    </>
  );
}

export default App;
