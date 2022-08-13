import React, { useRef, useEffect } from 'react';
import { Env, Tensor } from "onnxruntime-web";
import * as ort from "onnxruntime-web";
import logo from './logo.svg';
import './App.css';


function WebWorkerInference() {
  const inferenceWorkerRef = useRef<any>(null);
                                                             
  useEffect(() => {
    if (window.Worker) {
      inferenceWorkerRef.current = new Worker(new URL("./workers/inferenceWorker.ts", import.meta.url));
      console.log("Inference worker spawned!");
    }
    
    const read_onnx_file_into_buffer = async (filename: string) => {
      return (await fetch(filename)).arrayBuffer();
    };
    read_onnx_file_into_buffer("./onnx_models/LinearBlend_v001.onnx")
    .then((onnx_file_buffer) => {
      if (window.Worker) {
        const inferenceWorker = inferenceWorkerRef.current;
        inferenceWorker.postMessage([onnx_file_buffer, true], [onnx_file_buffer]);
        // console.log("onnx_file_buffer.byteLength:", onnx_file_buffer.byteLength); // onnx_file_buffer.byteLength is 0 here because it has already been transferred to the worker thread
      }
    })
    .catch((err) => {
      console.error(err);
    });
    

    return () => {
      // Cleanup function
      if (window.Worker) {
        const inferenceWorker = inferenceWorkerRef.current;
        inferenceWorker.terminate();
      }
    };
  }, []);

  const onButtonClick = () => {
    console.log("Button is clicked!");
    const inferenceWorker = inferenceWorkerRef.current;

    const img1 = new Tensor("float32", new Float32Array(1 * 3 * 256 * 176).fill(0.2), [1, 3, 256, 176]);
    const img2 = new Tensor("float32", new Float32Array(1 * 3 * 256 * 176).fill(0.7), [1, 3, 256, 176]);
    const alpha = new Tensor("float32", new Float32Array(1 * 256 * 176).fill(0.5), [1, 256, 176]);
    inferenceWorker.postMessage([{"img1": img1, "img2": img2, "alpha": alpha}, false]);
    console.log("Message posted to worker");

    inferenceWorker.onmessage = (e: any) => {
      console.log("Message received from worker!");
      const linear_blend_result_tensor = e.data;
      console.log(`Inference result is: ${linear_blend_result_tensor.data}`);
    };

    inferenceWorker.onerror = (e: any) => {
      console.log("Error Message:", e.message);
      console.log("Error Filename:", e.filename);
      console.log("Error Line Number:", e.lineno);
    };
  };

  return (
    <button onClick={onButtonClick}>Run inference!</button>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <WebWorkerInference/>
      </header>
    </div>
  );
}

export default App;
