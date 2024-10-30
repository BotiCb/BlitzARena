import {Frame} from 'react-native-vision-camera';

const CACHE_ID = '__cachedArrayForResizer'
function getArrayFromCache(size: number): Int8Array {
  'worklet'
  if (global[CACHE_ID] == null || global[CACHE_ID].length != size) {
    global[CACHE_ID] = new Int8Array(size)
  }
  return global[CACHE_ID]
}

// Resize any Frame to the target width and height in RGB format.
export function resize(frame: Frame, width: number, height: number): Int8Array {
  'worklet'
  const inputWidth = frame.width
  const inputHeight = frame.height
  console.log( frame.toArrayBuffer())
  // Check if toArrayBuffer is available before calling it
  if (frame.toArrayBuffer) { 
    const arrayData = frame.toArrayBuffer()

    const outputSize = width * height * 3 // 3 for RGB
    const outputFrame = getArrayFromCache(outputSize)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Find closest pixel from the source image
        const srcX = Math.floor((x / width) * inputWidth)
        const srcY = Math.floor((y / height) * inputHeight)

        // Compute the source and destination index
        const srcIndex = (srcY * inputWidth + srcX) * 4 // 4 for BGRA
        const destIndex = (y * width + x) * 3         // 3 for RGB

        // Convert from BGRA to RGB
        outputFrame[destIndex] = arrayData[srcIndex + 2]   // R
        outputFrame[destIndex + 1] = arrayData[srcIndex + 1] // G
        outputFrame[destIndex + 2] = arrayData[srcIndex]     // B
      }
    }

    return outputFrame
  } else {
    // Handle the case where toArrayBuffer is not available
    // You might want to return a default value, throw an error, or use an alternative method
    console.error('Frame.toArrayBuffer() is not available on this device.');
    // Example: Return a blank Int8Array
    return new Int8Array(width * height * 3); 
  }
}