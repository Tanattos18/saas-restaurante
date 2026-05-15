#!/usr/bin/env pwsh

# Script para encontrar e listar imports quebrados
$projectRoot = "c:\Users\Joás Santana\Documents\SaaS\PROMPT SISTEMA — SaaS Restaurante\saas-restaurante"
cd $projectRoot

$files = Get-ChildItem -Recurse -Path "src/frontend/app" -Filter "*.tsx" -File
$errors = @()

foreach ($file in $files) {
    $content = @(Get-Content $file.FullName)
    $lineNum = 1
    
    foreach ($line in $content) {
        if ($line -match "from '@/(lib|services|components|types)") {
            $errors += @{
                File = $file.FullName
                Line = $lineNum
                Content = $line.Trim()
            }
        }
        $lineNum++
    }
}

# Exibir erros encontrados
if ($errors.Count -gt 0) {
    Write-Host "=== IMPORTS QUEBRADOS ENCONTRADOS ===" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "$($error.File):$($error.Line)" -ForegroundColor Yellow
        Write-Host "  $($error.Content)" -ForegroundColor Gray
        Write-Host ""
    }
} else {
    Write-Host "Nenhum import quebrado encontrado" -ForegroundColor Green
}

# Salvar resultado em arquivo
$errors | ConvertTo-Json | Out-File -FilePath "broken-imports.json" -Encoding UTF8
