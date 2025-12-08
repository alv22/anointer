/**
 * Anointer Bookmarklet
 * A typography tool for blessing any website with beautiful fonts.
 *
 * This bookmarklet creates a floating UI that allows users to:
 * - Select text on any webpage
 * - Apply custom Google Fonts to the selection
 * - Adjust font weight (100-900)
 * - Adjust font size (20%-400%)
 * - Reset styling back to original
 */
(function() {
  // Prevent multiple instances
  if (window.__gftActive) return;
  window.__gftActive = true;

  // Available Google Fonts library
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

  // State management
  var currentSpans = [];         // Currently styled text spans (array for multi-node selections)
  var selectedFont = null;       // Currently selected font name
  var filteredFonts = FONTS.slice();  // Filtered font list for search
  var highlightedIndex = -1;     // Keyboard navigation index
  var currentWeight = 400;       // Current font weight
  var currentSize = 100;         // Current font size percentage
  var originalFontSize = null;   // Original font size of selected text

  // Track which fonts have been loaded
  var loadedFonts = {};

  // Font loading state
  var fontLoadingTimeout = null;  // For debouncing arrow key navigation
  var pendingFont = null;         // Track pending font during rapid navigation
  var preloadQueue = [];          // Queue of fonts to preload
  var isPreloading = false;       // Whether preloading is in progress

  /**
   * Load a single font from Google Fonts
   * @param {string} fontName - Name of the font to load
   */
  function loadFont(fontName) {
    if (loadedFonts[fontName]) return;
    loadedFonts[fontName] = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + fontName.replace(/ /g, '+') + ':wght@100;200;300;400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }

  /**
   * Load a font and return a Promise that resolves when the font is ready
   * @param {string} fontName - Name of the font to load
   * @returns {Promise} Resolves when font is loaded and ready
   */
  function loadFontAsync(fontName) {
    return new Promise(function(resolve) {
      // Fallback for browsers without Font Loading API
      if (!document.fonts || !document.fonts.load) {
        loadFont(fontName);
        setTimeout(resolve, 100);
        return;
      }

      // If already loaded and ready, resolve immediately
      if (loadedFonts[fontName] && document.fonts.check('16px "' + fontName + '"')) {
        resolve();
        return;
      }

      // Load the stylesheet if not already loading
      if (!loadedFonts[fontName]) {
        loadFont(fontName);
      }

      // Wait for the font to be ready using Font Loading API
      document.fonts.load('16px "' + fontName + '"').then(function() {
        resolve();
      }).catch(function() {
        // Resolve anyway after failure to prevent blocking
        resolve();
      });
    });
  }

  /**
   * Preload fonts in the background without blocking UI
   */
  function preloadFontsInBackground() {
    if (isPreloading || preloadQueue.length === 0) return;
    isPreloading = true;

    var font = preloadQueue.shift();
    loadFont(font);  // Just trigger the stylesheet load, don't wait

    // Schedule next font after small delay to avoid overwhelming
    setTimeout(function() {
      isPreloading = false;
      preloadFontsInBackground();
    }, 50);
  }

  /**
   * Inject the toolbar styles into the page
   * Uses namespaced classes to avoid conflicts with page styles
   */
  function injectStyles() {
    var style = document.createElement('style');
    style.id = '__gft-styles';
    style.textContent = '.__gft-container{all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.4}.__gft-container *{box-sizing:border-box}.__gft-container .__gft-toggle{all:unset;width:44px;height:44px;border-radius:50%;background:#4a5568;color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:transform 0.2s,background 0.2s;font-weight:600;font-size:16px}.__gft-container .__gft-toggle:hover{background:#2d3748;transform:scale(1.05)}.__gft-container .__gft-panel{display:none;background:white;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.2);padding:12px;min-width:240px;max-width:280px;position:relative}.__gft-container .__gft-panel.open{display:block}.__gft-container .__gft-close{all:unset;position:absolute;top:8px;right:8px;cursor:pointer;padding:2px 6px;color:#718096;font-size:16px;line-height:1;z-index:20;transition:color 0.15s}.__gft-container .__gft-close:hover{color:#1a202c}.__gft-container .__gft-select-wrapper{position:relative;margin-bottom:8px}.__gft-container .__gft-search{all:unset;box-sizing:border-box;width:100%;padding:8px 10px;border:2px solid #e2e8f0;border-radius:6px;font-size:13px;color:#1a202c;background:white}.__gft-container .__gft-search:focus{border-color:#4a5568;outline:none}.__gft-container .__gft-dropdown{position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:white;border:2px solid #e2e8f0;border-top:none;border-radius:0 0 6px 6px;display:none;z-index:10}.__gft-container .__gft-dropdown.open{display:block}.__gft-container .__gft-option{padding:8px 10px;cursor:pointer;color:#1a202c;transition:background 0.15s;font-size:13px}.__gft-container .__gft-option:hover{background:#f7fafc}.__gft-container .__gft-option.selected{background:#edf2f7}.__gft-container .__gft-option.highlighted{background:#e2e8f0}.__gft-container .__gft-status{font-size:11px;color:#a0aec0;margin-bottom:8px;padding:6px;background:#f7fafc;border-radius:4px;text-align:center}.__gft-container .__gft-status.has-selection{background:#c6f6d5;color:#276749}.__gft-container .__gft-slider-row{display:flex;align-items:center;gap:6px;margin-bottom:8px}.__gft-container .__gft-slider-label{font-size:10px;color:#718096;min-width:38px}.__gft-container .__gft-slider-value{font-size:10px;color:#4a5568;min-width:36px;text-align:right}.__gft-container .__gft-slider{flex:1;height:3px;-webkit-appearance:none;appearance:none;background:#e2e8f0;border-radius:2px;outline:none}.__gft-container .__gft-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:12px;height:12px;border-radius:50%;background:#4a5568;cursor:pointer}.__gft-container .__gft-slider::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#4a5568;cursor:pointer;border:none}.__gft-container .__gft-buttons{display:flex;gap:6px}.__gft-container .__gft-btn{all:unset;flex:1;padding:8px 12px;border-radius:6px;text-align:center;cursor:pointer;font-weight:500;font-size:12px;transition:background 0.2s,transform 0.1s}.__gft-container .__gft-btn:active{transform:scale(0.98)}.__gft-container .__gft-btn-secondary{background:#edf2f7;color:#4a5568}.__gft-container .__gft-btn-secondary:hover{background:#e2e8f0}.__gft-styled{display:inline}.__gft-styled.__gft-flash{animation:__gft-flash 0.4s ease-out}@keyframes __gft-flash{0%{background-color:rgba(74,85,104,0.25)}100%{background-color:transparent}}';
    document.head.appendChild(style);
  }

  /**
   * Create the floating toolbar UI
   * @returns {HTMLElement} The container element
   */
  function createUI() {
    var container = document.createElement('div');
    container.className = '__gft-container';

    // Toggle button (circular with cross icon)
    var toggle = document.createElement('button');
    toggle.className = '__gft-toggle';
    toggle.title = 'Anointer';
    toggle.textContent = '☨';

    // Main panel
    var panel = document.createElement('div');
    panel.className = '__gft-panel';

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = '__gft-close';
    closeBtn.title = 'Close';
    closeBtn.innerHTML = '&times;';

    // Font search wrapper
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

    // Status indicator
    var status = document.createElement('div');
    status.className = '__gft-status';
    status.textContent = 'Select text on the page to style it';

    // Weight slider row
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

    // Size slider row
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

    // Action buttons
    var buttons = document.createElement('div');
    buttons.className = '__gft-buttons';

    var resetBtn = document.createElement('button');
    resetBtn.className = '__gft-btn __gft-btn-secondary __gft-reset';
    resetBtn.textContent = 'Reset';
    buttons.appendChild(resetBtn);

    // Assemble panel
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

  /**
   * Populate the font dropdown with filtered options
   * @param {HTMLElement} dropdown - The dropdown element
   * @param {string} filter - Optional search filter
   */
  function populateDropdown(dropdown, filter) {
    filter = filter || '';
    var filterLower = filter.toLowerCase();
    filteredFonts = FONTS.filter(function(f) { return f.toLowerCase().indexOf(filterLower) >= 0; });
    highlightedIndex = -1;

    // Clear preload queue when repopulating
    preloadQueue = [];

    dropdown.innerHTML = '';
    for (var i = 0; i < filteredFonts.length; i++) {
      var font = filteredFonts[i];
      var option = document.createElement('div');
      option.className = '__gft-option';
      option.setAttribute('data-font', font);
      option.setAttribute('data-index', i);
      option.textContent = font;

      // Apply font-family immediately (will show when loaded)
      option.style.fontFamily = '"' + font + '", sans-serif';

      if (font === selectedFont) {
        option.classList.add('selected');
      }
      dropdown.appendChild(option);

      // Queue first 15 visible fonts for immediate preload
      if (i < 15 && !loadedFonts[font]) {
        preloadQueue.push(font);
      }
    }

    // Start background preloading
    preloadFontsInBackground();
  }

  /**
   * Highlight an option in the dropdown for keyboard navigation
   * @param {HTMLElement} dropdown - The dropdown element
   * @param {number} index - Index to highlight
   */
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

  /**
   * Detect the current font of an element
   * @param {HTMLElement} element - Element to check
   * @returns {string|null} Font name if found in our library
   */
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

  /**
   * Wrap text nodes within a range with styled spans
   * Handles cross-element selections by wrapping each text node separately
   * @param {Range} range - The selection range
   * @returns {Array} Array of created span elements
   */
  function wrapTextNodes(range) {
    var spans = [];

    // Get all text nodes within the range using TreeWalker
    var walker = document.createTreeWalker(
      range.commonAncestorContainer.nodeType === 3
        ? range.commonAncestorContainer.parentNode
        : range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      null
    );

    // Collect text nodes that intersect with the range
    var textNodes = [];
    var node;
    while (node = walker.nextNode()) {
      var nodeRange = document.createRange();
      nodeRange.selectNodeContents(node);

      // Check if node intersects with selection range
      var startsBeforeEnd = range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0;
      var endsAfterStart = range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0;

      if (startsBeforeEnd && endsAfterStart && node.textContent.trim()) {
        textNodes.push(node);
      }
    }

    // Process each text node (in reverse to maintain positions)
    for (var i = textNodes.length - 1; i >= 0; i--) {
      var textNode = textNodes[i];
      var span = document.createElement('span');
      span.className = '__gft-styled';

      // Determine offsets for first/last nodes
      var startOffset = 0;
      var endOffset = textNode.length;

      if (textNode === range.startContainer) {
        startOffset = range.startOffset;
      }
      if (textNode === range.endContainer) {
        endOffset = range.endOffset;
      }

      // Handle partial text nodes
      if (endOffset < textNode.length) {
        textNode.splitText(endOffset);
      }
      if (startOffset > 0) {
        textNode = textNode.splitText(startOffset);
      }

      // Wrap the text node
      textNode.parentNode.insertBefore(span, textNode);
      span.appendChild(textNode);
      spans.unshift(span);  // Add to front to maintain order
    }

    return spans;
  }

  /**
   * Remove all current styled spans, restoring original text
   */
  function removeCurrentSpans() {
    for (var i = 0; i < currentSpans.length; i++) {
      var span = currentSpans[i];
      if (span && span.parentNode) {
        var parent = span.parentNode;
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        // Normalize to merge adjacent text nodes
        parent.normalize();
      }
    }
    currentSpans = [];
  }

  /**
   * Apply current styles to all styled spans
   */
  function applyStylesToSpans() {
    for (var i = 0; i < currentSpans.length; i++) {
      var span = currentSpans[i];
      if (selectedFont) {
        span.style.setProperty('font-family', selectedFont + ', sans-serif', 'important');
      }
      span.style.setProperty('font-weight', currentWeight, 'important');
      if (originalFontSize) {
        var newSize = originalFontSize * (currentSize / 100);
        span.style.setProperty('font-size', newSize + 'px', 'important');
      }
    }
  }

  /**
   * Trigger a flash animation on styled spans for visual feedback
   */
  function flashStyledSpans() {
    for (var i = 0; i < currentSpans.length; i++) {
      var span = currentSpans[i];
      span.classList.add('__gft-flash');
    }
  }

  /**
   * Capture the current text selection and wrap it in a styled span
   * @param {HTMLElement} container - The toolbar container (to exclude from selection)
   * @param {HTMLElement} status - Status display element
   * @param {HTMLElement} searchInput - Search input element
   * @param {HTMLElement} dropdown - Font dropdown element
   * @returns {boolean} Whether a selection was captured
   */
  function captureSelection(container, status, searchInput, dropdown) {
    var selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return false;
    }

    var range = selection.getRangeAt(0);

    // Don't capture selections inside the toolbar
    if (container.contains(range.commonAncestorContainer)) {
      return false;
    }

    try {
      // Get original font size for percentage calculations
      var startNode = range.startContainer;
      var element = startNode.nodeType === 3 ? startNode.parentNode : startNode;
      var computed = window.getComputedStyle(element);
      originalFontSize = parseFloat(computed.fontSize);

      // Try to detect existing font
      var detectedFont = detectFont(element);
      if (detectedFont && !selectedFont) {
        selectedFont = detectedFont;
        searchInput.value = detectedFont;
        searchInput.style.fontFamily = detectedFont + ', sans-serif';
        populateDropdown(dropdown);
      }

      // Remove previous styled spans
      removeCurrentSpans();

      // Check if this is a simple single-node selection
      var isSimple = range.startContainer === range.endContainer &&
                     range.startContainer.nodeType === 3;

      if (isSimple) {
        // Simple case: single text node, use efficient approach
        var span = document.createElement('span');
        span.className = '__gft-styled';
        var contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        currentSpans = [span];
      } else {
        // Complex case: multiple nodes, wrap each text node separately
        currentSpans = wrapTextNodes(range);
      }

      // Apply current styles to all spans
      applyStylesToSpans();

      // Update status with preview of selected text
      var allText = currentSpans.map(function(s) { return s.textContent; }).join('');
      var preview = allText.substring(0, 20);
      if (allText.length > 20) preview += '...';
      status.textContent = 'Styling: "' + preview + '"';
      status.classList.add('has-selection');

      selection.removeAllRanges();

      // Flash animation for visual feedback
      flashStyledSpans();

      return true;
    } catch (e) {
      console.error('Anointer: Selection error', e);
      return false;
    }
  }

  /**
   * Apply a font to the current selection (waits for font to load first)
   * @param {string} font - Font name to apply
   * @param {function} callback - Optional callback when font is applied
   */
  function applyFont(font, callback) {
    selectedFont = font;
    loadFontAsync(font).then(function() {
      applyStylesToSpans();
      if (callback) callback();
    });
  }

  /**
   * Apply a font weight to the current selection
   * @param {number} weight - Font weight (100-900)
   */
  function applyWeight(weight) {
    currentWeight = weight;
    for (var i = 0; i < currentSpans.length; i++) {
      currentSpans[i].style.setProperty('font-weight', weight, 'important');
    }
  }

  /**
   * Apply a font size to the current selection
   * @param {number} size - Size as percentage (20-400)
   */
  function applySize(size) {
    currentSize = size;
    if (originalFontSize) {
      var newSize = originalFontSize * (size / 100);
      for (var i = 0; i < currentSpans.length; i++) {
        currentSpans[i].style.setProperty('font-size', newSize + 'px', 'important');
      }
    }
  }

  /**
   * Reset the current selection to its original state
   * @param {HTMLElement} status - Status display element
   * @param {HTMLElement} searchInput - Search input element
   */
  function reset(status, searchInput) {
    removeCurrentSpans();
    originalFontSize = null;
    selectedFont = null;
    status.textContent = 'Select text on the page to style it';
    status.classList.remove('has-selection');
    searchInput.value = '';
    searchInput.style.fontFamily = '';
  }

  /**
   * Initialize the bookmarklet
   */
  function init() {
    injectStyles();
    var container = createUI();

    // Get UI element references
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

    // Toggle panel visibility
    toggle.addEventListener('click', function() {
      var isOpen = panel.classList.toggle('open');
      toggle.style.display = isOpen ? 'none' : 'flex';
    });

    // Close panel
    closeBtn.addEventListener('click', function() {
      panel.classList.remove('open');
      toggle.style.display = 'flex';
    });

    // Capture text selection on mouseup
    document.addEventListener('mouseup', function(e) {
      if (container.contains(e.target)) return;
      setTimeout(function() {
        captureSelection(container, status, searchInput, dropdown);
      }, 10);
    });

    // Font search functionality
    searchInput.addEventListener('focus', function() {
      dropdown.classList.add('open');
    });

    searchInput.addEventListener('input', function(e) {
      populateDropdown(dropdown, e.target.value);
      dropdown.classList.add('open');
    });

    // Keyboard navigation for font dropdown
    searchInput.addEventListener('keydown', function(e) {
      if (!dropdown.classList.contains('open')) {
        dropdown.classList.add('open');
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = Math.min(highlightedIndex + 1, filteredFonts.length - 1);
        highlightOption(dropdown, highlightedIndex);
        if (filteredFonts[highlightedIndex]) {
          var font = filteredFonts[highlightedIndex];
          pendingFont = font;
          searchInput.value = font;

          // Clear previous pending load
          if (fontLoadingTimeout) clearTimeout(fontLoadingTimeout);

          // Debounce: wait 100ms before applying to allow rapid navigation
          fontLoadingTimeout = setTimeout(function() {
            if (pendingFont === font) {
              applyFont(font, function() {
                searchInput.style.fontFamily = font + ', sans-serif';
              });
            }
          }, 100);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = Math.max(highlightedIndex - 1, 0);
        highlightOption(dropdown, highlightedIndex);
        if (filteredFonts[highlightedIndex]) {
          var font = filteredFonts[highlightedIndex];
          pendingFont = font;
          searchInput.value = font;

          // Clear previous pending load
          if (fontLoadingTimeout) clearTimeout(fontLoadingTimeout);

          // Debounce: wait 100ms before applying to allow rapid navigation
          fontLoadingTimeout = setTimeout(function() {
            if (pendingFont === font) {
              applyFont(font, function() {
                searchInput.style.fontFamily = font + ', sans-serif';
              });
            }
          }, 100);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        dropdown.classList.remove('open');
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('open');
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('open');
      } else if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });

    // Preload more fonts as user scrolls through dropdown
    dropdown.addEventListener('scroll', function() {
      var options = dropdown.querySelectorAll('.__gft-option');
      var scrollTop = dropdown.scrollTop;
      var height = dropdown.clientHeight;

      // Find visible range and queue fonts for preload
      for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        if (opt.offsetTop >= scrollTop - 50 && opt.offsetTop <= scrollTop + height + 50) {
          var font = opt.getAttribute('data-font');
          if (!loadedFonts[font] && preloadQueue.indexOf(font) === -1) {
            preloadQueue.push(font);
          }
        }
      }
      preloadFontsInBackground();
    });

    // Handle font selection from dropdown
    dropdown.addEventListener('click', function(e) {
      var option = e.target.closest('.__gft-option');
      if (option) {
        var font = option.getAttribute('data-font');
        applyFont(font);
        searchInput.value = font;
        searchInput.style.fontFamily = font + ', sans-serif';
        dropdown.classList.remove('open');

        // Update selected state
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

    // Reset button
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

    // Weight slider
    weightSlider.addEventListener('input', function(e) {
      var weight = e.target.value;
      weightValueEl.textContent = weight;
      applyWeight(weight);
    });

    // Size slider
    sizeSlider.addEventListener('input', function(e) {
      var size = e.target.value;
      sizeValueEl.textContent = size + '%';
      applySize(size);
    });

    // Close panel on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        panel.classList.remove('open');
        toggle.style.display = 'flex';
      }
    });
  }

  init();
})();
