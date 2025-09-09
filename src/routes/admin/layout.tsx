import { Outlet, redirect } from "react-router";
import { requireAdminAuth } from "../../services/adminAuth";

export default function AdminLayout() {
  return (
    <div className="p-4 ">
     
      <Outlet />
    </div>
  );
}

// Route loader to protect all /admin/* routes (except /admin/login which is separate)
export async function loader() {
  localStorage.removeItem("userId");
  const ok = await requireAdminAuth();
  if (!ok) {
    return redirect("/admin/login");
  }
  return null;
}
