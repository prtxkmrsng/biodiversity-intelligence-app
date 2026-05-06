Upload your `mobilenet_v2.tflite` and `labels.txt` files to this directory.

The application looks for them at:
- `/mobilenet_v2.tflite`
- `/labels.txt`

Because Vite serves the `public` directory at the root URL, dropping them here will make them accessible to the ML pipeline.
