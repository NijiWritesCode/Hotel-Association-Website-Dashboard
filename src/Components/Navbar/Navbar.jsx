import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const sidebarRef = useRef(null);

  // Handle screen resizing
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(false); // Close sidebar when switching to desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen && isMobile) {
      window.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <nav className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <h1>Ado Odo Ota Hoteliers Admin</h1>
          </div>

          {/* Desktop Nav */}
          <ul className="navbar-menu desktop-menu">
            <li><Link to="/" className="navbar-link">Dashboard</Link></li>
            <li><Link to="/executive-management" className="navbar-link">Executives</Link></li>
            <li><Link to="/members-management" className="navbar-link">Members</Link></li>
            <li><Link to="/event-management" className="navbar-link">Events</Link></li>
            <li><Link to="/advertisement" className="navbar-link">Adverts</Link></li>
          </ul>

          {/* Hamburger Button */}
          {isMobile && (
            <button
              className="hamburger-button"
              onClick={toggleSidebar}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </nav>

      {/* Overlay */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" />
      )}

      {/* Mobile Sidebar */}
      <aside
        ref={sidebarRef}
        className={`mobile-sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        <div className="sidebar-header">
          <h2>Ado Odo Ota Hoteliers Admin</h2>
          <button
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link to="/" className="sidebar-link" onClick={closeSidebar}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/executive-management" className="sidebar-link" onClick={closeSidebar}>
              Executives
            </Link>
          </li>
          <li>
            <Link to="/members-management" className="sidebar-link" onClick={closeSidebar}>
              Members
            </Link>
          </li>
          <li>
            <Link to="/event-management" className="sidebar-link" onClick={closeSidebar}>
              Events
            </Link>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default Navbar;
