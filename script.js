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
let previewWidth = 0;
let previewHeight = 0;
let _rafId = null;
let _drawDebounce = null;
let _heavyDebounce = null;
let _heavyEffectsNow = false;

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
  ,sharpen: {grayscale:0, sepia:0, blur:0, brightness:100, contrast:105, hue:0, saturate:105, invert:0, opacity:100, shadowX:0, shadowY:0, shadowBlur:0, sharpen:70, vignette:0, tint:0}
  ,vignette: {grayscale:0, sepia:0, blur:0, brightness:95, contrast:95, hue:0, saturate:95, invert:0, opacity:100, shadowX:0, shadowY:0, shadowBlur:0, sharpen:0, vignette:60, tint:0}
  ,warm: {grayscale:0, sepia:8, blur:0, brightness:103, contrast:102, hue:0, saturate:110, invert:0, opacity:100, shadowX:0, shadowY:0, shadowBlur:0, sharpen:6, vignette:8, tint:30}
  ,cool_sharp: {grayscale:0, sepia:0, blur:0, brightness:100, contrast:108, hue:200, saturate:105, invert:0, opacity:100, shadowX:0, shadowY:0, shadowBlur:0, sharpen:40, vignette:10, tint:-30}
  ,pop: {grayscale:0, sepia:0, blur:0, brightness:110, contrast:130, hue:0, saturate:150, invert:0, opacity:100, shadowX:0, shadowY:0, shadowBlur:0, sharpen:20, vignette:0, tint:0}
  ,soft: {grayscale:0, sepia:6, blur:0.5, brightness:98, contrast:92, hue:0, saturate:95, invert:0, opacity:100, shadowX:0, shadowY:0, shadowBlur:6, sharpen:0, vignette:18, tint:8}
};

// Update presets to include new filters (default 0 values added)
Object.keys(presets).forEach(p => {
  presets[p].sharpen = presets[p].sharpen || 0;
  presets[p].vignette = presets[p].vignette || 0;
  presets[p].tint = presets[p].tint || 0;
});

function updateLabels() {
  if (controls.grayscale && valueLabels.grayscale) valueLabels.grayscale.textContent = controls.grayscale.value + '%';
  if (controls.sepia && valueLabels.sepia) valueLabels.sepia.textContent = controls.sepia.value + '%';
  if (controls.blur && valueLabels.blur) valueLabels.blur.textContent = controls.blur.value + 'px';
  if (controls.brightness && valueLabels.brightness) valueLabels.brightness.textContent = controls.brightness.value + '%';
  if (controls.contrast && valueLabels.contrast) valueLabels.contrast.textContent = controls.contrast.value + '%';
  if (controls.hue && valueLabels.hue) valueLabels.hue.textContent = controls.hue.value + '°';
  if (controls.saturate && valueLabels.saturate) valueLabels.saturate.textContent = controls.saturate.value + '%';
  if (controls.invert && valueLabels.invert) valueLabels.invert.textContent = controls.invert.value + '%';
  if (controls.opacity && valueLabels.opacity) valueLabels.opacity.textContent = controls.opacity.value + '%';
  if (controls.shadowX && valueLabels.shadowX) valueLabels.shadowX.textContent = controls.shadowX.value + 'px';
  if (controls.shadowY && valueLabels.shadowY) valueLabels.shadowY.textContent = controls.shadowY.value + 'px';
  if (controls.shadowBlur && valueLabels.shadowBlur) valueLabels.shadowBlur.textContent = controls.shadowBlur.value + 'px';
  if (controls.sharpen && valueLabels.sharpen) valueLabels.sharpen.textContent = controls.sharpen.value + '%';
  if (controls.vignette && valueLabels.vignette) valueLabels.vignette.textContent = controls.vignette.value + '%';
  if (controls.tint && valueLabels.tint) valueLabels.tint.textContent = controls.tint.value;
}

function getFilterString() {
  return `grayscale(${controls.grayscale.value}%) sepia(${controls.sepia.value}%) blur(${controls.blur.value}px) brightness(${controls.brightness.value}%) contrast(${controls.contrast.value}%) hue-rotate(${controls.hue.value}deg) saturate(${controls.saturate.value}%) invert(${controls.invert.value}%)`;
}

