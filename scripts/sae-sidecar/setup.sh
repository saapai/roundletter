#!/bin/bash
# Setup the SAE sidecar environment
# Requires: Python 3.11+, ~25GB disk for model weights

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv-sae"

echo "=== SAE Sidecar Setup ==="

# Create venv
if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r "$SCRIPT_DIR/requirements.txt"

echo ""
echo "=== Setup complete ==="
echo "To start the sidecar: cd $SCRIPT_DIR && source .venv-sae/bin/activate && python server.py"
echo "To compute steering vectors: python compute_steering.py"
