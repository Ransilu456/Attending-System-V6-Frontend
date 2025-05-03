import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [isAnimating, setIsAnimating] = useState(false);
  const transitionCloneElement = useRef(null);
  const animationTimeoutRef = useRef(null);
  const cleanupTimeoutRef = useRef(null);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
    console.log(`Theme changed to: ${theme}`);
  }, [theme]);

  useEffect(() => {
    return () => {
      clearTimeout(animationTimeoutRef.current);
      clearTimeout(cleanupTimeoutRef.current);

      const existingTransitionElement = document.getElementById('theme-transition-container');
      if (existingTransitionElement && document.body.contains(existingTransitionElement)) {
        document.body.removeChild(existingTransitionElement);
      }
    };
  }, []);

  const toggleTheme = (event) => {

    if (isAnimating) return;

    setIsAnimating(true);

    const nextTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`Starting theme transition: ${theme} → ${nextTheme}`);

    const clickX = event ? event.clientX : 20;
    const clickY = event ? event.clientY : 20;

    const existingTransitionElement = document.getElementById('theme-transition-container');
    if (existingTransitionElement && document.body.contains(existingTransitionElement)) {
      document.body.removeChild(existingTransitionElement);
    }

    const transitionContainer = document.createElement('div');
    transitionContainer.id = 'theme-transition-container';
    transitionContainer.style.position = 'fixed';
    transitionContainer.style.top = '0';
    transitionContainer.style.left = '0';
    transitionContainer.style.width = '100%';
    transitionContainer.style.height = '100%';
    transitionContainer.style.zIndex = '999';
    transitionContainer.style.pointerEvents = 'none';
    transitionContainer.style.backgroundColor = nextTheme === 'dark' ? '#0f172a' : '#ffffff';

    transitionContainer.style.clipPath = `circle(0px at ${clickX}px ${clickY}px)`;
    
    document.body.appendChild(transitionContainer);
    transitionCloneElement.current = transitionContainer;
 
    void transitionContainer.offsetWidth;

    transitionContainer.style.transition = 'clip-path 700ms cubic-bezier(0.19, 1, 0.22, 1)';

    const maxDimension = Math.max(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight
    );
    const radius = Math.sqrt(Math.pow(maxDimension, 2) * 2) + 100;

    transitionContainer.style.clipPath = `circle(${radius}px at ${clickX}px ${clickY}px)`;

    clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(() => {
      setTheme(nextTheme);
    }, 350);

    clearTimeout(cleanupTimeoutRef.current);
    cleanupTimeoutRef.current = setTimeout(() => {
      if (transitionContainer && document.body.contains(transitionContainer)) {
        transitionContainer.style.transition = 'opacity 200ms ease-out';
        transitionContainer.style.opacity = '0';

        setTimeout(() => {
          if (transitionContainer && document.body.contains(transitionContainer)) {
            document.body.removeChild(transitionContainer);
          }
          setIsAnimating(false);
          console.log('Theme transition complete');
        }, 200);
      } else {
        setIsAnimating(false);
      }
    }, 700);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAnimating }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 