#!/bin/bash

# Ensure the tensorflow directory exists
if [ -d "./tensorflow" ]; then
  echo "Copying tensorflow directory to the correct location..."
  
  # Copy the tensorflow directory to the necessary location
  cp -r ./tensorflow ./node_modules/react-native-fast-tflite/

  # Alternatively, if you need it somewhere else, adjust the path accordingly
  # cp -r ./tensorflow /path/to/desired/location/
else
  echo "Error: tensorflow directory not found!"
  exit 1
fi
