// import { useSelector, useDispatch } from "react-redux";
// import { clearAuth } from "../features/authSlice";
// import axios from "axios";
// import { toast } from "react-toastify";


// const Navbar = () => {
//   const dispatch = useDispatch();
//   const { isAuthenticated } = useSelector(state => state.auth);

//   const handleLogout = async () => {
//     try {
//       await axios.post("/api/auth/logout", {}, { withCredentials: true });
//       dispatch(clearAuth());
//       toast.success("Logged out");
//     } catch (err) {
//       toast.error("Logout failed");
//     }
//   };

//   return (
//     <nav>
//       {isAuthenticated ? (
//         <button onClick={handleLogout}>Logout</button>
//       ) : (
//         <a href="/login">Login</a>
//       )}
//     </nav>
//   );
// };

// export default Navbar;




// Example within a hypothetical Navbar.jsx
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling

// ... inside Navbar component
<NavLink
    to="/breach-check"
    className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`
    }
>
    Breach Check
</NavLink>
// ... other nav links (Vault, Logout, etc.)