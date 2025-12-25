# Generate browser extension icons using .NET
# This script creates simple placeholder icons for the extension

$iconSizes = @(16, 48, 128)
$iconsPath = Join-Path $PSScriptRoot "icons"

# Create icons directory if it doesn't exist
if (-not (Test-Path $iconsPath)) {
    New-Item -ItemType Directory -Path $iconsPath | Out-Null
}

Write-Host "Generating extension icons..." -ForegroundColor Green

foreach ($size in $iconSizes) {
    $iconPath = Join-Path $iconsPath "icon${size}.png"
    
    # Create a simple colored square icon using .NET
    Add-Type -AssemblyName System.Drawing
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fill with blue background
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(37, 99, 235))
    $graphics.FillRectangle($brush, 0, 0, $size, $size)
    
    # Draw white "AA" text
    $font = New-Object System.Drawing.Font("Arial", ($size * 0.4), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $graphics.DrawString("AA", $font, $textBrush, $rect, $format)
    
    # Save the icon
    $bitmap.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "Created: $iconPath" -ForegroundColor Cyan
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
}

Write-Host "`nIcons generated successfully!" -ForegroundColor Green
Write-Host "You can now load the extension in your browser." -ForegroundColor Yellow


