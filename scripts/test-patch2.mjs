// Test if NodeCanvas's drawImage accepts its own Canvas
import nodeCanvas from 'canvas';

const c1 = nodeCanvas.createCanvas(100, 100);
const c2 = nodeCanvas.createCanvas(50, 50);
const ctx = c1.getContext('2d');

// Draw c2 onto c1
try {
  ctx.drawImage(c2, 0, 0, 50, 50, 0, 0, 100, 100);
  console.log('OK: drawn canvas onto canvas with 9-arg form');
} catch(e) {
  console.log('FAIL 9-arg:', e.message);
}

try {
  ctx.drawImage(c2, 0, 0);
  console.log('OK: drawn canvas onto canvas with 3-arg form');
} catch(e) {
  console.log('FAIL 3-arg:', e.message);
}

// Test ImageData
const id = c1.getContext('2d').createImageData(10, 10);
try {
  ctx.putImageData(id, 0, 0);
  console.log('OK: putImageData');
} catch(e) {
  console.log('FAIL putImageData:', e.message);
}

// Test Image
const img = new nodeCanvas.Image();
img.src = c1.toBuffer('image/png');
console.log('img width:', img.width);
try {
  ctx.drawImage(img, 0, 0);
  console.log('OK: drawn Image');
} catch(e) {
  console.log('FAIL Image drawImage:', e.message);
}

// Now check what class c2 is
console.log('c2 instanceof Canvas:', c2 instanceof nodeCanvas.Canvas);
console.log('c2 constructor:', c2.constructor.name);
console.log('typeof c2:', typeof c2);
console.log('Object.getPrototypeOf(c2).constructor.name:', Object.getPrototypeOf(c2).constructor.name);
