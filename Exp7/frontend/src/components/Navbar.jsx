import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className="navbar">
      <div className="left">
        <Link className="brand" to="/feed">Microblog</Link>
      </div>
      <div className="right">
        {user ? (
          <>
            <Link to="/feed">@{user.username}</Link>
            <Link to={`/u/${user.username}`}>Profile</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/settings">Settings</Link>
            <button className="button secondary" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
