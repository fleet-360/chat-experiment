import { Outlet } from "react-router";


export default function UserLayout() {

  return (
    <div className="p-4">

      <Outlet />
    </div>
  );
}
