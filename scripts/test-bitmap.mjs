// Test ImageBitmap compatibility
import nodeCanvas from 'canvas';

const c1 = nodeCanvas.createCanvas(100, 100);
const ctx = c1.getContext('2d');

(async () => {
  const c2 = nodeCanvas.createCanvas(50, 50);
  const c2ctx = c2.getContext('2d');
  c2ctx.fillStyle = 'red';
  c2ctx.fillRect(0, 0, 50, 50);

  // Try createImageBitmap
  try {
    const bitmap = await createImageBitmap(c2);
    console.log('bitmap ok', bitmap.width, bitmap.height, bitmap.constructor.name);
    ctx.drawImage(bitmap, 0, 0);
    console.log('drawImage bitmap ok');
  } catch(e) {
    console.log('bitmap fail:', e.message);
  }
})();
