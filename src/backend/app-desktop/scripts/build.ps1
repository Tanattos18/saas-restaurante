param(
    [ValidateSet("dev", "dist", "release")]
    [string]$Target = "dev"
)

$root = Split-Path -Parent $PSScriptRoot
$nextProject = Join-Path $root ".."

function Build-Frontend {
    Write-Host "📦 Compilando frontend Next.js..." -ForegroundColor Cyan
    Set-Location -Path $nextProject
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build falhou" }

    $outDir = Join-Path $root "src\out"
    if (Test-Path $outDir) { Remove-Item -Path $outDir -Recurse -Force }
    Copy-Item -Path (Join-Path $nextProject "out") -Destination $outDir -Recurse -Force
    Write-Host "✅ Frontend copiado para src/out" -ForegroundColor Green
    Set-Location -Path $root
}

function Build-Electron {
    Write-Host "🔧 Compilando TypeScript..." -ForegroundColor Cyan
    npx tsc
    if ($LASTEXITCODE -ne 0) { throw "TypeScript compilation falhou" }
    Write-Host "✅ TypeScript compilado" -ForegroundColor Green
}

function Make-Dist {
    Write-Host "📦 Gerando instaladores..." -ForegroundColor Cyan
    npx electron-builder
    if ($LASTEXITCODE -ne 0) { throw "electron-builder falhou" }
    Write-Host "✅ Instaladores gerados em release/" -ForegroundColor Green
}

function Make-Release {
    Write-Host "🚀 Publicando release..." -ForegroundColor Cyan
    npx electron-builder --publish always
    if ($LASTEXITCODE -ne 0) { throw "Publicação falhou" }
    Write-Host "✅ Release publicado no GitHub" -ForegroundColor Green
}

try {
    switch ($Target) {
        "dev" {
            Build-Electron
            Write-Host "✅ Build dev concluído. Execute 'npm run dev' para iniciar" -ForegroundColor Green
        }
        "dist" {
            Build-Frontend
            Build-Electron
            Make-Dist
        }
        "release" {
            Build-Frontend
            Build-Electron
            Make-Dist
            Make-Release
        }
    }
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    exit 1
}
