import { useState, useEffect } from "react";
import './App.css';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

function Header() {
  return (
    <header className="header">

    </header>
  )
}

function App() {
  const winsize = useWindowSize();
  return (
    <div className="App">
      <Header />
      <section style={{ paddingTop: "36px" }}>
        <article>
          <TextArea />
        </article>
      </section>
    </div>
  );
}

function TextArea() {
  const winsize = useWindowSize();
  return (
    <textarea
      style={{
        width: winsize.width - 6,
        height: winsize.height - 48,
      }}
      className="code-edit" />
  )
}

export default App;
