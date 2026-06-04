#!/usr/bin/env bash
set -euo pipefail

echo "[QNWRK] Installing VM dependencies for Docker and Gradio projects..."

sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  git \
  python3 \
  python3-pip \
  python3-venv

if ! command -v docker >/dev/null 2>&1; then
  echo "[QNWRK] Installing Docker Engine..."
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
  echo "[QNWRK] Docker already installed."
fi

sudo usermod -aG docker "$USER" || true

mkdir -p "$HOME/.qnwrk"
python3 -m venv "$HOME/.qnwrk/gradio-venv"
"$HOME/.qnwrk/gradio-venv/bin/python" -m pip install --upgrade pip wheel
"$HOME/.qnwrk/gradio-venv/bin/pip" install gradio fastapi uvicorn

echo "[QNWRK] Done."
echo "[QNWRK] Docker version: $(docker --version || true)"
echo "[QNWRK] Gradio Python: $HOME/.qnwrk/gradio-venv/bin/python"
echo "[QNWRK] IMPORTANT: log out and back in, or run: newgrp docker"
