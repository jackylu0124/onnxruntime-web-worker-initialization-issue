import * as ort from "onnxruntime-web";

// NOTE: THE FOLLOWING LINE DOESN'T WORK, HAD TO INITIALIZE INFERENCE SESSION WITH ARRAY BUFFER SENT OVER FROM THE MAIN THREAD (SEE MORE BELOW)
// const linear_blend_session_worker = ort.InferenceSession.create("./onnx_models/LinearBlend_v001.onnx", {executionProviders: ["wasm"]});

var linear_blend_session: ort.InferenceSession | undefined = undefined;

onmessage = async (e) => {
  // console.log("Inside onmessage() in \"inferenceWorker.js\"!");
  // console.log("linear_blend_session:", linear_blend_session);
  const isForInitialization = e.data[e.data.length-1]
  // console.log("isForInitialization:", isForInitialization);
  if (isForInitialization) {
    const onnx_file_buffer = e.data[0];
    try {
      if (linear_blend_session === undefined) {
        linear_blend_session = await ort.InferenceSession.create(onnx_file_buffer, {executionProviders: ["wasm"]});
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    const [inference_args, isForInitialization] = e.data;
    try {
      if (linear_blend_session !== undefined) {
        const linear_blend_result = (await linear_blend_session.run(inference_args)).blend;
        postMessage(linear_blend_result);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

// export {};