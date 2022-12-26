import React, { useEffect } from 'react';
import './pdfreader.css'
import {Document, Page} from 'react-pdf/dist/entry.webpack';

export default function PDFReader(props) {
    let oldprops = [...props.docsState.docs];
    const onDocumentLoadSuccess = ({ numPages }) => {
        oldprops[props.docsState.selected] = {
            title: props.docsState.docs[props.docsState.selected].title,
            file: props.docsState.docs[props.docsState.selected].file,
            content: {
                file: props.docsState.docs[props.docsState.selected].content.file,
                page: props.docsState.docs[props.docsState.selected].content.page ? props.docsState.docs[props.docsState.selected].content.page : 1,
                totalpage: numPages
            },
            saved: true,
            type: "document/pdf",
        }

		props.setDocs({ selected: props.docsState.selected, docs: [...oldprops] });
	};

    function keyPressPDF(e) {
        switch(e.key) {
            case "ArrowLeft":
                e.shiftKey ? goToFirstPage() : goToPrevPage();
                break;
            case "ArrowRight":
                e.shiftKey ? goToLastPage() : goToNextPage();
                break;
            default:
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", keyPressPDF, false);

        var PDFControlCont = document.getElementById("PDFReader_PDFNav");
        var vptimeout;

        function _HideControl() {
            ShowControls();
            clearTimeout(vptimeout);
            vptimeout = setTimeout(function () {
                HideControls();
            }, 900)
        }

        function ShowControls() {
            PDFControlCont.style.bottom = "25px";
        }
        function HideControls() {
            PDFControlCont.style.bottom = "-25px";
        }

        document.getElementById("PDFReaderID").addEventListener('mousemove', _HideControl)

        return () => {
            document.removeEventListener("keydown", keyPressPDF, false);
            document.getElementById("PDFReaderID").removeEventListener('mousemove', _HideControl)
        }
    })

    const goToFirstPage = () => {
        oldprops[props.docsState.selected] = {
            title: props.docsState.docs[props.docsState.selected].title,
            file: props.docsState.docs[props.docsState.selected].file,
            content: {
                file: props.docsState.docs[props.docsState.selected].content.file,
                page: 1,
                totalpage: props.docsState.docs[props.docsState.selected].content.totalpage
            },
            saved: true,
            type: "document/pdf",
        }

		props.setDocs({ selected: props.docsState.selected, docs: [...oldprops] });
    }

    const goToPrevPage = () => {
        oldprops[props.docsState.selected] = {
            title: props.docsState.docs[props.docsState.selected].title,
            file: props.docsState.docs[props.docsState.selected].file,
            content: {
                file: props.docsState.docs[props.docsState.selected].content.file,
                page: props.docsState.docs[props.docsState.selected].content.page - 1 <= 1 ? 1 : props.docsState.docs[props.docsState.selected].content.page - 1,
                totalpage: props.docsState.docs[props.docsState.selected].content.totalpage
            },
            saved: true,
            type: "document/pdf",
        }

		props.setDocs({ selected: props.docsState.selected, docs: [...oldprops] });
    }

	const goToNextPage = () => {
        oldprops[props.docsState.selected] = {
            title: props.docsState.docs[props.docsState.selected].title,
            file: props.docsState.docs[props.docsState.selected].file,
            content: {
                file: props.docsState.docs[props.docsState.selected].content.file,
                page: props.docsState.docs[props.docsState.selected].content.page + 1 >= props.docsState.docs[props.docsState.selected].content.totalpage ? props.docsState.docs[props.docsState.selected].content.totalpage : props.docsState.docs[props.docsState.selected].content.page + 1,
                totalpage: props.docsState.docs[props.docsState.selected].content.totalpage
            },
            saved: true,
            type: "document/pdf",
        }

		props.setDocs({ selected: props.docsState.selected, docs: [...oldprops] });
    }

    const goToLastPage = () => {
        oldprops[props.docsState.selected] = {
            title: props.docsState.docs[props.docsState.selected].title,
            file: props.docsState.docs[props.docsState.selected].file,
            content: {
                file: props.docsState.docs[props.docsState.selected].content.file,
                page: props.docsState.docs[props.docsState.selected].content.totalpage,
                totalpage: props.docsState.docs[props.docsState.selected].content.totalpage
            },
            saved: true,
            type: "document/pdf",
        }

		props.setDocs({ selected: props.docsState.selected, docs: [...oldprops] });
    }

    return (
        <div className="PDFReader" id="PDFReaderID" style={{ width: props.winsize.width, height: props.winsize.height - 56 }}>
            <Document
				file={props.docsState.docs[props.docsState.selected].content.file} onLoadSuccess={onDocumentLoadSuccess}>
				<Page pageNumber={props.docsState.docs[props.docsState.selected].content.page}
                height={props.winsize.height - 81} />
			</Document>

            <nav id="PDFReader_PDFNav">
                <div id="PDFReader_PDFNav_Btns">
                    {props.docsState.docs[props.docsState.selected].content.page !== 1 ? <button id="PDFReader_PDFNav_Btn" onClick={goToFirstPage}>F</button> : null}
                    {props.docsState.docs[props.docsState.selected].content.page - 1 < 1 ? null : <button id="PDFReader_PDFNav_Btn" onClick={goToPrevPage}>←</button>}
				    {props.docsState.docs[props.docsState.selected].content.page >= props.docsState.docs[props.docsState.selected].content.totalpage ? null : <button id="PDFReader_PDFNav_Btn" onClick={goToNextPage}>→</button>}
                    {props.docsState.docs[props.docsState.selected].content.page !== props.docsState.docs[props.docsState.selected].content.totalpage ? <button id="PDFReader_PDFNav_Btn" onClick={goToLastPage}>L</button> : null}
                </div>
			</nav>
        </div>
    )
}