#!/usr/bin/env python3
"""Serve JobsDoor360 locally without browser caching.

Run from the project root:
    python3 serve-local.py

The server listens on http://localhost:8080/ and adds no-store headers,
so Safari/Chrome always receive the current HTML, CSS and JavaScript.
"""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 8080


class NoCacheStaticHandler(SimpleHTTPRequestHandler):
    """Static file handler that avoids stale local-browser previews."""

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    handler = partial(NoCacheStaticHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("", PORT), handler)
    print(f"Serving {ROOT} at http://localhost:{PORT}/ (no-cache)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
