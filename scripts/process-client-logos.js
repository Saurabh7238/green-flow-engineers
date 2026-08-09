const path = require('path');

// dynamic import for ESM-compatible Jimp
let Jimp;
(async () => {
  const mod = await import('jimp');
  Jimp = mod.default || mod;

  const files = [
    'public/images/clients/Sagar.jpeg',
    'public/images/clients/Bhilosa.jpeg',
    'public/images/clients/trident.jpeg',
    'public/images/clients/Reliance.jpeg',
  ];

  async function process(file) {
    const image = await Jimp.read(file);
    // make near-black pixels transparent
    const threshold = 40; // adjust if needed
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      // if pixel is near black, make transparent
      if (r < threshold && g < threshold && b < threshold) {
        this.bitmap.data[idx + 3] = 0;
      }
    });

    // Resize to fit within a square and center on transparent background
    const size = 160; // final square size
    image.contain(size - 16, size - 16, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

    const canvas = new Jimp(size, size, 0x00000000);
    canvas.composite(image, (size - image.bitmap.width) / 2, (size - image.bitmap.height) / 2, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1,
    });

    const out = file.replace(path.extname(file), '.png');
    await canvas.writeAsync(out);
    console.log('Wrote', out);
  }

  for (const f of files) {
    try {
      await process(f);
    } catch (err) {
      console.error('Error processing', f, err && err.message ? err.message : err);
    }
  }

})();
