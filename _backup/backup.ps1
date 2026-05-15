param(
    [Parameter(Position = 0)]
    [ValidateSet("criar", "restaurar", "listar")]
    [string]$Comando = "criar",

    [Parameter(Position = 1)]
    [string]$Nome = ""
)

$projeto = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backupDir = $PSScriptRoot
$data = Get-Date -Format "yyyy-MM-dd_HHmmss"

function Criar-Backup {
    param([string]$NomeBackup)

    if (-not $NomeBackup) {
        $nomeFinal = "backup_$data"
    } else {
        $nomeFinal = "$NomeBackup`_$data"
    }

    $destino = Join-Path $backupDir $nomeFinal
    New-Item -ItemType Directory -Path $destino -Force | Out-Null

    $excluir = @(
        'node_modules', '.next', '.git', '_backup',
        '*.log', 'package-lock.json', '.env.local'
    )

    Write-Host "📦 Criando backup: $nomeFinal" -ForegroundColor Cyan

    Get-ChildItem -Path $projeto -Exclude $excluir | ForEach-Object {
        if ($_.PSIsContainer) {
            Copy-Item -Path $_.FullName -Destination $destino -Recurse -Force
        } else {
            Copy-Item -Path $_.FullName -Destination $destino -Force
        }
    }

    $metadata = @{
        Data = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        Nome = $nomeFinal
        Node = (node --version 2>$null) ?? "N/A"
        Npm = (npm --version 2>$null) ?? "N/A"
    }
    $metadata | ConvertTo-Json | Set-Content (Join-Path $destino "_metadata.json") -Encoding UTF8

    Write-Host "✅ Backup concluido: $nomeFinal" -ForegroundColor Green
    Write-Host "   📍 $destino"
}

function Restaurar-Backup {
    param([string]$NomeRestaurar)

    $origem = Join-Path $backupDir $NomeRestaurar
    if (-not (Test-Path $origem)) {
        Write-Host "❌ Backup nao encontrado: $NomeRestaurar" -ForegroundColor Red
        return
    }

    Write-Host "⚠️  Restaurando backup: $NomeRestaurar" -ForegroundColor Yellow

    $confirmacao = Read-Host "   Digite 'sim' para confirmar"
    if ($confirmacao -ne "sim") {
        Write-Host "❌ Restauracao cancelada" -ForegroundColor Red
        return
    }

    $excluir = @('node_modules', '.git', '_backup')
    Get-ChildItem -Path $projeto -Exclude $excluir | ForEach-Object {
        Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }

    Get-ChildItem -Path $origem -Exclude '_metadata.json' | ForEach-Object {
        if ($_.PSIsContainer) {
            Copy-Item -Path $_.FullName -Destination $projeto -Recurse -Force
        } else {
            Copy-Item -Path $_.FullName -Destination $projeto -Force
        }
    }

    Write-Host "✅ Backup restaurado com sucesso!" -ForegroundColor Green
}

function Listar-Backups {
    Write-Host "📋 Backups disponiveis:" -ForegroundColor Cyan
    Get-ChildItem -Path $backupDir -Directory | Where-Object { $_.Name -ne "backup.ps1" } | Sort-Object LastWriteTime -Descending | ForEach-Object {
        $meta = Join-Path $_.FullName "_metadata.json"
        if (Test-Path $meta) {
            $info = Get-Content $meta | ConvertFrom-Json
            Write-Host "   📁 $($_.Name)"
            Write-Host "      Data: $($info.Data)" -ForegroundColor Gray
        } else {
            Write-Host "   📁 $($_.Name) (sem metadados)" -ForegroundColor Gray
        }
    }
}

switch ($Comando) {
    "criar" { Criar-Backup -NomeBackup $Nome }
    "restaurar" { Restaurar-Backup -NomeRestaurar $Nome }
    "listar" { Listar-Backups }
}