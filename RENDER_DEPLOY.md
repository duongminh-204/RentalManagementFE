# Deploy Frontend lên Render

Hướng dẫn deploy React (Vite) và kết nối với backend ASP.NET Core trên Render.

## Yêu cầu

- Backend đã deploy và chạy (ví dụ: `https://rentalmanagementbe.onrender.com`)
- Repo frontend trên GitHub/GitLab
- Tài khoản [Render](https://render.com)

## Bước 1: Tạo Static Site trên Render

1. Vào **Render Dashboard** → **New** → **Static Site**
2. Kết nối repository chứa thư mục `frontend`
3. Cấu hình:

| Mục | Giá trị |
|-----|---------|
| **Name** | `rental-management-fe` (tùy chọn) |
| **Root Directory** | `frontend` (nếu repo là monorepo) |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

## Bước 2: Cấu hình biến môi trường (bắt buộc)

Vào **Environment** của Static Site, thêm các biến sau (tham khảo `.env.production.example`):

```env
VITE_API_ORIGIN=https://rentalmanagementbe.onrender.com
VITE_API_BASE_URL=https://rentalmanagementbe.onrender.com/api
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

> **Quan trọng:** Biến `VITE_*` chỉ có hiệu lực lúc **build**. Sau khi thêm/sửa biến, phải **Manual Deploy** hoặc **Clear build cache & deploy** để build lại.

## Bước 3: Cấu hình SPA routing (React Router)

Tạo file `frontend/public/_redirects` (nếu chưa có):

```
/*    /index.html   200
```

Render Static Site sẽ dùng file này để mọi route trả về `index.html`.

## Bước 4: Cấu hình CORS trên Backend

Trên **Backend Web Service** → **Environment**, thêm URL frontend vừa deploy:

```env
Cors__AllowedOrigins=https://your-frontend.onrender.com
```

Nhiều URL thì phân cách bằng dấu phẩy:

```env
Cors__AllowedOrigins=https://rental-management-fe.onrender.com,https://www.example.com
```

Localhost (`5173`, `3000`, …) vẫn được phép mặc định khi dev local.

## Bước 5: Google Sign-In (nếu dùng)

Trong [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → OAuth 2.0 Client:

- **Authorized JavaScript origins:** thêm `https://your-frontend.onrender.com`
- **Authorized redirect URIs:** thường không cần cho Google Identity Services (One Tap / button)

## Bước 6: Deploy và kiểm tra

1. **Deploy** Static Site
2. Mở DevTools → **Network**, thử đăng nhập/đăng ký
3. Request API phải trỏ tới `https://rentalmanagementbe.onrender.com/api/...`, **không** phải `localhost:8090`

### Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
|-------------|-------------|----------|
| `ERR_CONNECTION_REFUSED localhost:8090` | Chưa set `VITE_API_ORIGIN` khi build | Thêm env vars → rebuild |
| CORS error trên console | Backend chưa có URL frontend | Thêm `Cors__AllowedOrigins` trên backend |
| Trang trắng khi refresh `/dashboard` | Thiếu SPA redirect | Thêm `public/_redirects` |
| Request chậm ~50s lần đầu | Free tier spin down | Bình thường với Render free |

## Build local với config production

```bash
cd frontend
cp .env.production.example .env.production
# Sửa URL trong .env.production
npm run build
npm run preview
```

Mở `http://localhost:4173` để test bundle production trước khi deploy.
