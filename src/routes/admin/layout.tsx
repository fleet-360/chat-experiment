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
export async function loader({ request }: { request: Request }) {
  console.log("loader");
  localStorage.removeItem("userId");
  const ok = await requireAdminAuth();
  if (!ok) {
    return redirect("/admin/login");
  }
  console.log(request);
  const url = new URL(request.url);
  console.log(url.pathname);
  if (
    url.pathname.startsWith("/admin") &&
    !url.pathname.includes("/settings") &&
    !url.pathname.includes("/chat")
  ) {
    return redirect("/admin/chat");
  }

  return null;
}
