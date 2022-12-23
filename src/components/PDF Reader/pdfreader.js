import React, { useState } from 'react';
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
                page: 1,
                totalpage: numPages
            },
            saved: true,
            type: "document/pdf",
        }

		props.setDocs({ selected: props.docsState.selected, docs: [...oldprops] });
	};

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

    return (
        <div className="PDFReader" style={{ width: props.winsize.width, height: props.winsize.height - 56 }}>
            <Document
				file={props.docsState.docs[props.docsState.selected].content.file} onLoadSuccess={onDocumentLoadSuccess}>
				<Page pageNumber={props.docsState.docs[props.docsState.selected].content.page}
                height={props.winsize.height - 81} />
			</Document>

            <nav id="PDFReader_PDFNav">
                <div id="PDFReader_PDFNav_Btns">
                    <button id="PDFReader_PDFNav_Btn" onClick={goToPrevPage}>←</button>
				    <button id="PDFReader_PDFNav_Btn" onClick={goToNextPage}>→</button>
                </div>
			</nav>
        </div>
    )
}