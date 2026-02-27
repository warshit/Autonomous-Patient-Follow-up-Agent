# Test script to verify webhook responds differently to different messages

Write-Host "Testing WhatsApp Webhook with different messages..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Test 1: Greeting" -ForegroundColor Yellow
Write-Host "Sending: 'hello'" -ForegroundColor Gray
$response1 = Invoke-WebRequest -Uri "http://localhost:5000/api/webhook/whatsapp" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "From=whatsapp:+1234567890&Body=hello" `
  -UseBasicParsing
Write-Host $response1.Content -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

Write-Host "Test 2: Emergency Symptom" -ForegroundColor Yellow
Write-Host "Sending: 'im suffering with high chest pain'" -ForegroundColor Gray
$response2 = Invoke-WebRequest -Uri "http://localhost:5000/api/webhook/whatsapp" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "From=whatsapp:+1234567890&Body=im suffering with high chest pain" `
  -UseBasicParsing
Write-Host $response2.Content -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

Write-Host "Test 3: Mild Symptom" -ForegroundColor Yellow
Write-Host "Sending: 'I have a little soreness'" -ForegroundColor Gray
$response3 = Invoke-WebRequest -Uri "http://localhost:5000/api/webhook/whatsapp" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "From=whatsapp:+1234567890&Body=I have a little soreness" `
  -UseBasicParsing
Write-Host $response3.Content -ForegroundColor Green
Write-Host ""

Write-Host "✅ Tests complete! Check if responses are different." -ForegroundColor Cyan
Write-Host "Also check backend logs for detailed message flow." -ForegroundColor Gray
