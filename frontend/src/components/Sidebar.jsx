import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Plug, UserRound, LogOut, Workflow, Menu, X } from "lucide-react";
import useAuthStore from "../store/authStore.js";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/account", label: "Account", icon: UserRound },
];

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
        <Workflow className="w-4 h-4 text-white" />
      </div>
      <span className="font-bold text-gray-800 text-sm">AI Workflows</span>
    </div>
  );
}

function NavLinks({ onNavigate }) {
  const location = useLocation();
  return (
    <ul className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to;
        return (
          <li key={to}>
            <Link
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Sidebar() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 w-64 bg-white border-r border-gray-200 py-6 px-3 z-30">
      <div className="px-3 mb-8">
        <Brand />
      </div>

      <div className="flex-1">
        <NavLinks />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={clearAuth}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Log out
        </button>
      </div>
    </nav>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-14">
        <Brand />
        <button onClick={() => setIsOpen((o) => !o)} className="text-gray-500 p-1">
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-100 px-4 py-2 space-y-1">
          <NavLinks onNavigate={() => setIsOpen(false)} />
          <button
            onClick={clearAuth}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default Sidebar;