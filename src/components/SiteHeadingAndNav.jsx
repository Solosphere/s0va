import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons'; 

export default function SiteHeadingAndNav() {

  return (
    <header class="nav-header">
      <nav>
        <NavLink to='/' id="logo">SOLUS CORE </NavLink> 
        <div className="right">
        <button className="dropdown-btn"><FontAwesomeIcon icon={faBars} size="lg" /></button>
          <ul className="main-menu">
            <li><NavLink to='/'>Home</NavLink></li>
            <li><NavLink to='/about'>About</NavLink></li>
            <li><NavLink to='/archive'>Archive</NavLink></li>
          </ul>
        </div>
      </nav>
    </header>
  );

}
