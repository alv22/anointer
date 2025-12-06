(function() {
  if (window.__gftActive) return;
  window.__gftActive = true;

  var FONTS = [
    'Abel', 'Abril Fatface', 'Alfa Slab One', 'Anton', 'Archivo', 'Archivo Black',
    'Arimo', 'Arvo', 'Asap', 'Assistant', 'Bangers', 'Barlow', 'Barlow Condensed',
    'Bebas Neue', 'Bitter', 'Cabin', 'Cairo', 'Catamaran', 'Caveat', 'Comfortaa',
    'Cormorant Garamond', 'Crimson Text', 'Dancing Script', 'DM Sans', 'DM Serif Display',
    'Dosis', 'EB Garamond', 'Exo 2', 'Fira Sans', 'Fira Sans Condensed', 'Fjalla One',
    'Fredoka One', 'Great Vibes', 'Heebo', 'Hind', 'IBM Plex Sans', 'IBM Plex Serif',
    'Inconsolata', 'Indie Flower', 'Inter', 'Josefin Sans', 'Josefin Slab', 'Kanit',
    'Karla', 'Kaushan Script', 'Lato', 'Lexend', 'Libre Baskerville', 'Libre Franklin',
    'Lobster', 'Lora', 'Manrope', 'Merriweather', 'Merriweather Sans', 'Montserrat',
    'Mukta', 'Mulish', 'Nanum Gothic', 'Noto Sans', 'Noto Sans JP', 'Noto Serif',
    'Nunito', 'Nunito Sans', 'Old Standard TT', 'Open Sans', 'Oswald', 'Outfit',
    'Overpass', 'Pacifico', 'Permanent Marker', 'Playfair Display', 'Plus Jakarta Sans',
    'Poppins', 'Prompt', 'PT Sans', 'PT Sans Narrow', 'PT Serif', 'Public Sans',
    'Quicksand', 'Rajdhani', 'Raleway', 'Red Hat Display', 'Righteous', 'Roboto',
    'Roboto Condensed', 'Roboto Mono', 'Roboto Slab', 'Rokkitt', 'Rubik', 'Russo One',
    'Sacramento', 'Satisfy', 'Shadows Into Light', 'Signika', 'Slabo 27px', 'Source Code Pro',
    'Source Sans Pro', 'Source Serif Pro', 'Space Grotesk', 'Space Mono', 'Spectral',
    'Staatliches', 'Teko', 'Titillium Web', 'Ubuntu', 'Ubuntu Mono', 'Varela Round',
    'Work Sans', 'Yanone Kaffeesatz', 'Yellowtail', 'Zilla Slab'
  ];

  var currentSpan = null;
  var selectedFont = null;
  var filteredFonts = FONTS.slice();
  var highlightedIndex = -1;
  var currentWeight = 400;
  var currentSize = 100;
  var originalFontSize = null;

  var loadedFonts = {};

  function loadFont(fontName) {
    if (loadedFonts[fontName]) return;
    loadedFonts[fontName] = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + fontName.replace(/ /g, '+') + ':wght@100;200;300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }

  function loadAllFonts() {
    var batchSize = 20;
    for (var i = 0; i < FONTS.length; i += batchSize) {
      var batch = FONTS.slice(i, i + batchSize);
      var families = batch.map(function(f) { return 'family=' + f.replace(/ /g, '+'); }).join('&');
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?' + families + '&display=swap';
      document.head.appendChild(link);
    }
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.id = '__gft-styles';
    style.textContent = '.__gft-container{all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.4}.__gft-container *{box-sizing:border-box}.__gft-container .__gft-toggle{all:unset;width:44px;height:44px;border-radius:50%;background:#4a5568;color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:transform 0.2s,background 0.2s;font-weight:600;font-size:16px}.__gft-container .__gft-toggle:hover{background:#2d3748;transform:scale(1.05)}.__gft-container .__gft-panel{display:none;background:white;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.2);padding:12px;min-width:240px;max-width:280px;position:relative}.__gft-container .__gft-panel.open{display:block}.__gft-container .__gft-close{all:unset;position:absolute;top:8px;right:8px;cursor:pointer;padding:2px 6px;color:#a0aec0;font-size:16px;line-height:1}.__gft-container .__gft-close:hover{color:#1a202c}.__gft-container .__gft-select-wrapper{position:relative;margin-bottom:8px}.__gft-container .__gft-search{all:unset;box-sizing:border-box;width:100%;padding:8px 10px;border:2px solid #e2e8f0;border-radius:6px;font-size:13px;color:#1a202c;background:white}.__gft-container .__gft-search:focus{border-color:#4a5568;outline:none}.__gft-container .__gft-dropdown{position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:white;border:2px solid #e2e8f0;border-top:none;border-radius:0 0 6px 6px;display:none;z-index:10}.__gft-container .__gft-dropdown.open{display:block}.__gft-container .__gft-option{padding:8px 10px;cursor:pointer;color:#1a202c;transition:background 0.15s;font-size:13px}.__gft-container .__gft-option:hover{background:#f7fafc}.__gft-container .__gft-option.selected{background:#edf2f7}.__gft-container .__gft-option.highlighted{background:#e2e8f0}.__gft-container .__gft-status{font-size:11px;color:#a0aec0;margin-bottom:8px;padding:6px;background:#f7fafc;border-radius:4px;text-align:center}.__gft-container .__gft-status.has-selection{background:#c6f6d5;color:#276749}.__gft-container .__gft-slider-row{display:flex;align-items:center;gap:6px;margin-bottom:8px}.__gft-container .__gft-slider-label{font-size:10px;color:#718096;min-width:38px}.__gft-container .__gft-slider-value{font-size:10px;color:#4a5568;min-width:36px;text-align:right}.__gft-container .__gft-slider{flex:1;height:3px;-webkit-appearance:none;appearance:none;background:#e2e8f0;border-radius:2px;outline:none}.__gft-container .__gft-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:#4a5568;cursor:pointer}.__gft-container .__gft-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#4a5568;cursor:pointer;border:none}.__gft-container .__gft-buttons{display:flex;gap:6px}.__gft-container .__gft-btn{all:unset;flex:1;padding:8px 12px;border-radius:6px;text-align:center;cursor:pointer;font-weight:500;font-size:12px;transition:background 0.2s,transform 0.1s}.__gft-container .__gft-btn:active{transform:scale(0.98)}.__gft-container .__gft-btn-secondary{background:#edf2f7;color:#4a5568}.__gft-container .__gft-btn-secondary:hover{background:#e2e8f0}';
    document.head.appendChild(style);
  }

  function createUI() {
    var container = document.createElement('div');
    container.className = '__gft-container';

    var toggle = document.createElement('button');
    toggle.className = '__gft-toggle';
    toggle.title = 'Anointer';
    toggle.textContent = '☨';

    var panel = document.createElement('div');
    panel.className = '__gft-panel';

    var closeBtn = document.createElement('button');
    closeBtn.className = '__gft-close';
    closeBtn.title = 'Close';
    closeBtn.innerHTML = '&times;';

    var selectWrapper = document.createElement('div');
    selectWrapper.className = '__gft-select-wrapper';

    var search = document.createElement('input');
    search.type = 'text';
    search.className = '__gft-search';
    search.placeholder = 'Search fonts...';

    var dropdown = document.createElement('div');
    dropdown.className = '__gft-dropdown';

    selectWrapper.appendChild(search);
    selectWrapper.appendChild(dropdown);

    var status = document.createElement('div');
    status.className = '__gft-status';
    status.textContent = 'Select text on the page to style it';

    var weightRow = document.createElement('div');
    weightRow.className = '__gft-slider-row';
    var weightLabel = document.createElement('span');
    weightLabel.className = '__gft-slider-label';
    weightLabel.textContent = 'Weight';
    var weightSlider = document.createElement('input');
    weightSlider.type = 'range';
    weightSlider.className = '__gft-slider __gft-weight';
    weightSlider.min = '100';
    weightSlider.max = '900';
    weightSlider.step = '100';
    weightSlider.value = '400';
    var weightValue = document.createElement('span');
    weightValue.className = '__gft-slider-value __gft-weight-value';
    weightValue.textContent = '400';
    weightRow.appendChild(weightLabel);
    weightRow.appendChild(weightSlider);
    weightRow.appendChild(weightValue);

    var sizeRow = document.createElement('div');
    sizeRow.className = '__gft-slider-row';
    var sizeLabel = document.createElement('span');
    sizeLabel.className = '__gft-slider-label';
    sizeLabel.textContent = 'Size';
    var sizeSlider = document.createElement('input');
    sizeSlider.type = 'range';
    sizeSlider.className = '__gft-slider __gft-size';
    sizeSlider.min = '20';
    sizeSlider.max = '400';
    sizeSlider.step = '10';
    sizeSlider.value = '100';
    var sizeValue = document.createElement('span');
    sizeValue.className = '__gft-slider-value __gft-size-value';
    sizeValue.textContent = '100%';
    sizeRow.appendChild(sizeLabel);
    sizeRow.appendChild(sizeSlider);
    sizeRow.appendChild(sizeValue);

    var buttons = document.createElement('div');
    buttons.className = '__gft-buttons';

    var resetBtn = document.createElement('button');
    resetBtn.className = '__gft-btn __gft-btn-secondary __gft-reset';
    resetBtn.textContent = 'Reset';
    buttons.appendChild(resetBtn);

    panel.appendChild(closeBtn);
    panel.appendChild(selectWrapper);
    panel.appendChild(status);
    panel.appendChild(weightRow);
    panel.appendChild(sizeRow);
    panel.appendChild(buttons);

    container.appendChild(toggle);
    container.appendChild(panel);
    document.body.appendChild(container);

    return container;
  }

  function populateDropdown(dropdown, filter) {
    filter = filter || '';
    var filterLower = filter.toLowerCase();
    filteredFonts = FONTS.filter(function(f) { return f.toLowerCase().indexOf(filterLower) >= 0; });
    highlightedIndex = -1;

    dropdown.innerHTML = '';
    for (var i = 0; i < filteredFonts.length; i++) {
      var font = filteredFonts[i];
      var option = document.createElement('div');
      option.className = '__gft-option';
      option.setAttribute('data-font', font);
      option.setAttribute('data-index', i);
      option.textContent = font;
      if (font === selectedFont) {
        option.classList.add('selected');
      }
      option.addEventListener('mouseenter', function() {
        var f = this.getAttribute('data-font');
        loadFont(f);
        this.style.fontFamily = f + ', sans-serif';
      });
      dropdown.appendChild(option);
    }
  }

  function highlightOption(dropdown, index) {
    var options = dropdown.querySelectorAll('.__gft-option');
    for (var i = 0; i < options.length; i++) {
      if (i === index) {
        options[i].classList.add('highlighted');
        options[i].scrollIntoView({ block: 'nearest' });
      } else {
        options[i].classList.remove('highlighted');
      }
    }
  }

  function detectFont(element) {
    var computed = window.getComputedStyle(element);
    var fontFamily = computed.fontFamily;
    var fonts = fontFamily.split(',');
    for (var i = 0; i < fonts.length; i++) {
      var font = fonts[i].trim().replace(/['"]/g, '');
      for (var j = 0; j < FONTS.length; j++) {
        if (FONTS[j].toLowerCase() === font.toLowerCase()) {
          return FONTS[j];
        }
      }
    }
    return null;
  }

  function captureSelection(container, status, searchInput, dropdown) {
    var selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return false;
    }

    var range = selection.getRangeAt(0);

    if (container.contains(range.commonAncestorContainer)) {
      return false;
    }

    try {
      var startNode = range.startContainer;
      var element = startNode.nodeType === 3 ? startNode.parentNode : startNode;
      var computed = window.getComputedStyle(element);
      originalFontSize = parseFloat(computed.fontSize);

      var detectedFont = detectFont(element);
      if (detectedFont && !selectedFont) {
        selectedFont = detectedFont;
        searchInput.value = detectedFont;
        searchInput.style.fontFamily = detectedFont + ', sans-serif';
        populateDropdown(dropdown);
      }

      if (currentSpan && currentSpan.parentNode) {
        var oldParent = currentSpan.parentNode;
        while (currentSpan.firstChild) {
          oldParent.insertBefore(currentSpan.firstChild, currentSpan);
        }
        oldParent.removeChild(currentSpan);
      }

      currentSpan = document.createElement('span');
      currentSpan.className = '__gft-styled';

      var contents = range.extractContents();
      currentSpan.appendChild(contents);
      range.insertNode(currentSpan);

      if (selectedFont) {
        currentSpan.style.setProperty('font-family', selectedFont + ', sans-serif', 'important');
      }
      currentSpan.style.setProperty('font-weight', currentWeight, 'important');
      var newSize = originalFontSize * (currentSize / 100);
      currentSpan.style.setProperty('font-size', newSize + 'px', 'important');

      var preview = currentSpan.textContent.substring(0, 20);
      if (currentSpan.textContent.length > 20) preview += '...';
      status.textContent = 'Styling: "' + preview + '"';
      status.classList.add('has-selection');

      selection.removeAllRanges();

      return true;
    } catch (e) {
      return false;
    }
  }

  function applyFont(font) {
    selectedFont = font;
    loadFont(font);
    if (currentSpan) {
      currentSpan.style.setProperty('font-family', font + ', sans-serif', 'important');
    }
  }

  function applyWeight(weight) {
    currentWeight = weight;
    if (currentSpan) {
      currentSpan.style.setProperty('font-weight', weight, 'important');
    }
  }

  function applySize(size) {
    currentSize = size;
    if (currentSpan && originalFontSize) {
      var newSize = originalFontSize * (size / 100);
      currentSpan.style.setProperty('font-size', newSize + 'px', 'important');
    }
  }

  function reset(status, searchInput) {
    if (currentSpan && currentSpan.parentNode) {
      var parent = currentSpan.parentNode;
      while (currentSpan.firstChild) {
        parent.insertBefore(currentSpan.firstChild, currentSpan);
      }
      parent.removeChild(currentSpan);
    }
    currentSpan = null;
    originalFontSize = null;
    selectedFont = null;
    status.textContent = 'Select text on the page to style it';
    status.classList.remove('has-selection');
    searchInput.value = '';
    searchInput.style.fontFamily = '';
  }

  function init() {
    injectStyles();
    var container = createUI();

    var toggle = container.querySelector('.__gft-toggle');
    var panel = container.querySelector('.__gft-panel');
    var closeBtn = container.querySelector('.__gft-close');
    var searchInput = container.querySelector('.__gft-search');
    var dropdown = container.querySelector('.__gft-dropdown');
    var status = container.querySelector('.__gft-status');
    var resetBtn = container.querySelector('.__gft-reset');
    var weightSlider = container.querySelector('.__gft-weight');
    var weightValueEl = container.querySelector('.__gft-weight-value');
    var sizeSlider = container.querySelector('.__gft-size');
    var sizeValueEl = container.querySelector('.__gft-size-value');

    populateDropdown(dropdown);

    toggle.addEventListener('click', function() {
      var isOpen = panel.classList.toggle('open');
      toggle.style.display = isOpen ? 'none' : 'flex';
    });

    closeBtn.addEventListener('click', function() {
      panel.classList.remove('open');
      toggle.style.display = 'flex';
    });

    document.addEventListener('mouseup', function(e) {
      if (container.contains(e.target)) return;
      setTimeout(function() {
        captureSelection(container, status, searchInput, dropdown);
      }, 10);
    });

    searchInput.addEventListener('focus', function() {
      dropdown.classList.add('open');
    });

    searchInput.addEventListener('input', function(e) {
      populateDropdown(dropdown, e.target.value);
      dropdown.classList.add('open');
    });

    searchInput.addEventListener('keydown', function(e) {
      if (!dropdown.classList.contains('open')) {
        dropdown.classList.add('open');
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, filteredFonts.length - 1);
        highlightOption(dropdown, highlightedIndex);
        if (filteredFonts[highlightedIndex]) {
          applyFont(filteredFonts[highlightedIndex]);
          searchInput.value = filteredFonts[highlightedIndex];
          searchInput.style.fontFamily = filteredFonts[highlightedIndex] + ', sans-serif';
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        highlightOption(dropdown, highlightedIndex);
        if (filteredFonts[highlightedIndex]) {
          applyFont(filteredFonts[highlightedIndex]);
          searchInput.value = filteredFonts[highlightedIndex];
          searchInput.style.fontFamily = filteredFonts[highlightedIndex] + ', sans-serif';
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        dropdown.classList.remove('open');
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('open');
      }
    });

    document.addEventListener('click', function(e) {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('open');
      } else if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });

    dropdown.addEventListener('click', function(e) {
      var option = e.target.closest('.__gft-option');
      if (option) {
        var font = option.getAttribute('data-font');
        applyFont(font);
        searchInput.value = font;
        searchInput.style.fontFamily = font + ', sans-serif';
        dropdown.classList.remove('open');

        var allOptions = dropdown.querySelectorAll('.__gft-option');
        for (var i = 0; i < allOptions.length; i++) {
          if (allOptions[i].getAttribute('data-font') === font) {
            allOptions[i].classList.add('selected');
          } else {
            allOptions[i].classList.remove('selected');
          }
        }
      }
    });

    resetBtn.addEventListener('click', function() {
      reset(status, searchInput);
      currentWeight = 400;
      currentSize = 100;
      weightSlider.value = '400';
      weightValueEl.textContent = '400';
      sizeSlider.value = '100';
      sizeValueEl.textContent = '100%';
      populateDropdown(dropdown);
    });

    weightSlider.addEventListener('input', function(e) {
      var weight = e.target.value;
      weightValueEl.textContent = weight;
      applyWeight(weight);
    });

    sizeSlider.addEventListener('input', function(e) {
      var size = e.target.value;
      sizeValueEl.textContent = size + '%';
      applySize(size);
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        toggle.style.display = 'flex';
      }
    });
  }

  init();
})();
