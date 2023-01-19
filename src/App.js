import { useState, useEffect } from "react";
import './App.css';
import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import TitleBar from "./components/Title Bar/titlebar";
import NotifyWindow from './components/Notifications/notify'
import Settings from './components/Settings/settings'
import VideoPlayer from "./components/Video Player/videoplayer";
import PDFReader from './components/PDF Reader/pdfreader';
import MarkdownEditor from './components/Markdown/editor';

import './App.dark.css';

const { remote, ipcRenderer } = require('electron');
const { dialog } = require('@electron/remote')
const currentWindow = require('@electron/remote')
const fs = require('fs');
var path = require("path");

var titleMenuBarSpace = 25;

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

    async function CloseTabAftDialog(choice) {
      if (index === props.docs.selected) {
        if (props.docs.docs.length === 1) {
          await oldprops.unshift({
            title: "Untitled",
            file: null,
            content: "",
            saved: true,
            type: "text/code",
          });
          if (choice) {
            props.setDocs({ selected: 0, docs: oldprops })
          }
        } else {
          if (props.docs.docs.length - 1 === props.docs.selected) {
            if (choice) {
              props.setDocs({ selected: props.docs.selected - 1, docs: oldprops })
            }
          } else {
            if (choice) {
              props.setDocs({ selected: props.docs.selected, docs: oldprops })
            }
          }
        }
      } else {
        if (index < props.docs.selected) {
          if (choice) {
            props.setDocs({ selected: props.docs.selected - 1, docs: oldprops })
          }
        } else {
          if (choice) {
            props.setDocs({ selected: props.docs.selected, docs: oldprops })
          }
        }
      }
    }

    async function UnsavedEditedChanges(event, dataraw) {
      var data = JSON.parse(dataraw).props
      var index = JSON.parse(dataraw).index
      if (!data.docs.docs[index].saved) {
        var UnsavedDialog = dialog.showMessageBox(currentWindow.BrowserWindow.getFocusedWindow(), {
          type: 'question',
          buttons: ['Save', 'Discard', 'Cancel'],
          defaultId: 0,
          cancelId: 2,
          message: 'You have unsaved changes',
          detail: 'Do you want to save your changes?'
        })
          .then(async UnsavedDialog => {
            console.log(UnsavedDialog);
            if (UnsavedDialog.response === 0) {
              // Save and Close
              //await newWindow.webContents.executeJavaScript('window.SaveFile("close")')
              //CloseTabAftDialog(true)
            } else if (UnsavedDialog.response === 1) {
              CloseTabAftDialog(true)
            } else {
              CloseTabAftDialog(false)
            }
          })
      } else {
        CloseTabAftDialog(true)
      }
    }

    UnsavedEditedChanges(null, JSON.stringify({ "props": props, "index": index }))
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
      props.setDocs({ selected: oldprops.length - 1, docs: oldprops })
    } else {
      let oldprops = [...props.docs.docs];
      oldprops.push({
        title: "Untitled",
        file: null,
        content: "",
        saved: true,
        type: "text/code",
      });
      props.setDocs({ selected: oldprops.length - 1, docs: oldprops })
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

  window.SettingsPage = function (content) {
    if (!docsState.docs.some(doc => doc.type === "settings")) {
      if (content !== "" && content !== null && content !== undefined) {
        window.AddTab(true, { title: "Settings", file: null, content: content, saved: true, type: "settings" })
      } else {
        window.AddTab(true, { title: "Settings", file: null, content: "about", saved: true, type: "settings" })
      }
    } else {
      if (content !== "" && content !== null && content !== undefined) {
        let oldprops = [...docsState.docs];
        //oldprops.splice(docsState.docs.findIndex(doc => doc.type === "settings"), 1);
        oldprops[docsState.docs.findIndex(doc => doc.type === "settings")].content = content;
        setDocsState({ selected: docsState.docs.findIndex(doc => doc.type === "settings"), docs: oldprops })
      } else {
        setDocsState({ selected: docsState.docs.findIndex(doc => doc.type === "settings"), docs: [...docsState.docs] })
      }
    }
  }

  useEffect(() => {
    if (!(navigator.userAgent === 'IncogineEditor-Electron')) {
      setnotifyNotTauri(true)
    }
    ipcRenderer.send('get-fromstorage', { callbackname: 'theme', key: 'theme' })

    ipcRenderer.on('get-fromstorage-reply', (event, got) => {
      let realgot = String(got).split(";")
      console.log(realgot)
      if (realgot[0] === "theme") {
        document.documentElement.setAttribute("data-theme", realgot[1]);
      }
    })
  }, [])

  function SaveFile(after) {
    let oldprops = [...docsState.docs];

    async function saveFileAs(event, data) {
      var saveDialogRes = await dialog.showSaveDialog(currentWindow.BrowserWindow.getFocusedWindow(), { title: "Save File: " + JSON.parse(data).fileName, defaultPath: `${JSON.parse(data).fileName}`, properties: ['createDirectory', 'showHiddenFiles'] })
      if (!saveDialogRes.canceled) {
        return saveDialogRes.filePath
      } else {
        return false
      }
    }

    if (docsState.docs[docsState.selected].type === "text/code") {
      if (docsState.docs[docsState.selected].file !== null) {
        savedFile(docsState.docs[docsState.selected].file);
      } else {
        saveFileAs(null, JSON.stringify({
          "fileName": docsState.docs[docsState.selected].title
        }))
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

          if (after === "close") {
            window.CloseTab(docsState.selected);
          } else {
            setDocsState({ selected: docsState.selected, docs: [...oldprops] })
          }
        }
      })
    }
  }
  window.SaveFile = SaveFile;

  function OpenFile() {
    async function openFile(event, data) {
      var openDialogRes = await dialog.showOpenDialog(currentWindow.BrowserWindow.getFocusedWindow(), {
        title: "Open File", filters: [
          {
            "name": "all",
            "extensions": ["*"]
          },
          {
            "name": "Text File",
            "extensions": ["txt", "text", "md", "markdown"]
          },
          {
            "name": "Markdown File",
            "extensions": ["md", "markdown"]
          },
          {
            "name": "Website",
            "extensions": ["htm", "html", "css", "js", "php"]
          },
          {
            "name": "JavaScript",
            "extensions": ["js", "json", "tsx", "ts"]
          },
          {
            "name": "C++",
            "extensions": ["cpp", "cc", "C", "cxx", "h", "hpp", "hxx"],
          },
          {
            "name": "PDF File",
            "extensions": ["pdf"]
          }
        ], properties: ['openFile', 'showHiddenFiles', 'createDirectory']
      })

      if (!openDialogRes.canceled) {
        console.log(openDialogRes)
        return openDialogRes.filePaths
      } else {
        return false
      }
    }

    openFile()
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
        // 1 MB of File
        fs.readFile(paths[0], "utf-8", function (err, data) {
          if (!err) {
            window.AddTab(true, { title: path.basename(paths[0]), file: paths[0], content: data, type: "text/code" })
          } else {
            console.error("File not opened: An error has occurred, " + err)
          }
        })
      } else if (stats["size"] < ((1000000 * 1024) * 2)) {
        // 2 GB of File
        fs.readFile(paths[0], "base64", function (err, data) {
          if (!err) {
            switch(path.basename(paths[0]).split(".").pop()) {
              case "mp4":
              case "avi":
              case "mov":
                window.AddTab(true, { title: path.basename(paths[0]), file: paths[0], content: "data:video/mp4;base64," + data, type: "media/video" })
              break;
              case "pdf":
                window.AddTab(true, { title: path.basename(paths[0]), file: paths[0], content: {file: "data:application/pdf;base64," + data, page: 1, totalpage: 1}, type: "document/pdf" })
              break;
              default:
                console.error("File not opened: File unknown or can't read by Incogine Editor")
            }
          } else {
            console.error("File not opened: An error has occurred, " + err)
          }
        })
      } else {
        console.error("File not opened: Too large or file can't read by Incogine Editor")
      }
    }
  }
  window.OpenFile = OpenFile;

  useEffect(() => {

    window.changeInputTextAreaLocation(0, 0)

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
          } else if (file.size < ((1000000 * 1024) * 2)) {
            console.log(file)
            reader.onload = async function (event) {
              switch(file.name.split(".").pop()) {
                case "mp4":
                case "avi":
                case "mov":
                  await window.AddTab(true, { title: file.name, file: file.path, content: event.target.result, type: "media/video" })
                  break;
                case "pdf":
                  await window.AddTab(true, { title: file.name, file: file.path, content: {file: event.target.result, page: 1, totalpage: 1}, type: "document/pdf" })
                  break;
                default:
                console.error("File not opened: File unknown or can't read by Incogine Editor")
              }
            }
            await reader.readAsDataURL(file);
          } else {
            console.error("File Too Large to Load, Maximum: 1MB (text) / 1GB (media)")
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
      <TitleBar winsize={winsize} titleMenuBarSpace={titleMenuBarSpace} />
      <Header winsize={winsize} docs={docsState} setDocs={setDocsState} />
      <section >
        <article style={{ paddingTop: "36px", marginTop: titleMenuBarSpace }}>
          {docsState.docs[docsState.selected].type === "text/code" ? <TextArea docs={docsState} setDocs={setDocsState} /> : null}
          {docsState.docs[docsState.selected].type === "media/video" ? <VideoPlayer winsize={winsize} docsState={docsState} setDocs={setDocsState} /> : null}
          {docsState.docs[docsState.selected].type === "document/pdf" ? <PDFReader winsize={winsize} docsState={docsState} setDocs={setDocsState} /> : null}
          {docsState.docs[docsState.selected].type === "markdown/edit" ? <MarkdownEditor winsize={winsize} docsState={docsState} setDocs={setDocsState} /> : null}
          {docsState.docs[docsState.selected].type === "settings" ? <Settings winsize={winsize} docs={docsState} setDocs={setDocsState} /> : null}
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

  function selectAllfromArea() {
    document.getElementById("code-edit").focus();
    document.getElementById("code-edit").select();
  }
  window.SelectAllFromArea = selectAllfromArea;

  function getLineNumberAndColumn() {
    var textLines = document.getElementById("code-edit").value.substr(0, document.getElementById("code-edit").selectionStart).split("\n");
    var lineNumber = textLines.length;
    var columnIndex = textLines[textLines.length - 1].length;
    window.changeInputTextAreaLocation(lineNumber, columnIndex);
  }

  return (
    <div>
      <div id="linecount-edit-cont" style={{ height: winsize.height - 58 - titleMenuBarSpace }}>
        {Array(textline).fill(1).map((_, i) =>
          <div id="linecount-edit-num">{i + 1}</div>
        )}
      </div>
      <textarea
        style={{
          width: winsize.width - 46,
          height: winsize.height - 60 - titleMenuBarSpace
        }}
        onChange={handleTextChange}
        value={text}
        onScroll={onScroll}
        onKeyUp={getLineNumberAndColumn}
        onMouseUp={getLineNumberAndColumn}
        spellcheck="false"
        wrap="false"
        id="code-edit" />
    </div>
  )
}

function Footer(props) {
  const [inputLocationTextArea, setInputLocationTextArea] = useState("(0, 0)")
  function InputLocationTextArea(line, col) {
    if (line === null || line === undefined) {
      line = 0
    }
    if (col === null || col === undefined) {
      col = 0
    }
    setInputLocationTextArea("(" + line + ", " + col + ")")
    return "(" + line + ", " + col + ")"
  }

  window.changeInputTextAreaLocation = InputLocationTextArea

  return (
    <footer className="footer">
      {props.docs.docs[props.docs.selected].type === "text/code" ? <span style={{ position: "absolute", right: "5px" }}>{inputLocationTextArea}</span> : null}
      {props.docs.docs[props.docs.selected].type === "settings" ? <span style={{ position: "absolute", left: "5px" }}></span> : null}
      {props.docs.docs[props.docs.selected].type === "document/pdf" ? <span style={{ position: "absolute", left: "5px" }}>Page: {props.docs.docs[props.docs.selected].content.page}/{props.docs.docs[props.docs.selected].content.totalpage}</span> : null}
    </footer>
  )
}

export default App;
