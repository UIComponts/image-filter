const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const placeholder = document.getElementById('placeholder');

const controls = {
  grayscale: document.getElementById('grayscale'),
  sepia: document.getElementById('sepia'),
  blur: document.getElementById('blur'),
  brightness: document.getElementById('brightness'),
  contrast: document.getElementById('contrast'),
  hue: document.getElementById('hue'),
  saturate: document.getElementById('saturate'),
  invert: document.getElementById('invert'),
  opacity: document.getElementById('opacity'),
  shadowX: document.getElementById('shadowX'),
  shadowY: document.getElementById('shadowY'),
  shadowBlur: document.getElementById('shadowBlur')
  ,sharpen: document.getElementById('sharpen')
  ,vignette: document.getElementById('vignette')
  ,tint: document.getElementById('tint')
};

const valueLabels = {
  grayscale: document.getElementById('grayscaleVal'),
  sepia: document.getElementById('sepiaVal'),
  blur: document.getElementById('blurVal'),
  brightness: document.getElementById('brightnessVal'),
  contrast: document.getElementById('contrastVal'),
  hue: document.getElementById('hueVal'),
  saturate: document.getElementById('saturateVal'),
  invert: document.getElementById('invertVal'),
  opacity: document.getElementById('opacityVal'),
  shadowX: document.getElementById('shadowXVal'),
  shadowY: document.getElementById('shadowYVal'),
  shadowBlur: document.getElementById('shadowBlurVal')
  ,sharpen: document.getElementById('sharpenVal')
  ,vignette: document.getElementById('vignetteVal')
  ,tint: document.getElementById('tintVal')
};

const presetSelect = document.getElementById('presetSelect');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');

let img = new Image();
let originalWidth = 0;
let originalHeight = 0;

const defaults = {
  grayscale: 0,
  sepia: 0,
  blur: 0,
  brightness: 100,
  contrast: 100,
  hue: 0,
  saturate: 100,
  invert: 0,
  opacity: 100,
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 0
  ,sharpen: 0
  ,vignette: 0
  ,tint: 0
};

const presets = {
  none: {...defaults},
  grayscale: {grayscale:100, sepia:0, blur:0, brightness:100, contrast:100, hue:0, saturate:100, invert:0, opacity: 100, shadowX: 0, shadowY: 0, shadowBlur: 0},
  vintage: {grayscale:0, sepia:40, blur:0, brightness:95, contrast:110, hue:0, saturate:90, invert:0, opacity: 100, shadowX: 0, shadowY: 0, shadowBlur: 0},
  bright: {grayscale:0, sepia:0, blur:0, brightness:120, contrast:110, hue:0, saturate:120, invert:0, opacity: 100, shadowX: 0, shadowY: 0, shadowBlur: 0},
  cool: {grayscale:0, sepia:0, blur:0, brightness:100, contrast:100, hue:200, saturate:100, invert:0, opacity: 100, shadowX: 0, shadowY: 0, shadowBlur: 0},
  invert: {grayscale:0, sepia:0, blur:0, brightness:100, contrast:100, hue:0, saturate:100, invert:100, opacity: 100, shadowX: 0, shadowY: 0, shadowBlur: 0}
};

// Update presets to include new filters (default 0 values added)
Object.keys(presets).forEach(p => {
  presets[p].sharpen = presets[p].sharpen || 0;
  presets[p].vignette = presets[p].vignette || 0;
  presets[p].tint = presets[p].tint || 0;
});

function updateLabels() {
  valueLabels.grayscale.textContent = controls.grayscale.value + '%';
  valueLabels.sepia.textContent = controls.sepia.value + '%';
  valueLabels.blur.textContent = controls.blur.value + 'px';
  valueLabels.brightness.textContent = controls.brightness.value + '%';
  valueLabels.contrast.textContent = controls.contrast.value + '%';
  valueLabels.hue.textContent = controls.hue.value + '°';
  valueLabels.saturate.textContent = controls.saturate.value + '%';
  valueLabels.invert.textContent = controls.invert.value + '%';
  valueLabels.opacity.textContent = controls.opacity.value + '%';
  valueLabels.shadowX.textContent = controls.shadowX.value + 'px';
  valueLabels.shadowY.textContent = controls.shadowY.value + 'px';
  valueLabels.shadowBlur.textContent = controls.shadowBlur.value + 'px';
  valueLabels.sharpen.textContent = controls.sharpen.value + '%';
  valueLabels.vignette.textContent = controls.vignette.value + '%';
  valueLabels.tint.textContent = controls.tint.value;
}

function getFilterString() {
  return `grayscale(${controls.grayscale.value}%) sepia(${controls.sepia.value}%) blur(${controls.blur.value}px) brightness(${controls.brightness.value}%) contrast(${controls.contrast.value}%) hue-rotate(${controls.hue.value}deg) saturate(${controls.saturate.value}%) invert(${controls.invert.value}%)`;
}