function drawImage() {
  if (!img || !img.src) return;
  // ensure preview canvas size is set for current layout
  if (!previewWidth || !previewHeight) updatePreviewSize();
  // canvas internal pixel size is already set in updatePreviewSize
  // Draw to a temporary canvas first (so we can apply opacity/shadow correctly)
  const tmp = document.createElement('canvas');
  // tmp uses the canvas internal pixel size
  tmp.width = canvas.width;
  tmp.height = canvas.height;
  const tctx = tmp.getContext('2d');
  tctx.clearRect(0,0,tmp.width,tmp.height);
  // apply CSS-like filters where supported
  try { tctx.filter = getFilterString(); } catch (e) { tctx.filter = 'none'; }
  // draw image scaled to preview internal pixels
  tctx.drawImage(img, 0, 0, tmp.width, tmp.height);

  // now draw temp onto main canvas with opacity and shadow
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  // opacity
  const opacity = (controls.opacity ? Number(controls.opacity.value) : 100) / 100;
  ctx.globalAlpha = opacity;
  // shadows
  const sx = controls.shadowX ? Number(controls.shadowX.value) : 0;
  const sy = controls.shadowY ? Number(controls.shadowY.value) : 0;
  const sblur = controls.shadowBlur ? Number(controls.shadowBlur.value) : 0;
  if (sblur > 0 || sx !== 0 || sy !== 0) {
    ctx.shadowOffsetX = sx;
    ctx.shadowOffsetY = sy;
    ctx.shadowBlur = sblur;
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.drawImage(tmp, 0, 0);
  ctx.restore();

  // apply post-processing effects: sharpen, vignette, tint
  applyPostEffects();
}

// compute preview size based on container and device
function updatePreviewSize() {
  if (!originalWidth || !originalHeight) return;
  const wrap = document.querySelector('.canvas-wrap');
  const maxW = wrap ? Math.max(160, wrap.clientWidth - 12) : Math.min(originalWidth, 520);
  const scale = Math.min(1, maxW / originalWidth);
  previewWidth = Math.max(120, Math.round(originalWidth * scale));
  previewHeight = Math.max(80, Math.round(originalHeight * scale));

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  // set CSS size
  canvas.style.width = previewWidth + 'px';
  canvas.style.height = previewHeight + 'px';
  // set internal pixel size
  canvas.width = Math.round(previewWidth * dpr);
  canvas.height = Math.round(previewHeight * dpr);
  // scale drawing operations to DPR
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}


// update preview size on resize (debounced)
let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    updatePreviewSize();
    drawImage();
  }, 120);
});
// Post-processing: sharpen (convolution mix), vignette (radial gradient), tint (color overlay)
function applyPostEffects() {
  const s = Number((controls.sharpen && controls.sharpen.value) || 0);
  const v = Number(controls.vignette.value);
  const t = Number(controls.tint.value);

  // operate on current canvas pixels
  // Apply sharpen only when heavy effects are enabled (debounced) or during export
  if (s > 0 && _heavyEffectsNow) {
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
      // compute preview size for current layout (preview), keep originalWidth/Height for export
      updatePreviewSize();
      placeholder.style.display = 'none';
      drawImage();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// schedule draw: quick preview now, heavy effects after quiet period
function scheduleDraw(delay = 250, immediatePreview = true) {
  // cancel RAF for previous preview
  if (_rafId) cancelAnimationFrame(_rafId);
  if (immediatePreview) {
    _rafId = requestAnimationFrame(() => {
      _heavyEffectsNow = false;
      drawImage();
    });
  }
  // clear previous heavy timer
  if (_heavyDebounce) clearTimeout(_heavyDebounce);
  _heavyDebounce = setTimeout(() => {
    _heavyEffectsNow = true;
    drawImage();
    // reset heavy flag shortly after drawing
    setTimeout(() => { _heavyEffectsNow = false; }, 50);
  }, delay);
}

// wire sliders (skip any missing controls) — use scheduleDraw to avoid freeze
Object.values(controls).forEach(c => {
  if (!c) return;
  c.addEventListener('input', () => {
    updateLabels();
    scheduleDraw(300, true);
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
  scheduleDraw(200, true);
});

resetBtn.addEventListener('click', () => {
  Object.keys(defaults).forEach(k => {
    if (controls[k]) controls[k].value = defaults[k];
  });
  presetSelect.value = 'none';
  updateLabels();
  scheduleDraw(200, true);
});

downloadBtn.addEventListener('click', () => {
  if (!img || !img.src) return alert('कृपया पहले कोई इमेज अपलोड करें');
  // Render full-resolution image into a temporary full-size canvas, apply same pipeline, then download
  const full = document.createElement('canvas');
  full.width = originalWidth;
  full.height = originalHeight;
  const fctx = full.getContext('2d');

  // 1) draw with filters to temp
  const tmp = document.createElement('canvas');
  tmp.width = originalWidth;
  tmp.height = originalHeight;
  const tctx = tmp.getContext('2d');
  try { tctx.filter = getFilterString(); } catch (e) { tctx.filter = 'none'; }
  tctx.drawImage(img, 0, 0, originalWidth, originalHeight);

  // 2) draw tmp to final with opacity and shadow
  fctx.clearRect(0,0,full.width, full.height);
  fctx.save();
  const opacity = (controls.opacity ? Number(controls.opacity.value) : 100) / 100;
  fctx.globalAlpha = opacity;
  const sx = controls.shadowX ? Number(controls.shadowX.value) : 0;
  const sy = controls.shadowY ? Number(controls.shadowY.value) : 0;
  const sblur = controls.shadowBlur ? Number(controls.shadowBlur.value) : 0;
  if (sblur > 0 || sx !== 0 || sy !== 0) {
    fctx.shadowOffsetX = sx;
    fctx.shadowOffsetY = sy;
    fctx.shadowBlur = sblur;
    fctx.shadowColor = 'rgba(0,0,0,0.35)';
  }
  fctx.drawImage(tmp, 0, 0);
  fctx.restore();

  // 3) post effects on full canvas
  const s = Number(controls.sharpen ? controls.sharpen.value : 0);
  const v = Number(controls.vignette ? controls.vignette.value : 0);
  const t = Number(controls.tint ? controls.tint.value : 0);

  if (s > 0) {
    try {
      const orig = fctx.getImageData(0,0,full.width, full.height);
      const conv = convolveSharpen(orig);
      const mix = s / 100;
      const out = mixImageData(orig, conv, mix);
      fctx.putImageData(out, 0, 0);
    } catch (e) {
      console.warn('Sharpen failed during export', e);
    }
  }

  if (t !== 0) {
    const alpha = Math.min(0.6, Math.abs(t) / 200 + 0.05);
    fctx.save();
    fctx.globalCompositeOperation = 'overlay';
    fctx.fillStyle = t > 0 ? `rgba(255,160,64,${alpha})` : `rgba(64,160,255,${alpha})`;
    fctx.fillRect(0,0,full.width, full.height);
    fctx.restore();
  }

  if (v > 0) {
    fctx.save();
    const cx = full.width/2;
    const cy = full.height/2;
    const maxr = Math.sqrt(cx*cx + cy*cy);
    const grad = fctx.createRadialGradient(cx, cy, maxr*0.2, cx, cy, maxr);
    const gAlpha = Math.min(0.85, v/100 * 0.85);
    grad.addColorStop(0, `rgba(0,0,0,0)`);
    grad.addColorStop(1, `rgba(0,0,0,${gAlpha})`);
    fctx.globalCompositeOperation = 'multiply';
    fctx.fillStyle = grad;
    fctx.fillRect(0,0,full.width, full.height);
    fctx.restore();
  }

  const link = document.createElement('a');
  link.download = 'filtered-image.png';
  link.href = full.toDataURL('image/png');
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
    navToggle.classList.toggle('open', open);
  });
  // close menu when a link is clicked
  Array.from(navLinks.querySelectorAll('a')).forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}
