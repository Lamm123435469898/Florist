# Deploy Instructions for Florist HCM Website

## 1. Tạo GitHub Repository
1. Vào https://github.com và đăng nhập
2. Click vào "+" -> "New repository"
3. Đặt tên: `floristhcm-website`
4. Chọn "Public"
5. Click "Create repository"

## 2. Push Code lên GitHub
Sau khi tạo repository, chạy các lệnh sau:

```bash
# Thêm remote repository
git remote add origin https://github.com/[YOUR_USERNAME]/floristhcm-website.git

# Push code lên GitHub
git push -u origin master
```

## 3. Kích hoạt GitHub Pages
1. Vào repository trên GitHub
2. Đi đến Settings -> Pages
3. Trong "Source", chọn:
   - Branch: `master`
   - Folder: `/root`
4. Click "Save"

## 4. Cấu hình cho React SPA
Tạo file `.github/workflows/deploy.yml` với nội dung:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ master ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build:prod
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## URLs Deploy
- **Netlify**: https://floristhcm.netlify.app (✅ Đã deploy)
- **Vercel**: https://floristhcm.vercel.app (✅ Đã deploy)
- **GitHub Pages**: https://[YOUR_USERNAME].github.io/floristhcm-website (Sau khi setup)
