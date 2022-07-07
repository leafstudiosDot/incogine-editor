import { useState, useEffect } from "react";
import './App.css';
import { invoke } from '@tauri-apps/api/tauri'

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
      {props.docs.docs.map((doc, i) =>
        <span>
          <div onClick={() => props.setDocs({ selected: i, docs: [...props.docs.docs] })} className="tab-cont" id={i === props.docs.selected ? "tab-selected" : null}>
            <span id="tab-title">{doc.title}</span><span>{doc.saved ? null : <sup>*</sup>}</span>
            <span id="tab-close">X</span>
          </div>
        </span>
      )}

      <div className="tab-add">+</div>
    </header>
  )
}

function App() {
  const [docsState, setDocsState] = useState({
    selected: 0,
    docs: [
      {
        title: "Untitled",
        file: null,
        content: "",
        saved: true,
        type: "text/code",
      },
      {
        title: "Untitled-2",
        file: null,
        content: "",
        saved: true,
        type: "text/code",
      },
    ]
  });
  const winsize = useWindowSize();

  let oldprops = [...docsState.docs];

  function saveKeyDown(e) {
    if ((navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode === 83) {
      e.preventDefault();

      function savedfile() {
        console.log('Saved ' + docsState.docs[docsState.selected].title);

        oldprops[docsState.selected] = {
          title: docsState.docs[docsState.selected].title,
          file: docsState.docs[docsState.selected].file,
          content: docsState.docs[docsState.selected].content,
          saved: true,
          type: docsState.docs[docsState.selected].type,
        }

        setDocsState({ selected: docsState.selected, docs: [...oldprops] })
      }

      if (docsState.docs[docsState.selected].file !== null) {
        savedfile()
      } else {
        savedfile()
      }
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", saveKeyDown);

    return function () {
      document.removeEventListener("keydown", saveKeyDown);
    }
  })

  return (
    <div className="App">
      <Header winsize={winsize} docs={docsState} setDocs={setDocsState} />
      <section >
        <article style={{ paddingTop: "36px" }}>
          {docsState.docs[docsState.selected].type === "text/code" ? <TextArea docs={docsState} setDocs={setDocsState} /> : null}
        </article>
      </section>
      <Footer docs={docsState} />
    </div>
  );
}

function TextArea(props) {
  const winsize = useWindowSize();
  const [text, setText] = useState("");
  const [textline, settextline] = useState(1);

  let oldprops = [...props.docs.docs];

  useEffect(() => {
    setText(props.docs.docs[props.docs.selected].content);
    settextline(props.docs.docs[props.docs.selected].content.split("\n").length);

    const textareasel = document.getElementById("code-edit")

    function keydownTextArea(e) {
      if (e.keyCode === 9) {
        e.preventDefault()

        textareasel.setRangeText(
          '  ',
          textareasel.selectionStart,
          textareasel.selectionStart,
          'end'
        )
      }
    }

    textareasel.addEventListener('keydown', keydownTextArea)


    return () => {
      textareasel.removeEventListener('keydown', keydownTextArea)
    }
  }, [props.docs])

  function handleTextChange(e) {
    setText(e.target.value);

    oldprops[props.docs.selected] = {
      title: props.docs.docs[props.docs.selected].title,
      file: props.docs.docs[props.docs.selected].file,
      content: e.target.value,
      saved: false,
      type: props.docs.docs[props.docs.selected].type,
    }

    props.setDocs({ selected: props.docs.selected, docs: [...oldprops] });
    settextline(e.target.value.split("\n").length);
  }

  function onScroll(e) {
    console.log(e.target.scrollTop)
    document.getElementById("linecount-edit-cont").scrollTop = e.target.scrollTop;
  }

  return (
    <div>
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

function Footer(props) {
  return (
    <footer className="footer">
      {props.docs.docs[props.docs.selected].type === "text/code" ? <span>(100, 100)</span> : null}
    </footer>
  )
}

export default App;
