import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-gray-700 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="border-b border-gray-700 p-6">
        <h1 className="text-xl font-bold">Maintenance System</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink to="/materials" className={navLinkClass}>
              Materials
            </NavLink>
          </li>

          <li>
            <NavLink to="/machines" className={navLinkClass}>
              Machines
            </NavLink>
          </li>

          <li>
            <NavLink to="/transactions" className={navLinkClass}>
              Transactions
            </NavLink>
          </li>

          <li>
            <NavLink to="/employees" className={navLinkClass}>
              Employees
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="border-t border-gray-700 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-3 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
