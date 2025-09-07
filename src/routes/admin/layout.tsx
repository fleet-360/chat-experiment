import { Link, NavLink, Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <div className="text-lg font-semibold">Admin Area</div>
        <nav className="flex gap-3 text-sm">
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "font-bold" : undefined}>
            Settings
          </NavLink>
          <NavLink to="/admin/chat" className={({ isActive }) => isActive ? "font-bold" : undefined}>
            Chat
          </NavLink>
        </nav>
        <div className="ml-auto text-xs">
          <Link to="/user" className="underline">Go to User</Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

