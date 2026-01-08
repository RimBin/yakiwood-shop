Param(
  [switch]$ForceKill
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path .).Path
$lockPath = Join-Path $root '.next\dev\lock'

Write-Host "Repo: $root"
Write-Host "Lock: $lockPath"

# Find node.exe processes that clearly belong to this repo's Next dev.
$nodeProcs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object {
    $_.CommandLine -and
    ($_.CommandLine -like "*$root*") -and
    (
      $_.CommandLine -match 'next\\dist\\bin\\next"\s+dev' -or
      $_.CommandLine -match 'next\\dist\\server\\lib\\start-server\.js' -or
      $_.CommandLine -match '\\.next\\dev\\'
    )
  } |
  Select-Object ProcessId, CommandLine

if (-not $nodeProcs) {
  Write-Host 'No matching Next dev node.exe processes found.'
} else {
  Write-Host "Found $($nodeProcs.Count) Next dev-related node.exe process(es):"
  $nodeProcs | Format-List | Out-String | Write-Host

  foreach ($p in $nodeProcs) {
    $processId = [int]$p.ProcessId
    if (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
      try {
        Stop-Process -Id $processId -Force -ErrorAction Stop
        Write-Host "Stopped PID $processId"
      } catch {
        if ($ForceKill) {
          Write-Host "Failed to stop PID $processId (ignored due to -ForceKill): $($_.Exception.Message)"
        } else {
          throw
        }
      }
    } else {
      Write-Host "PID $processId already exited"
    }
  }
}

Start-Sleep -Seconds 1

if (Test-Path $lockPath) {
  try {
    Remove-Item -Path $lockPath -Force -ErrorAction Stop
    Write-Host 'Removed .next\\dev\\lock'
  } catch {
    if ($ForceKill) {
      Write-Host "Failed to remove lock (ignored due to -ForceKill): $($_.Exception.Message)"
    } else {
      throw
    }
  }
} else {
  Write-Host 'No lock file present.'
}
