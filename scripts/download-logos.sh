#!/usr/bin/env bash
set -euo pipefail
mkdir -p assets/logo
cd assets/logo

# list of files: format "<filename>|<drive-id>"
FILES=(
  "2_1_1Xshz6zgsx06jY5cRAononqKyWd7XFmhb|1Xshz6zgsx06jY5cRAononqKyWd7XFmhb"
  "2_2_1iZVRIQUJnGZHn90UDN8Lgqbph41v6Wak|1iZVRIQUJnGZHn90UDN8Lgqbph41v6Wak"
  "2_3_1Twe3-Fu1XnUZPmHiP7COJxX3cSjoK-Bm|1Twe3-Fu1XnUZPmHiP7COJxX3cSjoK-Bm"
)

# helper to detect extension from content-type or Content-Disposition
detect_ext() {
  local url="$1"
  # try to get headers
  local ctype
  ctype=$(curl -sI "$url" | tr -d '\r' | awk -F': ' '/Content-Type/ {print $2}' | awk '{print $1}' || true)
  case "$ctype" in
    image/png) echo "png"; return;;
    image/jpeg) echo "jpg"; return;;
    image/svg+xml) echo "svg"; return;;
  esac
  # fallback
  echo "png"
}

for entry in "${FILES[@]}"; do
  IFS='|' read -r fname id <<< "$entry"
  # avoid re-download if already exists
  if [ -f "$fname" ]; then
    echo "Skipping (exists): $fname"
    continue
  fi

  # try direct download (may fail for large files with Drive warnings)
  url_direct="https://drive.google.com/uc?export=download&id=${id}"
  echo "Attempting download: $fname from $url_direct"

  # attempt curl
  if curl -sL --fail "$url_direct" -o "$fname"; then
    echo "Downloaded via curl: $fname"
    continue
  fi

  # attempt wget
  if command -v wget >/dev/null 2>&1; then
    if wget -qO "$fname" "$url_direct"; then
      echo "Downloaded via wget: $fname"
      continue
    fi
  fi

  # fallback to gdown if installed (recommended)
  if command -v gdown >/dev/null 2>&1; then
    echo "Falling back to gdown for $id"
    if gdown "https://drive.google.com/uc?id=$id" -O "$fname"; then
      echo "Downloaded via gdown: $fname"
      continue
    fi
  fi

  echo "Manual download required for $id. Visit: https://drive.google.com/uc?export=download&id=$id"
  # leave placeholder file
  echo "DRIVE_ID=${id}" > "${fname}.DRIVEID"
  
  # add note
  echo "Created placeholder: ${fname}.DRIVEID"

done

echo "Done. Check assets/logo/ for downloaded files."
