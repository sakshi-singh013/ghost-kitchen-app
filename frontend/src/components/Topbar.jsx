import { useNavigate } from 'react-router-dom';
import './Topbar.css';

const PAGE_TITLES = {
  overview:   'Overview',
  location:   'Find a Location',
  analytics:  'Analytics',
  search:     'Search',
  ai:         'AI Analyst',
  admin:      'Admin',
};

function Topbar({ activePage }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{PAGE_TITLES[activePage] || 'Dashboard'}</h1>
      </div>

      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-avatar">{initials}</div>
          <span className="topbar-name">{user.name || 'User'}</span>
        </div>

        <button className="topbar-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}

export default Topbar;
