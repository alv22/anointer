import './styles/main.css'
import { minify } from 'terser'

// Fetch bookmarklet and create encoded URL for the bookmarklet link
// In dev mode, source is at /src/bookmarklet.js; in production, built file is at /bookmarklet.js
const bookmarkletUrl = import.meta.env.DEV ? '/src/bookmarklet.js' : '/bookmarklet.js'

fetch(bookmarkletUrl)
  .then(res => res.text())
  .then(code => minify(code, { compress: true, mangle: true }))
  .then(result => {
    const bookmarkletLink = document.getElementById('bookmarklet')
    if (bookmarkletLink && result.code) {
      bookmarkletLink.href = 'javascript:' + encodeURIComponent(result.code)
    }
  })
