# hamvoc.github.io

Official website of HAMvọc Lab — Research, Innovation, and Collaboration.

Next.js (static export) · GSAP · Lenis · deploy lên GitHub Pages bằng GitHub Actions.

## Chạy local

```bash
npm install
npm run dev        # http://localhost:3000
```

`npm run build` xuất site tĩnh ra `out/`; `npm start` để xem bản build đó.

## Thêm thông tin của bạn

Mỗi người là một file YAML trong `content/people/` và một tấm ảnh trong `content/people/photos/`.

1. Copy `content/people/_template.yml` thành `content/people/<slug>.yml`.
   `slug` là tên không dấu, nối bằng gạch ngang, ví dụ `nguyen-van-a`. Nó cũng là đường dẫn trang của bạn: `/people/nguyen-van-a/`.
2. Điền:
   - `name`: họ tên đầy đủ, có dấu
   - `callname`: tên mọi người hay gọi (không bắt buộc, mặc định là chữ cuối của tên). Tên này được set chữ to trên site.
   - `cohort`: K mấy
   - `major`
   - `position`: vị trí hiện tại (không đi làm thì bỏ dòng này)
   - `research`: hướng nghiên cứu, **càng cụ thể càng tốt**, mỗi ý một dòng
   - `keywords`: 1–3 chủ đề ngắn, dùng để gom mọi người theo chủ đề ở mục Research
   - `links`: email, GitHub, Scholar, LinkedIn, website (đều không bắt buộc)
3. Bỏ ảnh vào `content/people/photos/<slug>.jpg` (hoặc `.png`, `.webp`).
   Ảnh đứng khoanh tay hoặc chụp chính diện, phông xám hoặc tối, càng formal càng tốt.
4. Mở pull request.

Ảnh được xử lý tự động khi chạy `dev`/`build` (`scripts/portraits.mjs`): crop 3:4 quanh vùng nổi bật, chuyển trắng đen, và tạo thêm một bản dither 1-bit. Không cần tự chỉnh ảnh. Ai chưa có ảnh sẽ dùng chân dung placeholder được sinh tự động.

Thứ tự hiển thị: advisor → theo K (khóa cũ trước) → theo tên. Thêm `role: advisor` hoặc `role: alumni` nếu cần.

Các file trong `content/people/` hiện đang là **dữ liệu mẫu**, cần thay bằng thông tin thật.

## Nội dung chung

Tên lab, email liên hệ, link GitHub, địa điểm cạnh đồng hồ: `content/site.ts`.

## Deploy

Mỗi lần push lên `main`, workflow `.github/workflows/deploy.yml` sẽ build và đưa site lên GitHub Pages.

Lần đầu cần bật một lần: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Cấu trúc

```
app/                    route: trang chủ, /people/[slug]
components/             Hero (lineup chân dung), Roster, Topics, FitName, …
content/people/         một file .yml cho mỗi người + photos/
content/site.ts         thông tin chung của lab
lib/people.ts           đọc và sắp xếp dữ liệu thành viên
scripts/portraits.mjs   xử lý ảnh → public/people/ (file sinh ra, không commit)
```
