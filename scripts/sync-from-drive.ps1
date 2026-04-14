# sync-from-drive.ps1
# 구글 드라이브에서 변경/추가/삭제된 파일 감지 → CHANGES.md 생성
# 파일 복사 없음 — 경로 목록(.manifest)으로 삭제 감지
# 사용법: powershell -ExecutionPolicy Bypass -File scripts/sync-from-drive.ps1

param()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = [System.IO.Path]::GetFullPath((Join-Path (Join-Path $ScriptDir "..") ".env"))

if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ .env 파일이 없어요. .env.example을 복사해서 만들어주세요:"
    Write-Host "   Copy-Item .env.example .env"
    exit 1
}

# .env 파싱
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^([A-Za-z_][A-Za-z0-9_]*)="?([^"]*)"?$') {
        Set-Variable -Name $matches[1] -Value $matches[2] -Scope Script
    }
}

$DriveVault   = $DRIVE_VAULT.Replace('/', '\').TrimEnd('\')
$ObsidianDir  = $OBSIDIAN_DIR.Replace('/', '\').TrimEnd('\')
$SourcesDir   = Join-Path $ObsidianDir "sources"
$ChangesFile  = Join-Path $SourcesDir "CHANGES.md"
$ManifestFile = Join-Path $SourcesDir ".manifest"   # 이전 파일 목록 저장

New-Item -ItemType Directory -Force -Path $SourcesDir | Out-Null

Write-Host "🔍 변경사항 감지 중..."

# 제외 패턴 (기본)
$ExcludePatterns = [System.Collections.Generic.List[string]]@(".obsidian", "100. template", "101. readme")

# .syncignore 파일이 있으면 추가 제외 패턴 로드
$SyncIgnoreFile = [System.IO.Path]::GetFullPath((Join-Path (Join-Path $ScriptDir "..") ".syncignore"))
if (Test-Path $SyncIgnoreFile) {
    Get-Content $SyncIgnoreFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $ExcludePatterns.Add($line) | Out-Null
        }
    }
}

function Should-Exclude($path) {
    foreach ($p in $ExcludePatterns) { if ($path -like "*$p*") { return $true } }
    return $false
}

# 현재 드라이브 파일 목록 (상대경로 → 수정시각 해시맵)
$CurrentFiles = @{}
Get-ChildItem -Path $DriveVault -Recurse -Filter "*.md" -File |
    Where-Object { -not (Should-Exclude $_.FullName) } |
    ForEach-Object {
        $rel = $_.FullName.Substring($DriveVault.Length).TrimStart('\')
        $CurrentFiles[$rel] = $_.LastWriteTime.ToString("o")
    }

# 이전 manifest 읽기
$PrevFiles = @{}
if (Test-Path $ManifestFile) {
    Get-Content $ManifestFile | ForEach-Object {
        if ($_ -match '^(.+)\|(.+)$') {
            $PrevFiles[$matches[1]] = $matches[2]
        }
    }
}

$Added   = [System.Collections.Generic.List[string]]::new()
$Updated = [System.Collections.Generic.List[string]]::new()
$Deleted = [System.Collections.Generic.List[string]]::new()

# 추가 / 수정 감지
foreach ($rel in $CurrentFiles.Keys) {
    if (-not $PrevFiles.ContainsKey($rel)) {
        $Added.Add($rel) | Out-Null
    } elseif ($PrevFiles[$rel] -ne $CurrentFiles[$rel]) {
        $Updated.Add($rel) | Out-Null
    }
}

# 삭제 감지 (이전엔 있었는데 지금 없는 파일)
foreach ($rel in $PrevFiles.Keys) {
    if (-not $CurrentFiles.ContainsKey($rel)) {
        $Deleted.Add($rel) | Out-Null
    }
}

# 변경 없으면 종료
if ($Added.Count -eq 0 -and $Updated.Count -eq 0 -and $Deleted.Count -eq 0) {
    Write-Host "✅ 변경사항 없음 — 모든 파일이 최신 상태예요."
    exit 0
}

# CHANGES.md 작성
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$Lines = [System.Collections.Generic.List[string]]::new()
$Lines.Add("# 동기화 변경사항 — $Timestamp")
$Lines.Add("")
$Lines.Add("Claude에게: 아래 파일들만 ingest 해주세요. 변경되지 않은 파일은 건너뛰세요.")
$Lines.Add("")

if ($Added.Count -gt 0) {
    $Lines.Add("## 새로 추가된 파일")
    foreach ($rel in $Added) {
        $Lines.Add("- $($DriveVault.Replace('\','/'))\$rel".Replace('\','/'))
    }
    $Lines.Add("")
}

if ($Updated.Count -gt 0) {
    $Lines.Add("## 수정된 파일")
    foreach ($rel in $Updated) {
        $Lines.Add("- $($DriveVault.Replace('\','/'))\$rel".Replace('\','/'))
    }
    $Lines.Add("")
}

if ($Deleted.Count -gt 0) {
    $Lines.Add("## 삭제된 파일 (wiki에서 관련 출처 정리 필요)")
    foreach ($rel in $Deleted) {
        $Lines.Add("- $($rel.Replace('\','/'))")
    }
    $Lines.Add("")
}

$Lines | Set-Content -Path $ChangesFile -Encoding UTF8

# manifest 업데이트 (현재 상태 저장)
$ManifestLines = [System.Collections.Generic.List[string]]::new()
foreach ($rel in $CurrentFiles.Keys) {
    $ManifestLines.Add("$rel|$($CurrentFiles[$rel])")
}
$ManifestLines | Set-Content -Path $ManifestFile -Encoding UTF8

# 결과 출력
Write-Host ""
Write-Host "📋 변경사항:"
if ($Added.Count   -gt 0) { Write-Host "  ✨ 추가: $($Added.Count)개" }
if ($Updated.Count -gt 0) { Write-Host "  📝 수정: $($Updated.Count)개" }
if ($Deleted.Count -gt 0) { Write-Host "  🗑️  삭제: $($Deleted.Count)개" }
Write-Host ""
Write-Host "📌 다음 단계:"
Write-Host "  1. claude 실행 (obsidian 폴더에서)"
Write-Host "  2. 입력: sources/CHANGES.md 보고 변경된 파일만 ingest 해줘"
