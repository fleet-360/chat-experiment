import { Link, NavLink, Outlet } from "react-router";

export default function UserLayout() {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <div className="text-lg font-semibold">User Area</div>
        <nav className="flex gap-3 text-sm">
          <NavLink to="/user" end className={({ isActive }) => isActive ? "font-bold" : undefined}>
            Home
          </NavLink>
          <NavLink to="/user/chat" className={({ isActive }) => isActive ? "font-bold" : undefined}>
            Chat
          </NavLink>
          <NavLink to="/user/questions" className={({ isActive }) => isActive ? "font-bold" : undefined}>
            Questions
          </NavLink>
        </nav>
        <div className="ml-auto text-xs">
          <Link to="/admin/settings" className="underline">Go to Admin</Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

