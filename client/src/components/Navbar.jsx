import { Link } from 'react-router-dom';

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <nav style={{ padding: 10, display: 'flex', justifyContent: 'space-between' }}>
      <Link to="/">Home</Link>
      <div>
        {user ? (
          <>
            <span>{user.username}</span>
            <Link to="/bookings" style={{ marginLeft: 10 }}>My Bookings</Link>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
