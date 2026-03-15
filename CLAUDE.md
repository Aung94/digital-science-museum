# Digital Science Museum — Developer Guide

## Quick Start
```bash
python -m http.server 3457 --directory .
```
Open http://localhost:3457

## Adding a New Exhibit

### 1. Create exhibit JS file (e.g., `myexhibit.js`)
```javascript
reg('section-slug', {
  section: 'physics',  // physics|math|chemistry|space
  icon: '🔬',
  tKey: 'mykey.t', dKey: 'mykey.d', tagKey: 'mykey.tag',
  expTKey: 'mykey.exp_t', expKey: 'mykey.exp',
  render(el) {
    el.innerHTML = `<canvas id="myCv" height="400"></canvas>`;
    const cv = document.getElementById('myCv');
    const ctx = setupCanvas(cv, cv.parentElement.getBoundingClientRect().width, 400);
    let raf;
    function draw() { /* ... */ raf = requestAnimationFrame(draw); }
    draw();
    return () => cancelAnimationFrame(raf);  // MUST return cleanup
  }
});
```

### 2. Add translations to `lang.js`
In `en:` block (before closing `}`):
```javascript
mykey:{t:"Title",d:"Description",tag:"Interactive",exp_t:"How It Works",exp:"Explanation with <strong>bold</strong>"},
```
In `my:` block (same position):
```javascript
mykey:{t:"ခေါင်းစဉ်",d:"ဖော်ပြချက်",tag:"အပြန်အလှန်",exp_t:"အလုပ်လုပ်ပုံ",exp:"ရှင်းလင်းချက်"},
```

### 3. Add script to `index.html`
```html
<script src="myexhibit.js"></script>
```
Add BEFORE the DOMContentLoaded script line.

### 4. Add CSS to `style.css` (if needed)
Add before `/* ANIMATIONS */` section.

## Architecture
- **Exhibit registry**: `reg(id, config)` → `exhibits` Map
- **Router**: hash-based SPA (`#home`, `#math/piday`, `#physics/atoms`)
- **Slug convention**: exhibit ID `math-piday` → URL `#math/piday`
- **Language**: `t('key.path')` → looks up LANG[currentLang]
- **Canvas**: `setupCanvas(canvas, w, h)` handles DPR scaling

## File Map
| File | Purpose |
|------|---------|
| index.html | Shell, nav, script includes |
| style.css | All styles |
| lang.js | EN + Burmese translations |
| core.js | Registry, router, home/section/exhibit renderers |
| physics.js | 5 exhibits: atoms, forces, circuits, light, energy |
| math.js | 5 exhibits: primes, fractals, pythag, prob, trig |
| chemistry.js | 5 exhibits: ptable, states, bonds, ph, react |
| space.js | 5 exhibits: solar, rocket, moon, star, tele |
| piday.js | Pi Day special (5 tabs) |

## Important Notes
- Cleanup functions MUST be returned from render() to prevent memory leaks
- Use `window.fnName` for onclick handlers, delete them in cleanup
- Burmese translations should be natural, not literal
- Ads are banner-only (`.ad-banner` class), never popups
