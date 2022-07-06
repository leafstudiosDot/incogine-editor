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

function Header(props) {
  return (
    <header className="header" style={{ width: props.winsize.width + "px" }}>
      <div className="tab-cont" id="tab-selected">
        <span id="tab-title">
          Untitled
        </span>
        <span id="tab-close">
          X
        </span>
      </div>
      <div className="tab-cont">
        <span id="tab-title">
          Untitled-2
        </span>
        <span id="tab-close">
          X
        </span>
      </div>
    </header>
  )
}

function App() {
  const [docsState, setDocsState] = useState({});
  const winsize = useWindowSize();
  return (
    <div className="App">
      <Header winsize={winsize} />
      <section >
        <article>
          <TextArea />
        </article>
      </section>
      <Footer />
    </div>
  );
}

function TextArea() {
  const winsize = useWindowSize();
  const [text, setText] = useState("");
  const [textline, settextline] = useState(1);

  useEffect(() => {
    const textareasel = document.getElementById("code-edit")
    textareasel.addEventListener('keydown', (e) => {
      if (e.keyCode === 9) {
        e.preventDefault()

        textareasel.setRangeText(
          '  ',
          textareasel.selectionStart,
          textareasel.selectionStart,
          'end'
        )
      }
    })
  })

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
      <div id="linecount-edit-cont" style={{ height: winsize.height - 58 }}>
        {Array(textline).fill(1).map((_, i) =>
          <div id="linecount-edit-num">{i + 1}</div>
        )}
      </div>
      <textarea
        style={{
          width: winsize.width - 46,
          height: winsize.height - 60
        }}
        onChange={handleTextChange}
        value={text}
        onScroll={onScroll}
        spellcheck="false"
        id="code-edit" />
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      (100, 100)
    </footer>
  )
}

export default App;
