const pdf = require('pdf-parse');
const fs = require('fs');

async function testPdf() {
    console.log("PDF-Parse type:", typeof pdf);
    try {
        const dataBuffer = Buffer.from("test");
        const data = await pdf(dataBuffer);
        console.log("PDF-Parse seems to work with standard call.");
    } catch (err) {
        console.error("Standard call failed:", err.message);
    }

    try {
        const { PDFParse } = require('pdf-parse');
        console.log("PDFParse class type:", typeof PDFParse);
    } catch (err) {
        console.error("PDFParse class export not found.");
    }
}

testPdf();
