import tensorflow as tf

# Load your model (assuming it's a SavedModel)
model = tf.saved_model.load("path/to/your/model")

# Create a TFLite converter
converter = tf.lite.TFLiteConverter.from_saved_model("path/to/your/model")

# Apply optimizations (optional)
converter.optimizations = [tf.lite.Optimize.DEFAULT]

# Convert the model
tflite_model = converter.convert()

# Save the .tflite file
with open('model.tflite', 'wb') as f:
  f.write(tflite_model) 