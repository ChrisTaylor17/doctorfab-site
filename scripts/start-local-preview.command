#!/bin/zsh
set -e

cd "$(dirname "$0")/.."

echo "Starting Doctor Fab local preview..."
echo "Open http://127.0.0.1:8765/index.html in your browser."
echo "Press Control-C in this window to stop the preview server."
echo

python3 -m http.server 8765 --bind 127.0.0.1
