import React, { useState } from 'react';
import './pdfreader.css'
import {Document, Page} from 'react-pdf/dist/entry.webpack';

export default function PDFReader(props) {
    const [numPages, setNumPages] = useState(null);
    const onDocumentLoadSuccess = ({ numPages }) => {
		setNumPages(numPages);
	};

    return (
        <div className="PDFReader" style={{ width: props.winsize.width, height: props.winsize.height - 56 }}>
            {/*<div ref={containerRef} width={props.winsize.width} height={"100%"} />*/}
            <Document
				file={props.docsState.docs[props.docsState.selected].content.file} onLoadSuccess={onDocumentLoadSuccess}>
				<Page pageNumber={props.docsState.docs[props.docsState.selected].content.page} />
			</Document>
        </div>
    )
}