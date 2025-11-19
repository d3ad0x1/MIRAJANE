import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-700">
        <Outlet />
      </div>
    </div>
  );
}
