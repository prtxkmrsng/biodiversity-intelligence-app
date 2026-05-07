# Biodiversity Intelligence Platform - Mobile App

## Overview
This repository contains a mobile-first biodiversity intelligence platform designed for fieldworkers to capture and analyze ecological data. Built as a React Native (Expo) application, it securely bridges the gap between raw camera inputs and high-performance, on-device machine learning.

## 🚀 High-Level ML Architecture

The application adopts a purely edge-based inference model. Data privacy and latency are optimized by avoiding backend round-trips for predictions.

The AI/ML Pipeline consists of two main pillars:
1. **Camera Feed & Tensor Extraction**: `expo-camera` captures a base64 JPEG, which is decoded into a raw byte buffer, then converted to an unbatched tensor.
2. **On-Device Inference Engine**: `react-native-fast-tflite` handles the execution of the `.tflite` model natively via JSI (JavaScript Interface) bypassing the React Native bridge for maximum performance.

---

## 🧠 ML Model & Pipeline Details

### **Model Used**
* **MobileNetV2** (Quantized / FP32)
* **Topology**: Lightweight CNN optimized for latency.
* **Input**: `[1, 224, 224, 3]`
* **Output**: Logits over classification labels.
* **Format**: `.tflite`. We chose MobileNet because of its exceptional size-to-accuracy ratio.

### **Preprocessing Steps & Buffer Routing**
We use `@tensorflow/tfjs-react-native` strictly for mathematical tensor preprocessing.
1. **Decode**: `decodeJpeg(rawByteData)`.
2. **Resize**: `tf.image.resizeBilinear(imgTensor, [224, 224])`.
3. **Normalize**: Map pixel values from `[0, 255]` to `[-1.0, 1.0]` using `resized.div(127.5).sub(1.0)`.
4. **Reshape/Batch**: Add the batch dimension `expandDims(0)` and cast strictly as `float32`.
5. **Buffer Routing**: `react-native-fast-tflite` requires raw memory buffers. We extract the typed array `inputArgs.dataSync() as Float32Array` and wrap it in a `Uint8Array` to pass to the native engine.

### **Inference Flow & Memory Management**
1. **Trigger**: Fieldworker clicks the capture button.
2. **Execution**: The memory buffer is fed to the loaded Native TFLite engine using JSI.
3. **Post-Processing**: Inference results (logits) are returned as a raw buffer, mapped back to an array of Exponentials (Softmax), and the top 5 predictions are filtered.
4. **Memory Management**: To prevent out-of-memory (OOM) crashes during continuous capture, we specifically clear all intermediate tensors using `tf.dispose([imgTensor, resized, normalized, batched, inputArgs])`.
5. **State Update**: The resulting `Observation` struct is pushed to React state, displaying the identification results.

---

## 💻 Instructions to Run Locally

### Prerequisites
* Node.js (v18+)
* npm, yarn, or pnpm
* EAS CLI (`npm install -g eas-cli`)

### Setup
1. Clone the repository.
2. **CRITICAL: File Placement** - Ensure the `mobilenet_v2.tflite` file is placed inside the `assets/` directory at the root of the project (i.e. `./assets/mobilenet_v2.tflite`).
3. Install dependencies:
```bash
npm install
```

### Running the Project
To run locally via Expo Go or a Development Build:
```bash
npm start
```

### Generating the APK
The application uses native code (`react-native-fast-tflite`), which requires a custom dev client or a standalone APK build. You cannot run full inference via standard Expo Go.

To build the runnable APK demo:
1. Configure EAS (if not already done):
```bash
eas build:configure
```
2. Run the Android Cloud Build:
```bash
eas build -p android --profile preview
```

---

## 🔄 CI/CD Pipeline Explanation

Our `.github/workflows/main.yml` encompasses:
1. **Lint Phase**: `eslint` checks the code for typing issues, unused variables, and formatting conformities.
2. **Build Readiness**: Validates dependency installations on a clean Ubuntu runner.

Using `eas-cli`, this CI pipeline can be extended to automatically trigger Android/iOS builds upon PR merges containing successful lint checks.

---

## 🛠️ Assumptions, Trade-offs & Limitations

### Trade-offs
- **JSI vs JS Execution:** Using `react-native-fast-tflite` (JSI C++ bridge) provides native performance and access to hardware delegates (NNAPI/CoreML), vastly outperforming purely JS-WASM implementations of TFJS.
- **Model Size vs Accuracy:** MobileNetV2 prioritizes speed and low-memory footprint, essential for standard fieldworker devices, trading slight accuracy improvements offered by heavier models (e.g. EfficientNet).

### Limitations
- The dataset labels are simulated via a subset locally. A true 300K+ identification network often requires deploying heavier sub-models or a backend service for edge-cases.
