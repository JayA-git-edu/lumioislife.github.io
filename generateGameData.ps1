param(
  [string]$MaxGames = "400"
)

$ROOT = Resolve-Path (Join-Path $PSScriptRoot "..")
$OUTPUT = Join-Path $ROOT "assets\data\games.json"
$maxEntries = [int]$MaxGames

$ignore = @("assets", "scripts", "node_modules", ".git", ".github", ".cursor", "terminals")
$preferredCovers = @("thumbnail.png", "thumb.png", "cover.png", "logo.png", "icon.png", "banner.png", "preview.png")
$coverFolders = @(".", "assets", "assets\img", "assets\images", "img", "images", "media")
$tags = @("Action", "Adventure", "Arcade", "Puzzle", "Strategy", "Simulation", "Racing", "Sports", "Casual", "Platformer", "Shooter", "Roguelike", "Survival", "Multiplayer", "Retro")
$sessionLengths = @("3-5 min", "5-10 min", "10-20 min")
$difficulties = @("Relaxed", "Moderate", "Intense")
$controlSets = @(
  @{ scheme = "Keyboard & Mouse"; steps = @("WASD / Arrow keys to move", "Space / Enter to interact", "Mouse to aim & confirm") },
  @{ scheme = "Touch / Pointer"; steps = @("Tap to move or select", "Pinch to zoom (if supported)", "Long-press for alt actions") },
  @{ scheme = "Controller"; steps = @("Left stick to move", "A / X to confirm", "B / O to dash / cancel") }
)
$languages = @("English", "Español", "Français", "Deutsch", "日本語", "한국어", "Português", "中文")
$vibes = @(
  "ultra-fluid combat loops",
  "neon-washed vistas",
  "tactile puzzle beats",
  "quick-hit arcade energy",
  "precision competitive flow",
  "chill idle progression",
  "story sparks between encounters"
)

function Get-Hash([string]$text) {
  $hash = [uint32]7
  foreach ($char in $text.ToCharArray()) {
    $hash = (($hash * 31) + [uint32][byte][char]$char)
  }
  return $hash
}

function Format-Name([string]$slug) {
  $clean = ($slug -replace "[-_]", " ").Trim()
  return -join ($clean.ToLower().Split(" ") | Where-Object { $_ -ne "" } | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) } | ForEach-Object { $_ + " " }).Trim()
}

function To-Posix([string]$path) {
  return $path.Replace([IO.Path]::DirectorySeparatorChar, "/")
}

function Pick-Tags([string]$slug) {
  $hash = Get-Hash $slug
  $set = New-Object System.Collections.Generic.HashSet[string]
  $i = 0
  while ($set.Count -lt 3) {
    $index = ($hash + ($i * 17)) % $tags.Count
    $set.Add($tags[$index]) | Out-Null
    $i++
  }
  return $set.ToArray()
}

function Pick-Controls([string]$slug) {
  $hash = Get-Hash $slug
  return $controlSets[$hash % $controlSets.Count]
}

function Pick-Languages([string]$slug) {
  $hash = Get-Hash $slug
  $set = New-Object System.Collections.Generic.HashSet[string]
  $set.Add("English") | Out-Null
  $i = 1
  while ($set.Count -lt 3) {
    $index = ($hash + ($i * 13)) % $languages.Count
    $set.Add($languages[$index]) | Out-Null
    $i++
  }
  return $set.ToArray()
}

function Build-Description([string]$name, [string[]]$gameTags) {
  $hash = Get-Hash $name
  $feature = $vibes[$hash % $vibes.Count]
  return "$name blends $($gameTags -join ', ') gameplay with $feature, delivering a premium browser experience you can jump into instantly."
}

function Find-Cover([string]$folder) {
  foreach ($relative in $coverFolders) {
    $target = if ($relative -eq ".") { $folder } else { Join-Path $folder $relative }
    if (-not (Test-Path $target)) { continue }
    if (-not (Get-Item $target).PSIsContainer) { continue }

    foreach ($preferred in $preferredCovers) {
      $candidate = Join-Path $target $preferred
      if (Test-Path $candidate -PathType Leaf) {
        return To-Posix ((Resolve-Path $candidate).Path.Substring($ROOT.Path.Length + 1))
      }
    }

    $fallback = Get-ChildItem -LiteralPath $target -Filter *.png -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($fallback) {
      return To-Posix ($fallback.FullName.Substring($ROOT.Path.Length + 1))
    }
  }
  return $null
}

$directories = Get-ChildItem -LiteralPath $ROOT -Directory | Where-Object { $ignore -notcontains $_.Name } | Sort-Object Name
$games = New-Object System.Collections.Generic.List[object]

foreach ($dir in $directories) {
  if ($games.Count -ge $maxEntries) { break }
  $indexPath = Join-Path $dir.FullName "index.html"
  if (-not (Test-Path $indexPath)) { continue }

  $cover = Find-Cover $dir.FullName
  $slug = $dir.Name
  $name = Format-Name $slug
  $gameTags = Pick-Tags $slug
  $description = Build-Description $name $gameTags
  $hash = Get-Hash $slug
  $controls = Pick-Controls $slug
  $langs = Pick-Languages $slug

  $games.Add([pscustomobject]@{
    id = "lumio-$($games.Count + 1)"
    slug = $slug
    name = $name
    cover = $cover
    playUrl = To-Posix("$slug/index.html")
    tags = $gameTags
    category = $gameTags[0]
    description = $description
    shortDescription = ($description.Split(".")[0] + ".")
    releaseYear = 2010 + ($hash % 15)
    sessionLength = $sessionLengths[($hash -shr 3) % $sessionLengths.Count]
    difficulty = $difficulties[($hash -shr 5) % $difficulties.Count]
    controls = $controls
    languages = $langs
    rating = [math]::Round(((($hash % 40) + 60) / 10), 1)
  })
}

if ($games.Count -eq 0) {
  Write-Error "No games discovered. Aborting."
  exit 1
}

New-Item -ItemType Directory -Force (Split-Path $OUTPUT) | Out-Null
$payload = [ordered]@{
  generatedAt = (Get-Date).ToString("o")
  total = $games.Count
  games = $games
}

$json = $payload | ConvertTo-Json -Depth 6
$json | Set-Content -LiteralPath $OUTPUT -Encoding UTF8

Write-Host "Generated $($games.Count) Lumio entries -> $(Resolve-Path $OUTPUT)"

