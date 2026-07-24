import "./AdminTopbar.css";

import moreIcon   from "../../../assets/icons/more.png";
import searchIcon from "../../../assets/icons/search.png";
import bellIcon   from "../../../assets/icons/bell.png";
import avatarIcon from "../../../assets/icons/avatar.png";

export default function AdminTopbar({ onToggleSidebar }) {
  return (
    <header className="topbar">
      {/* Menu Toggle */}
      <button className="topbar__menu-btn" aria-label="Toggle menu" onClick={onToggleSidebar}>
        <img src={moreIcon} alt="menu" className="topbar__icon" />
      </button>

      {/* Search Bar */}
      <div className="topbar__search">
        <img src={searchIcon} alt="search" className="topbar__icon" />
        <input type="text" placeholder="Search..." />
      </div>

      {/* Actions */}
      <div className="topbar__actions">
        
        {/* Notifications */}
        <button className="topbar__icon-btn topbar__notification" aria-label="Notifications">
          <img src={bellIcon} alt="notifications" className="topbar__icon" />
          <span className="topbar__badge">3</span>
        </button>

        {/* User Avatar */}
        <div className="topbar__avatar">
          <img src={avatarIcon} alt="User avatar" />
        </div>
      </div>
    </header>
  );
}
