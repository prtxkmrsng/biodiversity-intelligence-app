# Darukaa.Earth Biodiversity Intelligence Platform

This repository contains the mobile-first biodiversity intelligence platform developed for the Applied AI Engineer Intern Hackathon.

## Architecture

This application is built with a Mobile-First architecture using React. The core ML inference happens entirely **on-device** using TensorFlow.js (TFLite Backend) or React Native Fast TFLite (if ported to Expo).

## Machine Learning Pipeline

### 1. Model Used
- **MobileNetV2**: A lightweight, highly efficient convolutional neural network optimized for mobile vision applications.
- Format: `.tflite`
- Fast initialization and inference time on consumer mobile devices.

### 2. Preprocessing Steps
When an image is captured from the device camera, the following pipeline executes:
1. **Resolution Scaling**: The image tensor is resized to `224x224` using bilinear interpolation to match the expected MobileNetV2 input dimensions.
2. **Normalization**: The pixel values are normalized from `[0, 255]` to `[-1.0, 1.0]` by dividing by `127.5` and subtracting `1.0`. Note: If the model is quantized, it would simply use uint8 inputs without mean/std normalization.
3. **Batch Expansion**: A batch dimension is added resulting in a tensor shape of `[1, 224, 224, 3]`.
4. **Type Casting**: The tensor is cast to `float32` (unless quantized).

### 3. Inference Flow
- The application initializes the TFLite model into WebAssembly (or Native binding) memory upon startup.
- Field workers use the camera interface to snap an image.
- The preprocessing function creates the input tensor.
- Synchronous inference is executed on the device hardware.
- The output predictions are softmax-clamped and sliced to return the **Top 5** confident predictions.
- Structured data (timestamp, location stub, image, predictions) is committed to the application state context.

## Instructions to Run Locally (Web/Vite version)

1. Clone the repository.
2. Ensure you have `node` and `npm` installed.
3. Run `npm install` to install dependencies.
4. Place `mobilenet_v2.tflite` and `labels.txt` directly into the `/public` directory.
5. Run `npm run dev` to start the development server.
6. Open your browser to the local URL (usually `http://localhost:3000`).

## CI/CD Pipeline Explanation (GitHub Actions)

For continuous integration and delivery, a basic conceptual CI/CD workflow should:
1. Trigger on pushes to `main` or Pull Requests.
2. Set up Node.js.
3. Install dependencies (`npm ci`).
4. Run standard linting (`npm run lint` / ESLint).
5. Build the application (`npm run build` or `eas build` for Expo).
6. (Optional) Deploy web build to hosting or deploy APK via Expo EAS.

## Assumptions, Trade-offs & Limitations

- **Browser Context**: This demo leverages `@tensorflow/tfjs-tflite` to run within a browser. It is conceptually identical to React Native, but relies on a WebAssembly backend rather than native iOS/Android ML delegates (CoreML/NNAPI).
- **Camera Resolution**: To optimize memory, we use standard resolutions and instantly resize to 224x224. If higher resolution archiving is necessary, the app should save the high-res photo separately from the resized tensor.
- **Mock Admin**: The "Field Data Admin" tab stores history locally in React State. A production application would sync this data to a remote database (e.g., Firebase, Supabase) via an occasionally-connected architecture.
