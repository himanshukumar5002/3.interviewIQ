#!/bin/bash
# Get environment variables from Render or use defaults
export VITE_API_URL=${VITE_API_URL:-https://three-interviewiq-09da.onrender.com}
export VITE_FIREBASE_APIKEY=${VITE_FIREBASE_APIKEY:-AIzaSyBieGk4X_uk4xD5tCvRx-8422HHyTxvsk0}
export VITE_RAZORPAY_KEY_ID=${VITE_RAZORPAY_KEY_ID:-rzp_test_SbgD21TzvCml3H}

# Build the app
npm run build
