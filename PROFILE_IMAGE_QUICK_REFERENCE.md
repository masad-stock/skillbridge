# 📸 Profile Image Upload - Quick Reference

## ⚡ Quick Start

### For Users
1. Login → Profile → Click 📷 → Select Image → Done!
2. Max 5MB, formats: JPG, PNG, GIF, WEBP

### For Developers
```bash
# Start the app
cd learner-pwa
npm run start-fullstack

# Test upload
# 1. Login at http://localhost:3000
# 2. Go to /profile
# 3. Upload an image
```

## 🔗 Key Endpoints

```
POST   /api/v1/users/profile/photo    # Upload
DELETE /api/v1/users/profile/photo    # Delete
GET    /uploads/profiles/{filename}   # View
```

## 📂 File Structure

```
learner-pwa/
├── src/
│   ├── pages/Profile.js           # Upload UI
│   ├── components/Header.js       # Display photo
│   └── services/api.js            # API methods
├── backend/
│   ├── routes/users.js            # Endpoints
│   └── models/User.js             # Schema
└── uploads/
    └── profiles/                  # Storage
```

## 🎯 Where Photos Appear

- ✅ Profile page (large, 120x120px)
- ✅ Header navigation (small, 40x40px)
- ✅ Mobile menu (medium)
- ✅ Default: First initial in colored circle

## ⚙️ Configuration

### Max File Size
```javascript
// Backend: learner-pwa/backend/routes/users.js
limits: { fileSize: 5 * 1024 * 1024 } // 5MB
```

### Allowed Types
```javascript
// Backend: learner-pwa/backend/routes/users.js
const allowedTypes = /jpeg|jpg|png|gif|webp/;
```

### Storage Location
```javascript
// Backend: learner-pwa/backend/routes/users.js
destination: 'learner-pwa/uploads/profiles/'
```

## 🔒 Security Checklist

- ✅ Authentication required
- ✅ File type validation (server-side)
- ✅ File size limit (5MB)
- ✅ Unique filenames (timestamp + random)
- ✅ Old photo cleanup
- ✅ User can only modify own photo

## 🧪 Test Cases

| Test | Expected Result |
|------|----------------|
| Upload valid image | ✅ Success, photo displays |
| Upload > 5MB | ❌ Error: "Image size must be less than 5MB" |
| Upload PDF | ❌ Error: "Please select an image file" |
| Delete photo | ✅ Success, shows default avatar |
| Upload without login | ❌ Redirect to login |

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Photo not showing | Check backend is running, refresh page |
| Upload fails | Check file size < 5MB, file type is image |
| 401 error | Login again, token may be expired |
| Directory error | Ensure `uploads/profiles/` exists |

## 📝 Code Snippets

### Frontend: Upload Photo
```javascript
const handlePhotoUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('photo', file);
  await authAPI.uploadProfilePhoto(formData);
};
```

### Frontend: Display Photo
```javascript
{user?.profile?.profilePhoto ? (
  <img src={user.profile.profilePhoto} alt="Profile" />
) : (
  <span>{user?.profile?.firstName?.[0]}</span>
)}
```

### Backend: Upload Endpoint
```javascript
router.post('/profile/photo', protect, upload.single('photo'), async (req, res) => {
  const photoUrl = `/uploads/profiles/${req.file.filename}`;
  user.profile.profilePhoto = photoUrl;
  await user.save();
  res.json({ success: true, data: { profilePhoto: photoUrl } });
});
```

## 📊 API Response Examples

### Success
```json
{
  "success": true,
  "message": "Profile photo uploaded successfully",
  "data": {
    "profilePhoto": "/uploads/profiles/profile-123-1234567890.jpg"
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Image size must be less than 5MB"
}
```

## 🎨 Styling

### Profile Page Avatar
```css
width: 120px;
height: 120px;
border-radius: 50%;
object-fit: cover;
```

### Header Avatar
```css
width: 40px;
height: 40px;
border-radius: 50%;
object-fit: cover;
```

## 📚 Related Files

- `TEST_PROFILE_IMAGE_UPLOAD.md` - Detailed testing guide
- `PROFILE_IMAGE_UPLOAD_GUIDE.md` - User guide
- `PROFILE_IMAGE_IMPLEMENTATION_SUMMARY.md` - Full implementation details

---

**Status**: ✅ Fully Implemented & Tested
**Last Updated**: January 27, 2026
