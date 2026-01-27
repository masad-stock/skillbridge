# 📸 Profile Image Upload - User Guide

## Overview

Users can now upload, view, and delete their profile photos directly from the Profile page.

## 🎯 How to Use

### Uploading a Profile Photo

1. **Navigate to Profile**
   - Click on your name/avatar in the header
   - Or go to `/profile` in the app

2. **Click the Camera Icon**
   - You'll see a circular avatar with a camera icon (📷) at the bottom-right
   - Click the camera icon to open file picker

3. **Select Your Image**
   - Choose an image file from your device
   - Supported formats: JPEG, JPG, PNG, GIF, WEBP
   - Maximum size: 5MB

4. **Wait for Upload**
   - A spinner will appear while uploading
   - Page will automatically refresh when complete
   - Your new photo will be displayed

### Deleting Your Profile Photo

1. **Go to Profile Page**
   - Navigate to your profile

2. **Click "Remove Photo"**
   - Button appears below your profile photo
   - Confirm the deletion when prompted

3. **Default Avatar Returns**
   - Your photo will be deleted
   - A default avatar with your initial will show instead

## ✅ Validation Rules

### File Type
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WEBP (.webp)
- ❌ PDF, DOC, TXT, etc.

### File Size
- ✅ Up to 5MB
- ❌ Files larger than 5MB will be rejected

## 🎨 Visual Display

### With Photo
```
┌─────────────────┐
│                 │
│   [Your Photo]  │  ← 120x120px circular
│                 │
└─────────────────┘
        📷          ← Camera icon (click to upload)
   Remove Photo    ← Delete button
```

### Without Photo (Default)
```
┌─────────────────┐
│                 │
│       J         │  ← First letter of your name
│                 │
└─────────────────┘
        📷          ← Camera icon (click to upload)
```

## 🔒 Security & Privacy

- **Authentication Required**: Only logged-in users can upload photos
- **Personal Access**: You can only upload/delete your own photo
- **Secure Storage**: Photos are stored securely on the server
- **Automatic Cleanup**: Old photos are deleted when you upload a new one
- **Not Shared**: Your photo is only visible to you (unless shared in public profile)

## 💡 Tips

1. **Best Photo Quality**
   - Use square images for best results
   - Recommended: 500x500px or larger
   - Clear, well-lit photos work best

2. **File Size**
   - Compress large images before uploading
   - Use online tools like TinyPNG or Squoosh
   - Most phone photos are under 5MB

3. **Privacy**
   - Choose appropriate photos for professional context
   - Remember this is a learning platform

## 🐛 Troubleshooting

### "No file uploaded" Error
- Make sure you selected a file
- Try selecting the file again

### "Image size must be less than 5MB" Error
- Your file is too large
- Compress the image or choose a smaller file

### "Please select an image file" Error
- You selected a non-image file
- Choose a JPEG, PNG, GIF, or WEBP file

### Photo Not Showing After Upload
- Refresh the page manually
- Clear browser cache
- Check your internet connection

### Upload Button Not Working
- Make sure you're logged in
- Check if backend server is running
- Try a different browser

## 📱 Mobile Support

The profile photo upload works on mobile devices:
- Tap the camera icon
- Choose "Take Photo" or "Choose from Library"
- Select/capture your photo
- Upload completes automatically

## 🎉 Success!

Once uploaded, your profile photo will:
- ✅ Display on your Profile page
- ✅ Show in the header/navigation
- ✅ Appear in your dashboard
- ✅ Be visible in any user listings (if admin)

---

**Need Help?** Contact support or check the troubleshooting section above.
