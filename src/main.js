import './styles/main.css'

// Fetch bookmarklet and create encoded URL for the bookmarklet link
// In dev mode, source is at /src/bookmarklet.js; in production, built file is at /bookmarklet.js
const bookmarkletUrl = import.meta.env.DEV ? '/src/bookmarklet.js' : '/bookmarklet.js'

fetch(bookmarkletUrl)
  .then(res => res.text())
  .then(code => {
    const bookmarkletLink = document.getElementById('bookmarklet')
    if (bookmarkletLink) {
      bookmarkletLink.href = 'javascript:' + encodeURIComponent(code)
    }
  })
