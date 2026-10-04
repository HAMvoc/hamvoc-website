# hamvoc-website

Official website of HAMvọc Lab — Research, Innovation, and Collaboration.
https://hamvoc.vercel.app/

Next.js (static export) · GSAP · Lenis · deploy trên Vercel.

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
   - `aliases`: cách tên bạn được viết trên paper (vd. `Hieu Le Minh Phan`), để paper tự link về trang của bạn
   - `cohort`: K mấy
   - `major`
   - `position`: vị trí hiện tại
   - `research`: hướng nghiên cứu, **càng cụ thể càng tốt**, mỗi ý một dòng
   - `links`: email, GitHub, Scholar, ResearchGate, LinkedIn, website (đều không bắt buộc)

   Mục nào để trống sẽ hiện "To be updated" trên trang cá nhân.
3. Bỏ ảnh vào `content/people/photos/<slug>.jpg` (hoặc `.png`, `.webp`).
   Ảnh đứng khoanh tay hoặc chụp chính diện, phông xám hoặc tối, càng formal càng tốt.
4. Mở pull request.

Ảnh được xử lý tự động khi chạy `dev`/`build` (`scripts/portraits.mjs`): crop 3:4 quanh vùng nổi bật, chuyển trắng đen, và tạo thêm một bản dither 1-bit. Không cần tự chỉnh ảnh. Ai chưa có ảnh sẽ dùng chân dung placeholder được sinh tự động.

Thứ tự hiển thị: advisor → theo K (khóa cũ trước) → theo tên. Thêm `role: advisor` hoặc `role: alumni` nếu cần.

Danh sách thành viên lấy từ [trang ResearchGate của lab](https://www.researchgate.net/lab/HAMvoc-Lab-Minh-Anh-Hoang). Trên web tên hiển thị bằng tiếng Việt (`name`); cách viết tên trên paper để trong `aliases`. Mỗi người tự kiểm tra lại tên có dấu và điền K, ngành, vị trí, hướng nghiên cứu, ảnh.

## Thêm paper

Paper nằm trong `content/research/`, chia đúng 2 thư mục — trang `/research` cũng chia theo 2 mục này:

```
content/research/
  journal/       bài đăng tạp chí
  conference/    bài hội nghị
    tera-rag.yml
    tera-rag.pdf   (không bắt buộc) đặt PDF cùng tên là site tự đăng và gắn link
```

Mỗi paper là một file `.yml` (xem mẫu `content/research/_paper-template.yml`). `authors` ghi đúng như trên paper; tên khớp với `name` hoặc `aliases` của thành viên thì được gạch chân, link về trang người đó và tự hiện trong mục Papers trên trang của họ.

Các paper hiện có lấy từ trang ResearchGate của lab và trang publications của thầy, metadata (tác giả, nơi đăng, DOI) đối chiếu qua Crossref.

## Nội dung chung

Tên lab, link GitHub, địa điểm cạnh đồng hồ: `content/site.ts`.

## Deploy

Site chạy trên Vercel (project `hamvoc`). Khi repo đã được nối với Vercel, mỗi lần push lên `main` sẽ tự deploy production.

Deploy tay từ máy (cần `vercel login` và `vercel link` trước):

```bash
vercel --prod
```

Bước build trên Vercel là `npm run build` (khai báo trong `vercel.json`): xử lý ảnh chân dung, đăng các PDF, rồi `next build`.

## Cấu trúc

```
app/                    route: trang chủ, /research, /people/[slug]
components/             Hero (lineup chân dung), Roster, PaperList, FitName, …
content/people/         một file .yml cho mỗi người + photos/
content/research/       journal/ và conference/, mỗi file .yml một paper
content/site.ts         thông tin chung của lab
lib/people.ts           đọc và sắp xếp dữ liệu thành viên
lib/papers.ts           đọc paper, nối tác giả với thành viên
scripts/portraits.mjs   xử lý ảnh → public/people/ (file sinh ra, không commit)
scripts/papers.mjs      đăng PDF → public/papers/ (file sinh ra, không commit)
```
