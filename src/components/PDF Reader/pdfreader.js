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

    var gestScale = 0;
    var scaleval = 1;
    var posXval = 0;
    var posYval = 0;
    var geststartX;
    var geststartY;
    var PDFDocumentCont = document.querySelector(".react-pdf__Document");
    var PDFPageCont;

    function keyPressMoveSizePDF(e) {
        switch(e.key) {
            case "r":
                gestScale = 0;
                geststartX = 0;
                geststartY = 0;
                scaleval = 1;
                posXval = 0;
                posYval = 0;
                rendScale();
                break;
            default:
        }
    }

    function rendScale() {
        console.log(scaleval)
        if (scaleval >= 5) {
            scaleval = 5;
        } else if (scaleval <= 1) {
            scaleval = 1;
        }

        if ((PDFDocumentCont.offsetWidth/4.5)*scaleval < posXval) {
            posXval = (PDFDocumentCont.offsetWidth/4.5)*scaleval;
        }

        if ((-1)*(PDFDocumentCont.offsetWidth/4.5)*scaleval > posXval) {
            posXval = (-1)*(PDFDocumentCont.offsetWidth/4.5)*scaleval;
        }

        /*console.log("PageWidth:" + PDFPageCont.width + ", PageHeight:" + PDFPageCont.height)
        console.log("ContWidth:" + PDFDocumentCont.offsetWidth + ", ContHeight:" + PDFDocumentCont.offsetHeight)
        console.log("PosX:" + posXval + ", PosY:" + posYval)*/

        window.requestAnimationFrame(() => {
            var scval = `translate3D(${posXval}px, ${posYval}px, 0px) rotate(0deg) scale(${scaleval})`
            PDFDocumentCont.style.transform = scval
        })
    }

    function setEventForLoadedPage(PDFControlCont, _HideControl) {
        document.getElementById("PDFReaderID").addEventListener('mousemove', _HideControl)

        PDFDocumentCont = document.querySelector(".react-pdf__Document");
        PDFPageCont = document.querySelector(".react-pdf__Page__canvas");

        document.getElementById("PDFReaderID").addEventListener('wheel', function (e) {
            e.preventDefault();

            if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? e.metaKey : e.ctrlKey) {
                if (e.deltaY > 0) {
                    scaleval -= 0.1;
                } else {
                    scaleval += 0.1;
                }
            } else {
                posXval -= e.deltaX * 1;
                posYval -= e.deltaY * 1;
            }

            rendScale();
        })

        document.getElementById("PDFReaderID").addEventListener('gesturestart', function (e) {
            e.preventDefault();

            gestScale = scaleval;

            geststartX = e.pageX - posXval;
            geststartY = e.pageY - posYval;
        })

        document.getElementById("PDFReaderID").addEventListener('gesturechange', function (e) {
            e.preventDefault();

            scaleval = gestScale * e.scale;

            posXval = e.pageX - geststartX;
            posYval = e.pageY - geststartY;

            rendScale();
        })

        document.getElementById("PDFReaderID").addEventListener('gestureend', function (e) {
            e.preventDefault();
        })

        document.addEventListener("keydown", keyPressMoveSizePDF, false);
    }

    function removeEventForLoadedPage() {
        document.removeEventListener("keydown", keyPressMoveSizePDF, false);
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

        setEventForLoadedPage(PDFControlCont, _HideControl);

        return () => {
            document.removeEventListener("keydown", keyPressPDF, false);
            document.getElementById("PDFReaderID").removeEventListener('mousemove', _HideControl)
            removeEventForLoadedPage();
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
				file={props.docsState.docs[props.docsState.selected].content.file} onLoadSuccess={onDocumentLoadSuccess} onRenderSuccess={setEventForLoadedPage}>
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