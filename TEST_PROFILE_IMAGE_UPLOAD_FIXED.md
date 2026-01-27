# Profile Image Upload - Testing Guide

## Quick Test Steps

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd learner-pwa/backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd learner-pwa
npm start
```

### 2. Test Upload Feature

1. **Login** to the application
   - Use existing credentials or create a new account

2. **Navigate to Profile**
   - Click on your profile icon/name
   - Or go to `/profile` route

3. **Upload a Photo**
   - Click the camera icon (📷) on the profile picture
   - Select an image file:
     - ✅ Supported: JPEG, JPG, PNG, GIF, WebP
     - ✅ Max size: 5MB
   - Wait for upload to complete
   - Page should refresh automatically
   - New photo should be displayed

4. **Verify Upload**
   - Check if the photo displays correctly
   - Refresh the page - photo should persist
   - Check browser console for any errors

5. **Test Delete**
   - Click "Remove Photo" button
   - Confirm deletion
   - Photo should be removed
   - Initials should be displayed instead

### 3. Test Validation

**Test Invalid File Type:**
- Try uploading a PDF or text file
- Should show error: "Please select a valid image file (JPEG, PNG, GIF, or WebP)"

**Test Large File:**
- Try uploading an image larger than 5MB
- Should show error: "Image size must be less than 5MB"

**Test No File:**
- Click camera icon but cancel file selection
- Should not show any error (graceful handling)

## Expected Results

### ✅ Success Indicators

1. **Upload Success:**
   - Success toast: "Profile photo updated successfully!"
   - Photo displays in profile page
   - Photo URL format: `/uploads/profiles/profile-{userId}-{timestamp}.{ext}`

2. **Delete Success:**
   - Success toast: "Profile photo deleted successfully!"
   - Initials displayed instead of photo
   - Photo file removed from server

3. **Validation Working:**
   - Clear error messages for invalid files
   - File input resets after error
   - No console errors

### ❌ Failure Indicators

1. **Upload Fails:**
   - Error toast appears
   - Check browser console for errors
   - Check backend logs for errors

2. **Photo Doesn't Display:**
   - Check browser console for 404 errors
   - Verify URL format in network tab
   - Check if file exists in `backend/uploads/profiles/`

3. **Delete Fails:**
   - Error toast appears
   - Photo still displays
   - Check backend logs

## Debugging

### Browser Console Logs

**Expected logs during upload:**
```
File selected: File {name: "photo.jpg", size: 123456, type: "image/jpeg"}
Uploading file: photo.jpg Size: 123456 Type: image/jpeg
FormData has photo: true
Upload response: {success: true, data: {...}}
```

### Backend Console Logs

**Expected logs during upload:**
```
Upload request received
File: { fieldname: 'photo', originalname: 'photo.jpg', ... }
User: {userId}
Generated filename: profile-{userId}-{timestamp}.jpg
Upload directory ensured: {path}
Photo uploaded successfully: /uploads/profiles/profile-{userId}-{timestamp}.jpg
```

### Network Tab

**Check the upload request:**
- Method: POST
- URL: `http://localhost:5001/api/v1/users/profile/photo`
- Status: 200 OK
- Request Headers:
  - Content-Type: multipart/form-data
  - Authorization: Bearer {token}
- Response:
  ```json
  {
    "success": true,
    "message": "Profile photo uploaded successfully",
    "data": {
      "profilePhoto": "/uploads/profiles/profile-{userId}-{timestamp}.jpg"
    }
  }
  ```

### File System Check

**Verify file was saved:**
```bash
# Windows
dir learner-pwa\backend\uploads\profiles

# Linux/Mac
ls -la learner-pwa/backend/uploads/profiles
```

**Expected output:**
```
profile-{userId}-{timestamp}.jpg
```

## Troubleshooting

### Problem: "No file uploaded" error

**Solutions:**
1. Check file input has correct `name` attribute
2. Verify FormData is constructed correctly
3. Check browser console for FormData contents
4. Verify multer middleware is configured correctly

### Problem: Photo doesn't display

**Solutions:**
1. Check image URL in browser console
2. Verify URL format: `/uploads/profiles/{filename}`
3. Test direct access: `http://localhost:5001/uploads/profiles/{filename}`
4. Check CORS headers in network tab
5. Verify file exists in uploads directory

### Problem: "File type not allowed" error

**Solutions:**
1. Verify file is actually an image
2. Check file extension matches content type
3. Ensure file type is in whitelist: JPEG, PNG, GIF, WebP
4. Try converting image to supported format

### Problem: Upload succeeds but old photo not deleted

**Solutions:**
1. Check backend logs for deletion errors
2. Verify file permissions on uploads directory
3. Check if old photo path is correct in database
4. Manually delete old photos if needed

## Test Checklist

- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] User can login successfully
- [ ] Profile page loads without errors
- [ ] Camera icon is visible and clickable
- [ ] File input opens when camera icon clicked
- [ ] Valid image uploads successfully
- [ ] Success message appears after upload
- [ ] Photo displays correctly after upload
- [ ] Photo persists after page refresh
- [ ] Invalid file types are rejected
- [ ] Large files (>5MB) are rejected
- [ ] Delete button appears when photo exists
- [ ] Delete confirmation dialog appears
- [ ] Photo is removed after deletion
- [ ] Initials display after photo deletion
- [ ] No console errors during any operation
- [ ] Backend logs show successful operations

## Performance Notes

- Upload time depends on file size and network speed
- Typical upload time: 1-3 seconds for 1-2MB images
- Page refresh after upload: ~500ms delay
- Image loading: Should be instant from local server

## Security Notes

✅ **Implemented Security Measures:**
- Authentication required (JWT token)
- File type whitelist (only images)
- File size limit (5MB max)
- Unique filenames (prevents collisions)
- Old files cleaned up (prevents storage bloat)
- CORS headers configured (controlled access)

## Next Steps After Testing

If all tests pass:
1. ✅ Feature is working correctly
2. ✅ Ready for production deployment
3. ✅ Consider implementing recommended enhancements

If tests fail:
1. Review error messages
2. Check browser and backend logs
3. Verify file system permissions
4. Run test script: `node learner-pwa/backend/scripts/testProfileUpload.js`
5. Refer to PROFILE_IMAGE_UPLOAD_FIX.md for detailed debugging

## Contact

If you encounter issues not covered in this guide:
1. Check PROFILE_IMAGE_UPLOAD_FIX.md for detailed technical information
2. Review backend logs for specific error messages
3. Check browser console for client-side errors
4. Verify all dependencies are installed correctly
