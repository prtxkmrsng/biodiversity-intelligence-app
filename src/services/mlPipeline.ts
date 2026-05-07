/**
 * On-Device ML Pipeline using TensorFlow.js and TFLite
 */

declare const tflite: any;
declare const tf: any;

export interface Prediction {
  label: string;
  score: number;
}

export class MLPipeline {
  private model: any = null;
  private labels: string[] = [];
  public isLoaded = false;

  async init(modelUrl: string, labelsUrl: string) {
    if (this.isLoaded) return;
    try {
      console.log('Setup TFLite...');
      tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.10/wasm/');
      
      await tf.ready();
      
      console.log('Loading TFLite model...');
      this.model = await tflite.loadTFLiteModel(modelUrl + "?v=3");
      
      console.log('Loading labels...');
      const response = await fetch(labelsUrl);
      if (!response.ok) throw new Error("Could not fetch labels.txt");
      const text = await response.text();
      this.labels = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      this.isLoaded = true;
      console.log('Model and labels loaded successfully.');
    } catch (error) {
      console.error('Failed to load ML pipeline:', error);
      throw error;
    }
  }

  async predict(imageSource: HTMLImageElement | HTMLVideoElement): Promise<Prediction[]> {
    if (!this.model || !this.isLoaded) {
      throw new Error("Model is not initialized. Call init() first.");
    }

    return tf.tidy(() => {
      // 1. Convert HTML Image/Video to Tensor
      const imgTensor = tf.browser.fromPixels(imageSource);
      
      // 2. Resize to MobileNet standard (224x224)
      const resized = tf.image.resizeBilinear(imgTensor, [224, 224]);
      
      // 3. Normalize depending on model expectation. 
      const normalized = resized.div(127.5).sub(1.0);
      
      // 4. Add batch dimension: [1, 224, 224, 3]
      const batched = normalized.expandDims(0);
      
      // 5. Execute Inland Inference
      const input = batched.cast('float32');
      const outputTensor = this.model.predict(input);
      
      // 6. Post-process output to extract top K
      const data = outputTensor.dataSync(); 
      
      const predictions = Array.from(data)
        .map((score, index) => ({
          label: this.labels[index] || `Unknown (${index})`,
          score: Math.max(0, Math.min(1, Number(score))) 
        }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5); 

      return predictions;
    });
  }
}

export const mlPipeline = new MLPipeline();
