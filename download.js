// 1) Function to convert an object to JSON

/*
function objectToJson(_obj) {
    return JSON.stringify(_obj, null, 2);
}

// 2) Function to save JSON to a file
async function saveJsonToFile(jsonData) {
    try {
        const blob = new Blob([jsonData], { type: "application/json" });
        const handle = await window.showSaveFilePicker({
            suggestedName: "data.json",
            types: [{
                description: "JSON Files",
                accept: { "application/json": [".json"] }
            }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        alert("File saved successfully");
    } catch (error) {
        console.error("Error saving file:", error);
    }
}*/

// 3) Function to load JSON from a file
async function loadJsonFromFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "application/json";

        input.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) {
                reject("No file selected");
                return;
            }
            try {
                const text = await file.text();
                resolve(JSON.parse(text)); // Return parsed JSON
            } catch (error) {
                reject("Error reading file: " + error);
            }
        });

        input.click(); // Trigger the file picker
    });
}



//---------


async function d_downloadActionLog(_obj){
    let log = _obj
    let str = JSON.stringify(_obj, null, 2)
    const blob = new Blob([str], { type: "application/json" })

    return new Promise((resolve)=>{
        resolve(blob)
    })

}

function d_downloadSvgAsPng(_svgElement) {
    const svgElement = _svgElement;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const svgImage = new Image();

    return new Promise((resolve) => {
        svgImage.onload = function () {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = svgElement.clientWidth;
            tempCanvas.height = svgElement.clientHeight;
            const tempCtx = tempCanvas.getContext("2d");

            tempCtx.drawImage(svgImage, 0, 0);


            tempCanvas.toBlob(function (blob) {
                resolve(blob);
            }, "image/png");

            URL.revokeObjectURL(svgUrl);
        };
        svgImage.src = svgUrl;
    });
}

function d_downloadSvg(_svgElement) {
    const svgElement = _svgElement;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const svgImage = new Image();

    return new Promise((resolve) => { resolve(svgBlob) });

}

function d_downloadRasterAsPng(_rasterCanvas) {
	const rCanvas = _rasterCanvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = rCanvas.width;
    tempCanvas.height = rCanvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(rCanvas, 0, 0);

    ctx.fillStyle = "white"; // Background color
    ctx.fillRect(0, 0, rCanvas.width, rCanvas.height);
    ctx.drawImage(tempCanvas, 0, 0);

    return new Promise((resolve) => {
        rCanvas.toBlob(function (blob) {
            resolve(blob);
        }, "image/png");
    });
}

function d_downloadAllAsZip() {
    const zip = new JSZip();

    Promise.all([
        //downloadCanvasWithBackground(),
        //downloadCombinedCanvas()
        d_downloadSvgAsPng(canvas),
        d_downloadSvg(canvas),
        d_downloadRasterAsPng(rasterCanvas),
        d_downloadActionLog(actionLog)
    ])
    .then((blobs) => {
        // Add each blob as a file in the zip
        zip.file("canvas.png", blobs[0]);
        zip.file("canvas.svg", blobs[1]);
        zip.file("rasterCanvas.png", blobs[2]);
        zip.file("actionLog.json", blobs[3]);

        // Generate the zip file and trigger the download
        zip.generateAsync({ type: "blob" }).then(function (content) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = "canvas_files.zip";
            link.click();
            URL.revokeObjectURL(link.href);
        });
    });
}

async function d_overwrite(){
    actionLog = await loadJsonFromFile()
    replayActions()
}