function drawImage() {
  if (!img || !img.src) return;
  canvas.width = originalWidth;
  canvas.height = originalHeight;
  // Use context filter where supported to get same effect as CSS filters when exporting
  ctx.clearRect(0,0,canvas.width,canvas.height);
  try {
    ctx.filter = getFilterString();
  } catch (e) {
    // older browsers may not support ctx.filter
    ctx.filter = 'none';
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // apply post-processing effects: sharpen, vignette, tint
  applyPostEffects();
}

// Post-processing: sharpen (convolution mix), vignette (radial gradient), tint (color overlay)
function applyPostEffects() {
  const s = Number(controls.sharpen.value);
  const v = Number(controls.vignette.value);
  const t = Number(controls.tint.value);

  // operate on current canvas pixels
  if (s > 0) {
    try {
      // get original pixels
      const orig = ctx.getImageData(0,0,canvas.width,canvas.height);
      const conv = convolveSharpen(orig);
      // mix based on s (0-100 -> 0.0-1.0)
      const mix = s / 100;
      const out = mixImageData(orig, conv, mix);
      ctx.putImageData(out, 0, 0);
    } catch (e) {
      console.warn('Sharpen failed', e);
    }
  }

  if (t !== 0) {
    const alpha = Math.min(0.6, Math.abs(t) / 200 + 0.05); // small max opacity
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = t > 0 ? `rgba(255,160,64,${alpha})` : `rgba(64,160,255,${alpha})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();
  }

  if (v > 0) {
    ctx.save();
    const cx = canvas.width/2;
    const cy = canvas.height/2;
    const maxr = Math.sqrt(cx*cx + cy*cy);
    const grad = ctx.createRadialGradient(cx, cy, maxr*0.2, cx, cy, maxr);
    const gAlpha = Math.min(0.85, v/100 * 0.85);
    grad.addColorStop(0, `rgba(0,0,0,0)`);
    grad.addColorStop(1, `rgba(0,0,0,${gAlpha})`);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();
  }
}

function convolveSharpen(imageData) {
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;
  const out = new ImageData(w,h);
  const dst = out.data;
  // sharpen kernel
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  for (let y=0;y<h;y++){
    for (let x=0;x<w;x++){
      let r=0,g=0,b=0,a=0;
      for (let ky=-1; ky<=1; ky++){
        for (let kx=-1; kx<=1; kx++){
          const sx = Math.min(w-1, Math.max(0, x + kx));
          const sy = Math.min(h-1, Math.max(0, y + ky));
          const spos = (sy * w + sx) * 4;
          const kval = k[(ky+1)*3 + (kx+1)];
          r += src[spos] * kval;
          g += src[spos+1] * kval;
          b += src[spos+2] * kval;
        }
      }
      const pos = (y*w + x) * 4;
      dst[pos] = clamp(Math.round(r),0,255);
      dst[pos+1] = clamp(Math.round(g),0,255);
      dst[pos+2] = clamp(Math.round(b),0,255);
      dst[pos+3] = src[pos+3];
    }
  }
  return out;
}

function mixImageData(orig, conv, mix) {
  const w = orig.width, h = orig.height;
  const out = new ImageData(w,h);
  const o = orig.data, c = conv.data, d = out.data;
  for (let i=0;i<o.length;i+=4){
    d[i] = clamp(Math.round(o[i] * (1-mix) + c[i] * mix),0,255);
    d[i+1] = clamp(Math.round(o[i+1] * (1-mix) + c[i+1] * mix),0,255);
    d[i+2] = clamp(Math.round(o[i+2] * (1-mix) + c[i+2] * mix),0,255);
    d[i+3] = o[i+3];
  }
  return out;
}

function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }

function loadFromFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    img = new Image();
    img.onload = function() {
      originalWidth = img.width;
      originalHeight = img.height;
      // fit canvas size for display scaling but still use original pixels for download
      const maxW = 900;
      const maxH = 640;
      let scale = Math.min(1, maxW / originalWidth, maxH / originalHeight);
      // for drawing we keep original pixel size on canvas for accurate download
      canvas.style.maxWidth = '100%';
      canvas.width = originalWidth;
      canvas.height = originalHeight;
      placeholder.style.display = 'none';
      drawImage();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// wire sliders
Object.values(controls).forEach(c => {
  c.addEventListener('input', () => {
    updateLabels();
    drawImage();
  });
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  loadFromFile(file);
});

presetSelect.addEventListener('change', (e) => {
  const p = presets[e.target.value] || presets.none;
  Object.keys(p).forEach(k => {
    if (controls[k]) controls[k].value = p[k];
  });
  updateLabels();
  drawImage();
});

resetBtn.addEventListener('click', () => {
  Object.keys(defaults).forEach(k => {
    if (controls[k]) controls[k].value = defaults[k];
  });
  presetSelect.value = 'none';
  updateLabels();
  drawImage();
});

downloadBtn.addEventListener('click', () => {
  if (!img || !img.src) return alert('कृपया पहले कोई इमेज अपलोड करें');
  // ensure canvas has image drawn with current filters
  drawImage();
  const link = document.createElement('a');
  link.download = 'filtered-image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// initialize labels
updateLabels();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('main-nav');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // close menu when a link is clicked
  Array.from(navLinks.querySelectorAll('a')).forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}
