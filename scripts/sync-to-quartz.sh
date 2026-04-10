#!/bin/bash
# wiki/ 내용을 Quartz로 동기화하고 GitHub에 배포
# 사용법: bash scripts/sync-to-quartz.sh

WIKI_DIR="C:/Users/etribe/Desktop/testspace/obsidian/wiki"
QUARTZ_DIR="C:/Users/etribe/Desktop/testspace/quartz"

echo "📚 wiki → Quartz 동기화 중..."
cp -r "$WIKI_DIR/." "$QUARTZ_DIR/content/"

echo "📤 Quartz repo push 중..."
cd "$QUARTZ_DIR"
git add .
git commit -m "wiki 업데이트: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null || echo "변경사항 없음"
git push

echo "✅ 완료! 2-3분 후 사이트에 반영됩니다."
echo "🌐 https://ssoa1111.github.io/llm-my-wiki-site/"
