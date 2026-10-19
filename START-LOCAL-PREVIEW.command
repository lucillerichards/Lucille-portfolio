#!/bin/bash
# Launch the portfolio as a local HTTP site so YouTube receives a Referer.
cd "$(dirname "$0")" || exit 1
if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is needed to run this preview. Install it or publish to your web host."
  read -r -p "Press Enter to close..."
  exit 1
fi
PORT="$(python3 -c 'import socket;s=socket.socket();s.bind(("127.0.0.1",0));print(s.getsockname()[1]);s.close()')"
echo "Portfolio preview: http://localhost:$PORT/"
echo "Keep this window open while previewing the site. Press Ctrl+C to stop."
(sleep 1; open "http://localhost:$PORT/") &
python3 -m http.server "$PORT" --bind 127.0.0.1
