"""Static server that refuses to be cached, and takes screenshots by POST.

Two problems this solves, both recorded in the project's notes:

  1. http.server sends no Cache-Control at all, so the browser applies
     heuristic caching and goes on running an app.js from ten minutes ago —
     which looks exactly like a code change that did not work.

  2. The Browser pane runs hidden. requestAnimationFrame is then paused, so
     the app's whole frame loop stops, and computer{screenshot} keeps handing
     back a stale composited frame long after the DOM has moved on. The fix is
     to drive the render synchronously from the page, read the canvas back in
     that same task (the drawing buffer is cleared after it), and POST the PNG
     here to be looked at as a file.

POST /shot/<name>  with a data: URL as the body -> scratchpad/shot-<name>.png
"""
import base64
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

OUT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_POST(self):
        if not self.path.startswith('/shot/'):
            self.send_error(404)
            return
        name = ''.join(c for c in self.path[6:] if c.isalnum() or c in '-_')[:60] or 'x'
        n = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(n).decode('utf8', 'replace')
        if ',' in body:
            body = body.split(',', 1)[1]
        path = os.path.join(OUT, 'shot-%s.png' % name)
        with open(path, 'wb') as fh:
            fh.write(base64.b64decode(body))
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(path.encode())

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


if __name__ == '__main__':
    port = int(sys.argv[1])
    root = sys.argv[2]
    ThreadingHTTPServer(('127.0.0.1', port),
                        lambda *a, **k: Handler(*a, directory=root, **k)).serve_forever()
