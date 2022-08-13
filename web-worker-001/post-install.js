const fs = require("fs");
const path = require("path");

// copy onnxruntime-web WebAssembly files to {workspace}/public/ folder
const srcFolder = path.join(__dirname, 'node_modules', 'onnxruntime-web', 'dist');
const destFolder = path.join(__dirname, 'public', 'static', 'js');
if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder);
}

const fileList = ['ort-wasm.wasm', 'ort-wasm-simd.wasm', 'ort-wasm-threaded.wasm', 'ort-wasm-simd-threaded.wasm', 'ort.min.js'];
for (const file of fileList) {
    fs.copyFileSync(path.join(srcFolder, file), path.join(destFolder, file));
}

const publicFolder = path.join(__dirname, 'public');
for (const file of fileList) {
    fs.copyFileSync(path.join(srcFolder, file), path.join(publicFolder, file));
}