import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MLPipeline, Observation } from './src/services/mlPipeline';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mlPipeline, setMlPipeline] = useState<MLPipeline | null>(null);
  const [results, setResults] = useState<Observation | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const initML = async () => {
      try {
        const pipeline = new MLPipeline();
        await pipeline.load();
        setMlPipeline(pipeline);
      } catch (e) {
        console.error("Failed to load ML Pipeline", e);
      }
    };
    initML();
  }, []);

  if (!permission) return <View style={styles.container}><ActivityIndicator /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || !mlPipeline) return;
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (photo) {
        // Pass to the native ML inference pipeline
        const predictions = await mlPipeline.predict(photo.uri, photo.base64);
        setResults(predictions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (results) {
    return (
      <SafeAreaView style={styles.container}>
         <Image source={{uri: results.imageUri}} style={styles.previewImage} />
         <View style={styles.resultsContainer}>
            <Text style={styles.title}>Identification Results</Text>
            {results.predictions.map((p, idx) => (
               <View key={idx} style={styles.resultRow}>
                 <Text style={styles.resultLabel}>{p.label.replace(/_/g, ' ')}</Text>
                 <Text style={styles.resultScore}>{(p.score * 100).toFixed(1)}%</Text>
               </View>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => setResults(null)}>
              <Text style={styles.buttonText}>Capture Another</Text>
            </TouchableOpacity>
         </View>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.instructionBanner}>
          <Text style={styles.instructionText}>Center Plant in View</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture} disabled={isProcessing}>
            {isProcessing ? <ActivityIndicator color="#0f172a" size="large" /> : <View style={styles.innerCaptureButton} />}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center' },
  camera: { flex: 1 },
  instructionBanner: { position: 'absolute', top: 100, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  instructionText: { color: 'white', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 12 },
  buttonContainer: { flex: 1, backgroundColor: 'transparent', marginBottom: 50, justifyContent: 'flex-end', alignItems: 'center' },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  innerCaptureButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'white' },
  button: { backgroundColor: '#0f172a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  text: { textAlign: 'center', color: 'white', marginBottom: 20 },
  previewImage: { flex: 1, resizeMode: 'cover' },
  resultsContainer: { padding: 24, backgroundColor: '#f8fafc', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 30 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 20, letterSpacing: -0.5 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  resultLabel: { fontSize: 16, color: '#334155', fontWeight: '500', textTransform: 'capitalize' },
  resultScore: { fontSize: 16, color: '#0f172a', fontWeight: 'bold' }
});
