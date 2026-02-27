#!/bin/bash

# Test script to verify webhook responds differently to different messages

echo "Testing WhatsApp Webhook with different messages..."
echo ""

echo "Test 1: Greeting"
echo "Sending: 'hello'"
curl -X POST http://localhost:5000/api/webhook/whatsapp \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+1234567890&Body=hello" \
  2>/dev/null
echo ""
echo ""

sleep 2

echo "Test 2: Emergency Symptom"
echo "Sending: 'im suffering with high chest pain'"
curl -X POST http://localhost:5000/api/webhook/whatsapp \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+1234567890&Body=im suffering with high chest pain" \
  2>/dev/null
echo ""
echo ""

sleep 2

echo "Test 3: Mild Symptom"
echo "Sending: 'I have a little soreness'"
curl -X POST http://localhost:5000/api/webhook/whatsapp \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+1234567890&Body=I have a little soreness" \
  2>/dev/null
echo ""
echo ""

echo "✅ Tests complete! Check if responses are different."
echo "Also check backend logs for detailed message flow."
