import { useState, useEffect } from "react";
import './App.css';
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import NotifyWindow from './components/Notifications/notify'
import Settings from './components/Settings/settings'

const { ipcRenderer } = require('electron');
const fs = require('fs');
var path = require("path");

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
  async function CloseTab(index) {
    let oldprops = [...props.docs.docs];
    oldprops.splice(index, 1);

    if (index === props.docs.selected) {
      if (props.docs.docs.length === 1) {
        await oldprops.unshift({
          title: "Untitled",
          file: null,
          content: "",
          saved: true,
          type: "text/code",
        });
        await props.setDocs({ selected: 0, docs: oldprops })
      } else {
        if (props.docs.docs.length - 1 === props.docs.selected) {
          props.setDocs({ selected: props.docs.selected - 1, docs: oldprops })
        } else {
          props.setDocs({ selected: props.docs.selected, docs: oldprops })
        }
      }
    } else {
      if (index < props.docs.selected) {
        props.setDocs({ selected: props.docs.selected - 1, docs: oldprops })
      } else {
        props.setDocs({ selected: props.docs.selected, docs: oldprops })
      }
    }
  }

  function AddTab(hascontent, content) {
    if (hascontent) {
      let oldprops = [...props.docs.docs];
      oldprops.push({
        title: content.title,
        file: content.file,
        content: content.content,
        saved: true,
        type: content.type,
      });
      props.setDocs({ selected: props.docs.selected, docs: oldprops })
    } else {
      let oldprops = [...props.docs.docs];
      oldprops.push({
        title: "Untitled",
        file: null,
        content: "",
        saved: true,
        type: "text/code",
      });
      props.setDocs({ selected: props.docs.selected, docs: oldprops })
    }
  }

  window.AddTab = AddTab;

  return (
    <header className="header" style={{ width: props.winsize.width + "px" }}>
      {props.docs.docs.map((doc, i) =>
        <span>
          <div onClick={() => props.setDocs({ selected: i, docs: [...props.docs.docs] })} className="tab-cont" id={i === props.docs.selected ? "tab-selected" : null}>
            <span id="tab-title">{doc.title}{doc.saved ? null : <sup>*</sup>}</span>
          </div>
          <span id={i === props.docs.selected ? "tab-close-selected" : "tab-close"} onClick={() => CloseTab(i)}>X</span>
        </span>
      )}
      <div className="tab-add" onClick={() => AddTab(false)}>+</div>
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
      }
    ]
  });
  const winsize = useWindowSize();

  const [notifyNotTauri, setnotifyNotTauri] = useState(false);

  window.SettingsPage = function () {
    if (!docsState.docs.some(doc => doc.type === "settings")) {
      window.AddTab(true, { title: "Settings", file: null, content: null, saved: true, type: "settings" })
    }
  }

  useEffect(() => {
    if (!(navigator.userAgent === 'IncogineEditor-Electron')) {
      setnotifyNotTauri(true)
    }
  }, [])

  function SaveFile() {
    let oldprops = [...docsState.docs];

    if (docsState.docs[docsState.selected].type === "text/code") {
      if (docsState.docs[docsState.selected].file !== null) {
        savedFile(docsState.docs[docsState.selected].file);
      } else {
        ipcRenderer.invoke('saveFileAs', {
          fileName: docsState.docs[docsState.selected].title,
        })
          .then(res => {
            if (res) {
              savedFile(res)
            } else {
              console.error("File not saved: Cancelled by user")
            }
          })
          .catch(err => console.log(err))
      }
    }

    function savedFile(paths) {
      var newpath = paths?.toString()
      fs.writeFile(newpath, docsState.docs[docsState.selected].content, (err, data) => {
        if (err) {
          console.error(err)
        } else {
          console.log('Saved ' + docsState.docs[docsState.selected].title);
          oldprops[docsState.selected] = {
            title: path.basename(newpath),
            file: paths,
            content: docsState.docs[docsState.selected].content,
            saved: true,
            type: docsState.docs[docsState.selected].type,
          }

          setDocsState({ selected: docsState.selected, docs: [...oldprops] })
        }
      })
    }
  }
  window.SaveFile = SaveFile;

  function OpenFile() {
    ipcRenderer.invoke('openFile')
      .then(res => {
        if (res) {
          openedFile(res)
        } else {
          console.error("File not opened: Cancelled by user")
        }
      }).catch(err => console.log(err))

    function openedFile(paths) {
      console.log(paths[0])
      var stats = fs.statSync(paths[0])
      if (stats["size"] < 1000000) {
        fs.readFile(paths[0], "utf-8", function (err, data) {
          if (!err) {
            window.AddTab(true, { title: path.basename(paths[0]), file: paths[0], content: data, type: "text/code" })
          } else {
            console.error("File not opened: An error has occurred, " + err)
          }
        })
      } else {
        console.error("File not opened: Too large")
      }
    }
  }
  window.OpenFile = OpenFile;

  useEffect(() => {

    function saveKeyDown(e) {
      if ((navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode === 83) {
        e.preventDefault();
        window.SaveFile();
      }
    }

    async function handleDropFile(e) {
      e.preventDefault();
      e.stopPropagation();
      let files = e.dataTransfer.files;

      for (var i = 0; i < files.length; i++) {
        if (e.dataTransfer.items[i].kind === "file") {
          let reader = new FileReader();
          let file = files[i]
          if (file.size < 1000000) {
            reader.onload = async function (event) {
              await window.AddTab(true, { title: file.name, file: file.path, content: event.target.result, type: "text/code" })
            }
            await reader.readAsText(file, "UTF-8");
          } else {
            console.error("File Too Large to Load, Maximum: 1MB")
          }
        }
      }
    }

    listen('file-drop', event => {
      invoke('my_custom_command', { invokeMessage: event })
    })

    document.addEventListener("keydown", saveKeyDown);
    document.addEventListener("drop", handleDropFile);

    return function () {
      document.removeEventListener("keydown", saveKeyDown);
      document.removeEventListener("drop", handleDropFile);
    }
  }, [docsState.docs, docsState.selected])

  return (
    <div className="App">
      <Header winsize={winsize} docs={docsState} setDocs={setDocsState} />
      <section >
        <article style={{ paddingTop: "36px" }}>
          {docsState.docs[docsState.selected].type === "text/code" ? <TextArea docs={docsState} setDocs={setDocsState} /> : null}
          {docsState.docs[docsState.selected].type === "settings" ? <Settings winsize={winsize} /> : null}
        </article>
      </section>
      {notifyNotTauri ? <NotifyWindow header={"You are using a browser version of Incogine Editor"} body={"Please switch to the application for more features"} accept={() => setnotifyNotTauri(false)} /> : null}
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
