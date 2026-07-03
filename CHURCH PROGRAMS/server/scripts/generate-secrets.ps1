# Generate secure secrets for .env
$jwt = [System.Guid]::NewGuid().ToString() + [System.Convert]::ToBase64String((1..16 | ForEach-Object {Get-Random -Minimum 0 -Maximum 255}))
Write-Host "JWT_SECRET=$jwt" > .env
Write-Host "DB_URI=mongodb://mongo:27017/gigal" >> .env
Write-Host "ADMIN_EMAIL=daniel@gigal.example" >> .env
Write-Host "ADMIN_PASSWORD=AdminPass123" >> .env
Write-Host "TURN_USER=turnuser" >> .env
Write-Host "TURN_PASS=$( [System.Convert]::ToBase64String((1..12 | ForEach-Object {Get-Random -Minimum 0 -Maximum 255})) )" >> .env
Write-Host ".env file generated. Edit values before deploying to production." 
