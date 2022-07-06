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
      <section >
        <article>
          <TextArea />
        </article>
      </section>
    </div>
  );
}

function TextArea() {
  const winsize = useWindowSize();
  const [text, setText] = useState("");
  const [textline, settextline] = useState(1);

  function handleTextChange(e) {
    setText(e.target.value);
    settextline(e.target.value.split("\n").length);
  }

  function onScroll(e) {
    console.log(e.target.scrollTop)
    document.getElementById("linecount-edit-cont").scrollTop = e.target.scrollTop;
  }

  return (
    <div style={{ paddingTop: "36px" }}>
      <div id="linecount-edit-cont" style={{ height: winsize.height - 45 }}>
        {Array(textline).fill(1).map((_, i) => 
          <div id="linecount-edit-num">{i + 1}</div>
        )}
      </div>
      <textarea
        style={{
          width: winsize.width - 46,
          height: winsize.height - 48
        }}
        onChange={handleTextChange}
        value={text}
        onScroll={onScroll}
        id="code-edit" />
    </div>
  )
}

export default App;
