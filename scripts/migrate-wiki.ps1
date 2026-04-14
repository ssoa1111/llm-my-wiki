# migrate-wiki.ps1 — tech/ 하위 폴더 분류 마이그레이션
# 실행: powershell -ExecutionPolicy Bypass -File scripts/migrate-wiki.ps1

$WikiDir = "C:\Users\etribe\Desktop\testspace\obsidian\wiki"

# filename(확장자 없음) → 새 subfolder
$SubMap = @{
    # n8n
    "n8n-ai-agent"="n8n"; "n8n-chatbot-auth"="n8n"; "n8n-ga4-analysis"="n8n"
    "n8n-google-sheets"="n8n"; "n8n-image-compress"="n8n"; "n8n-image-generation"="n8n"
    "n8n-local-setup"="n8n"; "n8n-supabase-vector"="n8n"; "n8n-troubleshooting"="n8n"
    # ai
    "claude-code-commands"="ai"; "claude-code-concepts"="ai"; "claude-skill-creation"="ai"
    "embedding-models"="ai"; "embedding-search-accuracy"="ai"; "hallucination-prevention"="ai"
    "langgraph-architecture"="ai"; "mcp-server-development"="ai"; "orchestrator-architecture"="ai"
    "rag-python-implementation"="ai"; "rag-search-mechanism"="ai"; "rag-speed-optimization"="ai"
    "vector-database"="ai"; "vector-db-comparison"="ai"; "vector-similarity"="ai"
    # frontend
    "context-zustand"="frontend"; "frontend-error-patterns"="frontend"; "loading-strategy"="frontend"
    "nextjs-caching"="frontend"; "nextjs-env-vars"="frontend"; "nextjs-i18n"="frontend"
    "nextjs-image-metadata-seo"="frontend"; "nextjs-middleware-context"="frontend"
    "node-edge-runtime"="frontend"; "performance-checklist"="frontend"; "performance-measurement"="frontend"
    "react-rendering-optimization"="frontend"; "state-management"="frontend"
    "use-effect"="frontend"; "use-transition"="frontend"
    "usememo-usecallback-reactmemo"="frontend"; "webview-basics"="frontend"
    # backend
    "centralized-error-handling"="backend"; "http-status-codes"="backend"; "jwt-auth-nextjs"="backend"
    "open-redirect"="backend"; "payment-system"="backend"; "rest-api-conventions"="backend"
    "script-security"="backend"; "security-headers"="backend"; "sql-crud"="backend"
    "sql-table-design"="backend"; "supabase-nextjs"="backend"; "zod-validation"="backend"
    # infra
    "dev-environment-errors"="infra"; "docker"="infra"; "git-workflow"="infra"
    "monorepo-turborepo"="infra"; "spec-kit"="infra"
}

# old-slug → new-slug 맵 구성
$SlugMap = @{}
foreach ($e in $SubMap.GetEnumerator()) {
    $SlugMap["tech/$($e.Key)"] = "tech/$($e.Value)/$($e.Key)"
}

# 상대경로 계산: fromSlug(파일) 기준으로 toSlug까지의 상대경로
function Get-RelPath([string]$fromSlug, [string]$toSlug) {
    $fromDir = @($fromSlug -split '/' | Select-Object -SkipLast 1)
    $toParts = @($toSlug -split '/')
    $common = 0
    $limit = [Math]::Min($fromDir.Count, $toParts.Count - 1)
    for ($i = 0; $i -lt $limit; $i++) {
        if ($fromDir[$i] -eq $toParts[$i]) { $common++ } else { break }
    }
    $ups = $fromDir.Count - $common
    $down = ($toParts[$common..($toParts.Count-1)]) -join '/'
    if ($ups -eq 0) { return "./$down.md" }
    return ("../" * $ups) + "$down.md"
}

# 링크 href + 현재 slug → 대상 slug 해석
function Resolve-Slug([string]$currentSlug, [string]$href) {
    $stack = [System.Collections.Generic.List[string]]@(
        $currentSlug -split '/' | Select-Object -SkipLast 1
    )
    foreach ($p in ($href -split '/')) {
        if ($p -eq '..') { if ($stack.Count -gt 0) { $stack.RemoveAt($stack.Count-1) } }
        elseif ($p -ne '.' -and $p -ne '') { $stack.Add($p) }
    }
    return ($stack -join '/') -replace '\.md$',''
}

# 모든 wiki 파일 읽기
$AllFiles = @{}
Get-ChildItem $WikiDir -Recurse -Filter "*.md" | ForEach-Object {
    $slug = $_.FullName.Substring($WikiDir.Length+1).Replace('\','/') -replace '\.md$',''
    $AllFiles[$slug] = @{ Path=$_.FullName; Content=(Get-Content $_.FullName -Raw -Encoding UTF8) }
}

Write-Host "총 $($AllFiles.Count)개 파일 처리 중..."

# 서브폴더 생성
foreach ($sub in @("n8n","ai","frontend","backend","infra")) {
    New-Item -ItemType Directory -Force -Path "$WikiDir\tech\$sub" | Out-Null
}

$moved = 0; $linkFixed = 0

# 각 파일 링크 업데이트 후 새 위치에 저장
foreach ($entry in $AllFiles.GetEnumerator()) {
    $slug    = $entry.Key
    $oldPath = $entry.Value.Path
    $content = $entry.Value.Content

    $newSlug = if ($SlugMap.ContainsKey($slug)) { $SlugMap[$slug] } else { $slug }

    # 링크 교체
    $pattern = [regex]'\[([^\]]*)\]\(([^)]+)\)'
    $newContent = $pattern.Replace($content, [System.Text.RegularExpressions.MatchEvaluator]{
        param($m)
        $text = $m.Groups[1].Value
        $href = $m.Groups[2].Value

        if (-not $href.EndsWith('.md') -or $href.StartsWith('http')) { return $m.Value }

        $oldTarget = Resolve-Slug $slug $href
        $newTarget = if ($SlugMap.ContainsKey($oldTarget)) { $SlugMap[$oldTarget] } else { $oldTarget }

        if ($newTarget -eq $oldTarget -and $newSlug -eq $slug) { return $m.Value }

        $newHref = Get-RelPath $newSlug $newTarget
        $script:linkFixed++
        return "[$text]($newHref)"
    })

    $newPath = "$WikiDir\" + $newSlug.Replace('/','\') + ".md"
    [System.IO.File]::WriteAllText($newPath, $newContent, [System.Text.UTF8Encoding]::new($false))

    if ($newSlug -ne $slug -and (Test-Path $oldPath) -and $oldPath -ne $newPath) {
        Remove-Item $oldPath -Force
        $script:moved++
    }
}

Write-Host "✅ 완료"
Write-Host "  이동된 파일: $moved개"
Write-Host "  수정된 링크: $linkFixed개"
