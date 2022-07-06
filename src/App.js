import { useState, useEffect } from "react";
import './App.css';

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

function App() {
  const winsize = useWindowSize();
  return (
    <div className="App">
      <header>

      </header>
      <section>
        <article>
          <textarea 
          style={{
            width: winsize.width-21,
            height: winsize.height-12,
          }}
          className="code-edit" />
        </article>
      </section>
    </div>
  );
}

export default App;
