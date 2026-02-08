# 🚨 CRITICAL: How to Fix Image Uploads (CORS Error)

You are seeing this error:
`Access to XMLHttpRequest at '...' has been blocked by CORS policy`

This means **Firebase Security** is blocking your uploads because they are coming from a browser/localhost without permission.

**YOU MUST RUN THIS COMMAND TO FIX IT.**

### If you don't have 'gsutil' installed on your computer:
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Select your project: **`staytrack-da2a8`**.
3. Click the **Activate Cloud Shell** icon (top right, `>_`).
4. Copy and paste **ALL** of the following lines into the shell at once:

```bash
cat > cors.json <<EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "HEAD", "DELETE"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "x-goog-meta-*" ]
  }
]
EOF

gsutil cors set cors.json gs://staytrack-da2a8.firebasestorage.app
```

### Verification
After running this command, go back to your app and try adding a student again. The images should upload correctly!
