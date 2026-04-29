#!/bin/bash
# Apartsales — PDF rebuild script
# Запуск: bash _build_pdfs.sh
# Регенерирует все PDF из текущих .md файлов с поддержкой кириллицы.
#
# Зависимости:
#   apt: pandoc, texlive-xetex, texlive-latex-recommended, texlive-fonts-recommended,
#        lmodern, fonts-noto-color-emoji, fonts-symbola, fonts-dejavu

set -e
cd "$(dirname "$0")"

PANDOC_OPTS=(
  --pdf-engine=xelatex
  -V mainfont="DejaVu Sans"
  -V monofont="DejaVu Sans Mono"
  -V fontsize=10pt
  -V geometry:margin=2cm
  -V geometry:a4paper
  -V colorlinks=true
  -V linkcolor=blue
  -V urlcolor=blue
  --toc
  --toc-depth=3
  --highlight-style=tango
)

echo "=== Apartsales PDF rebuild ==="
for md in *.md; do
  pdf="${md%.md}.pdf"
  echo ">>> $md → $pdf"
  pandoc "$md" "${PANDOC_OPTS[@]}" -o "$pdf" 2>/dev/null
  if [ -f "$pdf" ]; then
    echo "    OK: $(du -h "$pdf" | cut -f1)"
  else
    echo "    FAIL: $md"
  fi
done

echo ""
echo "=== Done ==="
ls -la *.pdf
