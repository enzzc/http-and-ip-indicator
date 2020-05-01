Firefox WebExtension to add an HTTP/2, HTTP/3, and IP version indicator in the address bar.


This is a partially re-written version of http2-indicator by Brandon Siegel found here: https://github.com/bsiegel/http2-indicator  

This extension supports HTTP/3 and IP versions, and use another method to detect protocols in use.  
The original http2-indicator scans specific headers. In this version, the detection happens in the same moment (`onHeadersReceived`),
but we use the `statusLine` instead.


Address bar icon by http://fontawesome.io/ - [SIL OFL 1.1](http://scripts.sil.org/OFL) license.

## License

Copyright &copy; 2020 Enzo Calamia

Licensed under the [WTFPL version 2](http://www.wtfpl.net/txt/copying/).
