// Global Variables
let currentPage = 'home';
let currentColor = '#266470';
let currentPalette = [];
let savedPalettes = [];
let foregroundColor = '#000000';
let backgroundColor = '#ffffff';

// Color Conversion Functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function rgbToCmyk(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

// Palette Generation Functions
function generatePalette(baseColor, type) {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [baseColor];

    switch (type) {
        case 'complementary':
            colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
            colors.push(hslToHex(hsl.h, Math.max(0, hsl.s - 30), Math.min(100, hsl.l + 20)));
            colors.push(hslToHex((hsl.h + 180) % 360, Math.max(0, hsl.s - 30), Math.min(100, hsl.l + 20)));
            colors.push(hslToHex(hsl.h, Math.max(0, hsl.s - 50), Math.min(100, hsl.l + 40)));
            break;
        case 'triadic':
            colors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
            colors.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
            colors.push(hslToHex(hsl.h, Math.max(0, hsl.s - 40), Math.min(100, hsl.l + 30)));
            colors.push(hslToHex((hsl.h + 120) % 360, Math.max(0, hsl.s - 40), Math.min(100, hsl.l + 30)));
            break;
        case 'analogous':
            colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
            colors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
            colors.push(hslToHex((hsl.h + 60) % 360, Math.max(0, hsl.s - 20), hsl.l));
            colors.push(hslToHex((hsl.h - 60 + 360) % 360, Math.max(0, hsl.s - 20), hsl.l));
            break;
        case 'monochromatic':
            colors.push(hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 40)));
            colors.push(hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 20)));
            colors.push(hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 20)));
            colors.push(hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 40)));
            break;
        case 'tetradic':
            colors.push(hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l));
            colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
            colors.push(hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l));
            colors.push(hslToHex(hsl.h, Math.max(0, hsl.s - 30), Math.min(100, hsl.l + 20)));
            break;
    }

    return colors.slice(0, 5);
}

