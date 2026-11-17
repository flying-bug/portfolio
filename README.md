# CV Portfolio · Ocean Blue

Trang CV cá nhân chạy trên **GitHub Pages**, có **chatbot** trả lời câu hỏi của nhà tuyển dụng và **trang Admin** để bạn sửa CV ngay trên web. Chỉ chủ repo GitHub mới vào được trang Admin.

```
public/cv.json        ← toàn bộ dữ liệu CV (Admin sửa file này qua GitHub API)
src/                  ← React + TypeScript (Vite)
  pages/PublicPage    ← trang CV công khai
  pages/admin/        ← trang Admin (#/admin)
  components/ChatWidget
worker/               ← Cloudflare Worker gọi Claude API cho chatbot (tuỳ chọn)
.github/workflows/    ← tự build & deploy mỗi khi push lên main
```

## Cách hoạt động của trang Admin

1. Vào `https://<username>.github.io/#/admin` (hoặc bấm **Admin** trên thanh menu).
2. Dán **GitHub fine-grained token** của bạn. Trang sẽ kiểm tra:
   - token hợp lệ (`GET /user`);
   - tài khoản đăng nhập **đúng là chủ repo** (hoặc `ADMIN_LOGIN` nếu bạn đặt);
   - tài khoản có **quyền push** vào repo.
   Sai bất kỳ điều kiện nào → không vào được.
3. Sửa hồ sơ, kỹ năng, kinh nghiệm, dự án, FAQ cho chatbot → bấm **Lưu & đẩy lên GitHub**.
   Trang sẽ commit `public/cv.json`, GitHub Actions deploy lại sau khoảng 1–2 phút.

> Bảo mật thật sự nằm ở GitHub: kể cả khi ai đó sửa code giao diện để lọt vào trang Admin,
> họ vẫn không thể commit vì không có token với quyền ghi vào repo của bạn.

### Tạo token

GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token
- Repository access: **Only select repositories** → chọn repo CV
- Permissions → **Contents: Read and write**
- Đặt hạn dùng ngắn (30–90 ngày) cho an toàn.

Token được lưu trong `sessionStorage` (mất khi đóng tab), hoặc `localStorage` nếu bạn tích “Ghi nhớ”.

## Triển khai lần đầu

```bash
git init && git add . && git commit -m "init CV"
git branch -M main
git remote add origin https://github.com/<username>/<username>.github.io.git
git push -u origin main
```

Trên GitHub: **Settings → Pages → Source: GitHub Actions**. Sau lần push, trang có tại
`https://<username>.github.io` (hoặc `https://<username>.github.io/<repo>/` nếu repo tên khác).

Tuỳ chọn (Settings → Secrets and variables → Actions → **Variables**):
- `ADMIN_LOGIN` — tài khoản được vào Admin (mặc định là owner của repo).
- `CHAT_API_URL` — URL Worker chatbot (xem dưới).

## Chatbot

- **Không cấu hình gì**: chatbot vẫn chạy, trả lời bằng FAQ + dữ liệu CV (so khớp từ khoá, không tốn phí).
- **Bật AI (Claude)**: deploy Worker trong thư mục `worker/`:

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
# sửa CV_URL và ALLOWED_ORIGINS trong wrangler.toml cho đúng domain của bạn
npx wrangler deploy
```

Rồi đặt biến `CHAT_API_URL` = URL Worker (ví dụ `https://cv-chat.<subdomain>.workers.dev`) và chạy lại workflow.
Worker tự lấy `cv.json` từ trang của bạn, nên người dùng không thể “nhồi” dữ liệu giả vào chatbot.
Model mặc định `claude-opus-5-5` (đổi qua biến `MODEL` trong `wrangler.toml`). Nên bật
[Rate limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/) trên Cloudflare để tránh bị spam tốn phí.

## Chạy local

```bash
cp .env.example .env.local   # sửa VITE_GITHUB_REPO
npm install
npm run dev
```
