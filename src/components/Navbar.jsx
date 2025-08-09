import React, { useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

const Navbar = ({ navOpen }) => {
  const lastActiveLink = useRef();
  const activeBox = useRef();

  const navItems = useMemo(() => [
    { label: 'Home', link: '#home', className: 'nav-link active', ref: lastActiveLink },
    { label: 'About', link: '#about', className: 'nav-link' },
    { label: 'Work', link: '#work', className: 'nav-link' },
    // { label: 'Reviews', link: '#reviews', className: 'nav-link' },
    { label: 'Contact', link: '#contact', className: 'nav-link' }
  ], []);

  // Scroll listener to change active link based on section in view
  useEffect(() => {
    const initActiveBox = () => {
      if (lastActiveLink.current) {
        activeBox.current.style.top = lastActiveLink.current.offsetTop + 'px';
        activeBox.current.style.left = lastActiveLink.current.offsetLeft + 'px';
        activeBox.current.style.width = lastActiveLink.current.offsetWidth + 'px';
        activeBox.current.style.height = lastActiveLink.current.offsetHeight + 'px';
      }
    };

    const activeCurrentLink = (element) => {
      if (!element) return;
      lastActiveLink.current?.classList.remove('active');
      element.classList.add('active');
      lastActiveLink.current = element;
      initActiveBox();
    };

    const sections = navItems.map(item => document.querySelector(item.link));

    const onScroll = () => {
      let currentSectionIndex = 0;
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        if (section && section.offsetTop <= scrollPosition) {
          currentSectionIndex = index;
        }
      });

      const currentLink = document.querySelectorAll('.nav-link')[currentSectionIndex];
      activeCurrentLink(currentLink);
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', initActiveBox);
    initActiveBox();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', initActiveBox);
    };
  }, [navItems]);

  const handleLinkClick = (e) => {
    const element = e.target;
    if (!element) return;
    lastActiveLink.current?.classList.remove('active');
    element.classList.add('active');
    lastActiveLink.current = element;

    if (lastActiveLink.current) {
      activeBox.current.style.top = lastActiveLink.current.offsetTop + 'px';
      activeBox.current.style.left = lastActiveLink.current.offsetLeft + 'px';
      activeBox.current.style.width = lastActiveLink.current.offsetWidth + 'px';
      activeBox.current.style.height = lastActiveLink.current.offsetHeight + 'px';
    }
  };

  return (
    <nav className={`navbar ${navOpen ? 'active' : ''}`}>
      {navItems.map(({ label, link, className, ref }, key) => (
        <a
          href={link}
          key={key}
          ref={ref}
          className={className}
          onClick={handleLinkClick}
        >
          {label}
        </a>
      ))}
      <div className='active-box' ref={activeBox}></div>
    </nav>
  );
};

Navbar.propTypes = {
  navOpen: PropTypes.bool.isRequired,
};

export default Navbar;