// Accessibility Functions
function getLuminance(r, g, b) {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function getContrastRatio(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

function simulateColorBlindness(hex) {
    const rgb = hexToRgb(hex);
    
    // Simplified color blindness simulation
    const protanopia = {
        r: Math.round(0.567 * rgb.r + 0.433 * rgb.g),
        g: Math.round(0.558 * rgb.r + 0.442 * rgb.g),
        b: rgb.b
    };
    
    const deuteranopia = {
        r: Math.round(0.625 * rgb.r + 0.375 * rgb.g),
        g: Math.round(0.7 * rgb.r + 0.3 * rgb.g),
        b: rgb.b
    };
    
    const tritanopia = {
        r: rgb.r,
        g: Math.round(0.95 * rgb.g + 0.05 * rgb.b),
        b: Math.round(0.433 * rgb.g + 0.567 * rgb.b)
    };
    
    return {
        protanopia: rgbToHex(protanopia.r, protanopia.g, protanopia.b),
        deuteranopia: rgbToHex(deuteranopia.r, deuteranopia.g, deuteranopia.b),
        tritanopia: rgbToHex(tritanopia.r, tritanopia.g, tritanopia.b)
    };
}

// Utility Functions
function generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Copied to clipboard!');
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function exportData(data, filename, format = 'json') {
    let content;
    let mimeType;
    
    switch (format) {
        case 'css':
            content = `:root {\n${data.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`;
            mimeType = 'text/css';
            filename = filename.replace('.json', '.css');
            break;
        case 'scss':
            content = data.map((color, i) => `$color-${i + 1}: ${color};`).join('\n');
            mimeType = 'text/scss';
            filename = filename.replace('.json', '.scss');
            break;
        default:
            content = JSON.stringify(Array.isArray(data) ? { palette: data } : data, null, 2);
            mimeType = 'application/json';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Exported as ${filename}`);
}

// Navigation Functions
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    currentPage = pageId;
    
    // Close mobile menu
    document.getElementById('nav-menu').classList.remove('active');
    
    // Initialize page-specific functionality
    if (pageId === 'converter') {
        updateColorFormats();
    } else if (pageId === 'palette') {
        updateCurrentPalette();
    } else if (pageId === 'checker') {
        updateAccessibilityAnalysis();
    }
}

// Color Converter Functions
function updateColorFormats() {
    const rgb = hexToRgb(currentColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    
    // Update format displays
    document.getElementById('hex-value').textContent = currentColor;
    document.getElementById('rgb-value').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('hsl-value').textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    document.getElementById('cmyk-value').textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    document.getElementById('hsv-value').textContent = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    
    // Update color preview
    document.getElementById('color-preview').style.backgroundColor = currentColor;
    
    // Update input fields
    document.getElementById('color-picker').value = currentColor;
    document.getElementById('color-input').value = currentColor;
}

// Palette Generator Functions
function updateCurrentPalette() {
    const paletteType = document.getElementById('palette-type').value;
    const baseColor = document.getElementById('palette-color-input').value;
    
    currentPalette = generatePalette(baseColor, paletteType);
    
    const paletteContainer = document.getElementById('current-palette');
    paletteContainer.innerHTML = '';
    
    currentPalette.forEach((color, index) => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color';
        colorDiv.style.backgroundColor = color;
        colorDiv.onclick = () => copyToClipboard(color);
        
        const label = document.createElement('div');
        label.className = 'palette-color-label';
        label.textContent = color;
        
        colorDiv.appendChild(label);
        paletteContainer.appendChild(colorDiv);
    });
}

function savePalette() {
    const name = prompt('Enter palette name:');
    if (name && name.trim()) {
        savedPalettes.push({
            name: name.trim(),
            colors: [...currentPalette]
        });
        updateSavedPalettes();
        showToast('Palette saved!');
    }
}

function updateSavedPalettes() {
    const container = document.getElementById('saved-palettes');
    
    if (savedPalettes.length === 0) {
        container.innerHTML = '<p class="empty-state">No saved palettes yet</p>';
        return;
    }
    
    container.innerHTML = '';
    
    savedPalettes.forEach((palette, index) => {
        const paletteDiv = document.createElement('div');
        paletteDiv.className = 'saved-palette';
        
        paletteDiv.innerHTML = `
            <div class="saved-palette-header">
                <span class="saved-palette-name">${palette.name}</span>
                <div class="saved-palette-actions">
                    <button class="copy-btn" onclick="copyToClipboard('${palette.colors.join(', ')}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="copy-btn" onclick="exportData(${JSON.stringify(palette.colors)}, '${palette.name}.json')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="copy-btn" onclick="deletePalette(${index})" style="color: #ef4444;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="saved-palette-colors">
                ${palette.colors.map(color => `
                    <div class="saved-palette-color" 
                         style="background-color: ${color};" 
                         onclick="copyToClipboard('${color}')">
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(paletteDiv);
    });
}

function deletePalette(index) {
    if (confirm('Are you sure you want to delete this palette?')) {
        savedPalettes.splice(index, 1);
        updateSavedPalettes();
        showToast('Palette deleted!');
    }
}

// Accessibility Checker Functions
function updateAccessibilityAnalysis() {
    const contrastRatio = getContrastRatio(foregroundColor, backgroundColor);
    const wcagAA = contrastRatio >= 4.5;
    const wcagAAA = contrastRatio >= 7;
    const colorBlindness = simulateColorBlindness(foregroundColor);
    
    // Update contrast ratio display
    document.getElementById('contrast-ratio').textContent = `${contrastRatio.toFixed(2)}:1`;
    
    // Update contrast level
    const contrastLevel = document.getElementById('contrast-level');
    const contrastIcon = contrastLevel.querySelector('i');
    const contrastText = contrastLevel.querySelector('span');
    
    if (contrastRatio >= 7) {
        contrastLevel.className = 'contrast-level aaa';
        contrastIcon.className = 'fas fa-check';
        contrastText.textContent = 'AAA';
    } else if (contrastRatio >= 4.5) {
        contrastLevel.className = 'contrast-level aa';
        contrastIcon.className = 'fas fa-exclamation-triangle';
        contrastText.textContent = 'AA';
    } else {
        contrastLevel.className = 'contrast-level fail';
        contrastIcon.className = 'fas fa-times';
        contrastText.textContent = 'Fail';
    }
    
    // Update WCAG cards
    const wcagAaCard = document.getElementById('wcag-aa');
    const wcagAaaCard = document.getElementById('wcag-aaa');
    
    wcagAaCard.className = `wcag-card ${wcagAA ? 'pass' : 'fail'}`;
    wcagAaCard.querySelector('i').className = `fas fa-${wcagAA ? 'check' : 'times'}`;
    wcagAaCard.querySelector('p').textContent = `${wcagAA ? 'Passes' : 'Fails'} (≥4.5:1)`;
    
    wcagAaaCard.className = `wcag-card ${wcagAAA ? 'pass' : 'fail'}`;
    wcagAaaCard.querySelector('i').className = `fas fa-${wcagAAA ? 'check' : 'times'}`;
    wcagAaaCard.querySelector('p').textContent = `${wcagAAA ? 'Passes' : 'Fails'} (≥7:1)`;
    
    // Update color blindness simulations
    document.getElementById('protanopia-color').textContent = colorBlindness.protanopia;
    document.getElementById('deuteranopia-color').textContent = colorBlindness.deuteranopia;
    document.getElementById('tritanopia-color').textContent = colorBlindness.tritanopia;
    
    document.getElementById('protanopia-preview').style.backgroundColor = backgroundColor;
    document.getElementById('protanopia-preview').style.color = colorBlindness.protanopia;
    
    document.getElementById('deuteranopia-preview').style.backgroundColor = backgroundColor;
    document.getElementById('deuteranopia-preview').style.color = colorBlindness.deuteranopia;
    
    document.getElementById('tritanopia-preview').style.backgroundColor = backgroundColor;
    document.getElementById('tritanopia-preview').style.color = colorBlindness.tritanopia;
    
    // Update preview
    const preview = document.getElementById('color-preview-text');
    preview.style.backgroundColor = backgroundColor;
    preview.style.color = foregroundColor;
    preview.querySelector('.sample-button').style.borderColor = foregroundColor;
    preview.querySelector('.sample-button').style.color = foregroundColor;
    
    // Update recommendations
    updateRecommendations(contrastRatio);
}

function updateRecommendations(contrastRatio) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';
    
    if (contrastRatio < 4.5) {
        container.innerHTML = `
            <div class="recommendation error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Increase contrast ratio to at least 4.5:1 for WCAG AA compliance</span>
            </div>
        `;
    } else if (contrastRatio >= 4.5 && contrastRatio < 7) {
        container.innerHTML = `
            <div class="recommendation warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Consider increasing contrast to 7:1 for WCAG AAA compliance</span>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="recommendation success">
                <i class="fas fa-check"></i>
                <span>Excellent contrast ratio! Meets all accessibility standards</span>
            </div>
        `;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.getElementById('nav-toggle').addEventListener('click', function() {
        document.getElementById('nav-menu').classList.toggle('active');
    });
    
    // Navigation links
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Color Converter Events
    document.getElementById('color-picker').addEventListener('input', function() {
        currentColor = this.value;
        document.getElementById('color-input').value = currentColor;
        updateColorFormats();
    });
    
    document.getElementById('color-input').addEventListener('input', function() {
        const value = this.value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            currentColor = value;
            document.getElementById('color-picker').value = currentColor;
            updateColorFormats();
        }
    });
    
    document.getElementById('random-color').addEventListener('click', function() {
        currentColor = generateRandomColor();
        updateColorFormats();
    });
    
    document.getElementById('export-color').addEventListener('click', function() {
        const rgb = hexToRgb(currentColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        
        const data = {
            color: currentColor,
            formats: {
                hex: currentColor,
                rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
                hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
                hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
            }
        };
        
        exportData(data, `color-${currentColor.slice(1)}.json`);
    });
    
    // Copy buttons for color formats
    document.querySelectorAll('[data-copy]').forEach(button => {
        button.addEventListener('click', function() {
            const format = this.getAttribute('data-copy');
            const value = document.getElementById(`${format}-value`).textContent;
            copyToClipboard(value);
        });
    });
    
    // Palette Generator Events
    document.getElementById('palette-color-picker').addEventListener('input', function() {
        document.getElementById('palette-color-input').value = this.value;
        updateCurrentPalette();
    });
    
    document.getElementById('palette-color-input').addEventListener('input', function() {
        const value = this.value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            document.getElementById('palette-color-picker').value = value;
            updateCurrentPalette();
        }
    });
    
    document.getElementById('palette-type').addEventListener('change', updateCurrentPalette);
    
    document.getElementById('random-base').addEventListener('click', function() {
        const randomColor = generateRandomColor();
        document.getElementById('palette-color-picker').value = randomColor;
        document.getElementById('palette-color-input').value = randomColor;
        updateCurrentPalette();
    });
    
    document.getElementById('save-palette').addEventListener('click', savePalette);
    
    document.getElementById('copy-palette').addEventListener('click', function() {
        copyToClipboard(currentPalette.join(', '));
    });
    
    // Export buttons for palette
    document.querySelectorAll('.export-btn').forEach(button => {
        button.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            if (format === 'copy') {
                copyToClipboard(currentPalette.join(', '));
            } else {
                exportData(currentPalette, `palette.${format}`, format);
            }
        });
    });
    
    // Color Checker Events
    document.getElementById('fg-color-picker').addEventListener('input', function() {
        foregroundColor = this.value;
        document.getElementById('fg-color-input').value = foregroundColor;
        updateAccessibilityAnalysis();
    });
    
    document.getElementById('fg-color-input').addEventListener('input', function() {
        const value = this.value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            foregroundColor = value;
            document.getElementById('fg-color-picker').value = foregroundColor;
            updateAccessibilityAnalysis();
        }
    });
    
    document.getElementById('bg-color-picker').addEventListener('input', function() {
        backgroundColor = this.value;
        document.getElementById('bg-color-input').value = backgroundColor;
        updateAccessibilityAnalysis();
    });
    
    document.getElementById('bg-color-input').addEventListener('input', function() {
        const value = this.value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            backgroundColor = value;
            document.getElementById('bg-color-picker').value = backgroundColor;
            updateAccessibilityAnalysis();
        }
    });
    
    // Feature cards navigation
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    // Initialize default page
    showPage('home');
    
    // Initialize color values
    updateColorFormats();
    updateCurrentPalette();
    updateAccessibilityAnalysis();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + number keys for quick navigation
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const pages = ['home', 'converter', 'palette', 'checker', 'about'];
        const pageIndex = parseInt(e.key) - 1;
        if (pages[pageIndex]) {
            showPage(pages[pageIndex]);
        }
    }
    
    // Escape key to close mobile menu
    if (e.key === 'Escape') {
        document.getElementById('nav-menu').classList.remove('active');
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        document.getElementById('nav-menu').classList.remove('active');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions for global access
window.ColorLabPro = {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    hslToHex,
    rgbToCmyk,
    rgbToHsv,
    generatePalette,
    getContrastRatio,
    simulateColorBlindness,
    generateRandomColor,
    copyToClipboard,
    exportData,
    showPage,
    updateColorFormats,
    updateCurrentPalette,
    updateAccessibilityAnalysis
};