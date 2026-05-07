import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';

export interface Prediction {
  label: string;
  score: number;
}

export interface Observation {
  imageUri: string;
  predictions: Prediction[];
}

// Ensure you include a mechanism to load label maps dynamically in real implementations.
const LABELS = [
  "Background", "Acer_campestre", "Quercus_robur", "Fagus_sylvatica", "Pinus_sylvestris",
  "Betula_pendula", "Corylus_avellana", "Crataegus_monogyna", "Ilex_aquifolium", "Unknown"
]; 

export class MLPipeline {
  private model: TensorflowModel | null = null;
  private isLoaded = false;

  async load() {
    if (this.isLoaded) return;
    
    // We retain TFJS strictly for mathematical tensor preprocessing
    await tf.ready();
    
    // We load the TFLite native engine for high performance inference using JSI
    // Model should be located in /assets folder next to App.tsx
    this.model = await loadTensorflowModel(require('../../assets/mobilenet_v2.tflite'));
    this.isLoaded = true;
  }

  async predict(imageUri: string, base64Data?: string): Promise<Observation> {
    if (!this.model) throw new Error('ML Model not initialized.');

    // 1. Fetch RAW image bitstream
    const b64 = base64Data || await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
    const imgBuffer = tf.util.encodeString(b64, 'base64').buffer;
    const rawByteData = new Uint8Array(imgBuffer);

    // 2. Exact mathematically preserved preprocessing pipeline
    const imgTensor = decodeJpeg(rawByteData);
    const resized = tf.image.resizeBilinear(imgTensor, [224, 224]);
    
    // Shape transformation to [1, 224, 224, 3] and strict int32 typing (no normalization for uint8 models)
    const batched = resized.expandDims(0);
    const inputArgs = batched.cast('int32');

    // 3. Prepare payload for the Native Bridge (react-native-fast-tflite)
    // Convert int32 arrays mapped to uint8 arrays
    const int32Array = inputArgs.dataSync();
    
    // react-native-fast-tflite requires us to pass the typed array as an underlying Uint8Array Memory Buffer
    const inputBuffer = new Uint8Array(int32Array);

    // 4. Run On-Device JSI Inference
    const outputBuffer = await this.model.run([inputBuffer]);
    
    // 5. Post-Processing & Softmax Mapping
    // Quantized model outputs Uint8Array values 0-255 representing 0-1 probability
    const outputValues = outputBuffer[0];
    
    // Softmax isn't strictly necessary for quantized model if it's already normalized, but we can do it directly
    const probabilities = Array.from(outputValues).map(x => x / 255.0);

    // Filter Top K predictions
    const top5 = probabilities
      .map((score, index) => ({ label: LABELS[index % LABELS.length] || `Unknown_${index}`, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Prevent memory leaks on device
    tf.dispose([imgTensor, resized, normalized, batched, inputArgs]);

    return {
      imageUri,
      predictions: top5,
    };
  }
}
