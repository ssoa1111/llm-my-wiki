#!/bin/bash
# 구글 드라이브 Obsidian 노트를 sources/로 동기화
# - 변경/추가된 파일만 복사
# - 삭제된 파일 감지
# - 변경 목록을 sources/CHANGES.md에 기록
# 사용법: bash scripts/sync-from-drive.sh

# .env 파일에서 경로 로드
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env 파일이 없어요. .env.example을 복사해서 만들어주세요:"
  echo "   cp .env.example .env"
  exit 1
fi

source "$ENV_FILE"

SOURCES_DIR="$OBSIDIAN_DIR/sources/from-obsidian"
CHANGES_FILE="$OBSIDIAN_DIR/sources/CHANGES.md"

mkdir -p "$SOURCES_DIR"

echo "🔍 변경사항 감지 중..."

# rsync로 변경/추가/삭제된 파일만 동기화
# --update: 소스가 더 최신인 파일만 복사
# --delete: 드라이브에서 삭제된 파일은 sources에서도 삭제
# --itemize-changes: 변경 내역 출력
SYNC_OUTPUT=$(rsync -av --update --delete \
  --itemize-changes \
  --include="*/" \
  --include="*.md" \
  --exclude="100. template/" \
  --exclude="101. readme/" \
  --exclude="*" \
  "$DRIVE_VAULT/" "$SOURCES_DIR/" 2>/dev/null)

# 변경된 파일 파싱
ADDED=$(echo "$SYNC_OUTPUT" | grep "^>f+" | awk '{print $2}')
UPDATED=$(echo "$SYNC_OUTPUT" | grep "^>f." | grep -v "^>f+" | awk '{print $2}')
DELETED=$(echo "$SYNC_OUTPUT" | grep "^\*deleting" | awk '{print $2}')

# 변경사항이 있는지 확인
if [ -z "$ADDED" ] && [ -z "$UPDATED" ] && [ -z "$DELETED" ]; then
  echo "✅ 변경사항 없음 — 모든 파일이 최신 상태예요."
  exit 0
fi

# CHANGES.md 생성 (Claude에게 전달할 변경 목록)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
cat > "$CHANGES_FILE" << EOF
# 동기화 변경사항 — $TIMESTAMP

Claude에게: 아래 파일들만 ingest 해주세요. 변경되지 않은 파일은 건너뛰세요.

EOF

if [ -n "$ADDED" ]; then
  echo "## 새로 추가된 파일" >> "$CHANGES_FILE"
  echo "$ADDED" | while read f; do
    echo "- sources/from-obsidian/$f" >> "$CHANGES_FILE"
  done
  echo "" >> "$CHANGES_FILE"
fi

if [ -n "$UPDATED" ]; then
  echo "## 수정된 파일" >> "$CHANGES_FILE"
  echo "$UPDATED" | while read f; do
    echo "- sources/from-obsidian/$f" >> "$CHANGES_FILE"
  done
  echo "" >> "$CHANGES_FILE"
fi

if [ -n "$DELETED" ]; then
  echo "## 삭제된 파일 (wiki에서 관련 내용 정리 필요)" >> "$CHANGES_FILE"
  echo "$DELETED" | while read f; do
    echo "- $f" >> "$CHANGES_FILE"
  done
  echo "" >> "$CHANGES_FILE"
fi

# 결과 출력
echo ""
echo "📋 변경사항:"
[ -n "$ADDED" ]   && echo "  ✨ 추가: $(echo "$ADDED" | wc -l | tr -d ' ')개"
[ -n "$UPDATED" ] && echo "  📝 수정: $(echo "$UPDATED" | wc -l | tr -d ' ')개"
[ -n "$DELETED" ] && echo "  🗑️  삭제: $(echo "$DELETED" | wc -l | tr -d ' ')개"
echo ""
echo "📌 다음 단계:"
echo "  1. claude 실행 (obsidian 폴더에서)"
echo "  2. 입력: sources/CHANGES.md 보고 변경된 파일만 ingest 해줘"
