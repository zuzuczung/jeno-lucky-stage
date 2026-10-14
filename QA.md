# Kiểm tra JENO’S LUCKY STAGE — 14/10/2026

Ưu tiên bàn giao desktop/máy chiếu theo yêu cầu cập nhật. Kiểm tra UI bằng Codex In-app Browser trên máy Mac, viewport desktop 1440×1000 và 1920×1080. Ảnh chụp là website đang chạy, không phải mockup.

## Kiểm tra tự động

| Lệnh             | Kết quả                     |
| ---------------- | --------------------------- |
| `pnpm typecheck` | Đạt, TypeScript strict      |
| `pnpm lint`      | Đạt, không lỗi/cảnh báo     |
| `pnpm test`      | 22/22 đạt, hai bộ kiểm thử  |
| `pnpm build`     | Đạt, bản tĩnh trong `dist/` |

Các trường hợp: rejection sampling loại đuôi bị lệch; lấy mẫu không hoàn lại; số lượng sai; ID và No Repeat sau sửa tên; chốt một lần và reload/skip giữ kết quả; một học sinh/hết người/reset/allow repeat; nhiều fan; thay lớp/nối lớp/lịch sử tách lớp; tên trùng khác mã; tên trùng không mã có ID khác nhau; dữ liệu lưu hỏng và quota; CSV escape dấu nháy, dấu phẩy, xuống dòng và tiếng Việt; vị trí ổn định cho 40/60/100 fan.

Parser được kiểm tra với XLSX nhiều sheet và cột họ/đệm + tên; CSV BOM với dấu phẩy/chấm phẩy/tab và quoted cells; TXT có STT, dòng trống, tiêu đề, tổng kết; DOCX bảng/danh sách với text chia nhiều run; chọn cột không chắc; dòng thiếu tên; file rỗng/hỏng/sai định dạng/quá dung lượng; kiểm tra nhóm trùng.

## Kiểm tra thao tác trên website

| Thao tác                       | Bằng chứng đã quan sát                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| Import CSV mẫu                 | Preview nhận 40, chỉ thay sau xác nhận, DOM có đúng 40 nhân vật                                    |
| XLSX nhiều sheet               | Đề xuất sheet lớp, ghép đúng “Nguyễn Minh Anh”, giữ riêng A01 và A02                               |
| DOCX bảng, DOCX danh sách, TXT | Preview lần lượt nhận 2, 2, 3 fan đúng fixture                                                     |
| File XLSX hỏng                 | Báo lỗi, lớp 40 hiện tại và nút Go to Concert được giữ                                             |
| CSV hai tên trùng không mã     | Nút xác nhận bị khóa trước khi đánh dấu giữ các dòng đã kiểm tra                                   |
| Lớp 60/100                     | DOM lần lượt có đúng 60/100 nhân vật, không cắt bớt roster                                         |
| Double-click nút chọn          | Một kết quả, một bản ghi lịch sử                                                                   |
| Chọn tiếp                      | Fan trước bị loại khỏi tập đủ điều kiện; nhân vật trở về crowd với dấu đã gọi                      |
| Đường lên sân khấu             | Nhân vật đang di chuyển tồn tại, bắt đầu ở crowd, đi qua lối giữa rồi đứng cạnh Jeno               |
| Chọn 3 fan                     | Công bố ba kết quả, ba nhân vật đứng trên sân khấu, giữ riêng hai người cùng tên khác mã           |
| Hết người / Reset Round        | Sau gọi cả 3 còn 0; reset trả về 3 đủ điều kiện và giữ lịch sử                                     |
| Reload giữa lượt               | Reveal giữ kết quả đã chốt, đối chiếu trùng lịch sử; không tăng số bản ghi                         |
| Skip Animation                 | Tên đã chốt trong lịch sử trước skip trùng tên Reveal sau skip                                     |
| Sửa tên fan đã gọi             | Nhãn tên đổi, dấu đã gọi giữ nguyên                                                                |
| Allow Repeat                   | Lớp 100 đã gọi 2: bật Allow Repeat có 100 đủ điều kiện, bật lại No Repeat còn 98                   |
| Tải/crop ảnh mặt               | Blob gắn trong đầu SVG; zoom chỉnh từ 1.00 lên 1.15 vẫn giữ sau reload; gỡ ảnh trở về đầu minh họa |
| Reduced Motion                 | Đi thẳng đến Reveal, vẫn có kết quả và dấu nhận biết                                               |
| Export History                 | File tải được, BOM `EF BB BF`, họ tên tiếng Việt đúng; escape được kiểm tra tự động                |

Một lần kiểm tra bổ sung mobile 390×844 đã thực hiện trước yêu cầu bỏ ưu tiên mobile: trang không tràn ngang (`scrollWidth = 390`), crowd có vùng cuộn riêng và có thể chạm fan thứ 100 để đọc toàn bộ tên. Không tiếp tục tối ưu mobile sau yêu cầu cập nhật.

## Kiểm tra bản production và máy chiếu

Bản `dist/` được chạy bằng Vite preview trên localhost, rồi thao tác lại Welcome → Fan Zone → Concert → Reveal → chọn tiếp. Console không có error/warn mới trong lượt kiểm tra production cuối.

Ở viewport 1920×1080, chế độ TRÌNH CHIẾU giữ nguyên khi chuyển sang Reveal. Concert có `documentHeight = 1080`, đáy nút chọn ở 1016 px. Reveal một fan dùng tên cỡ 86.4 px, các nút nằm trong khung 1080 px. Lượt 5 fan có đúng 5 tên/5 nhân vật trên sân khấu, vẫn giữ các nút trong khung. Sau QA bản đầu đã để lớp mẫu 40 fan, một fan mỗi lượt, tiếng Việt, Normal, No Repeat, Sound OFF, một vòng mới sẵn sàng.

Đã thử đổi VI/EN trên bản production. File lịch sử tải qua UI có BOM `EF BB BF` và giữ đúng dấu tiếng Việt.

## Cập nhật ảnh Jeno và nhạc nền

- Bổ sung ảnh Jeno thật 589×814 từ Wikimedia Commons (K-POPIT / CC BY 3.0), không gọi ảnh ngoài khi sử dụng. Giữ JPEG gốc, dùng CSS/SVG crop cho ảnh lớn và khuôn mặt động.
- Sân khấu chuyển sang SVG panorama tự co giãn 1200–1800 đơn vị, có portrait panel cạnh sân khấu. Nhân vật giữ tỉ lệ, spotlight và đường đi dùng tọa độ mới.
- Nhạc mẫu Lucky Stage Beat: instrumental nguyên bản được tổng hợp bằng code, WAV PCM16 mono 44.1 kHz, 17.143 giây. Đã kiểm tra qua HTML audio: metadata tải được, `paused = false` khi bấm Phát, timeline tăng.
- Đã tải file WAV qua file chooser, phục hồi tên/duration qua reload và xác nhận `pausedAfterReload = true`.
- File MP3 hỏng báo lỗi, giữ bài đã chọn và nguyên 40 nhân vật. Bộ lọc nhận MP3/M4A/WAV/OGG/FLAC; codec phụ thuộc trình duyệt, chưa thử mọi tổ hợp codec của M4A/FLAC.
- Đổi VI/EN khi nhạc đang phát không ngắt bài. Có chỉnh âm lượng, lặp và chế độ hạ nhạc theo lượt chọn.
- Đã nhập file TXT 20 học sinh, chạy spotlight và fan đi lên sân khấu với ảnh mới trong lúc nhạc nền đang phát.
- Hai kiểm thử mới kiểm tra nâng cấp dữ liệu v1 sang cài đặt nhạc mà giữ roster/ID/lịch sử/kết quả đã chốt, và xử lý cài đặt nhạc lỗi an toàn.

Ảnh mới: `09-jeno-music-desktop.jpg`, `10-jeno-inviting-with-music.jpg` và `11-jeno-reveal-with-music.jpg`. Các ảnh 01–08 là bằng chứng cho bản trước cập nhật ảnh/nhạc.

## Ảnh chụp

Các tệp ở thư mục `../screenshots/` cạnh dự án:

- `01-welcome-desktop.jpg`
- `02-fanzone-desktop.jpg`
- `03-concert-desktop.jpg`
- `04-reveal-desktop.jpg`
- `05-inviting-desktop.jpg` — lượt đang mời fan lên sân khấu.
- `06-multiple-fans-desktop.jpg` — ba fan trên sân khấu.
- `08-five-fans-projector.jpg` — năm fan trong chế độ trình chiếu.
- `07-class-100-mobile.jpg` — bằng chứng cuộn tới fan thứ 100.

## Giới hạn kiểm chứng

- Bản cập nhật đã có ảnh Jeno thật bundle tại chỗ, có credit và crop bằng SVG/CSS. Cơ chế thay ảnh cá nhân vẫn giữ nguyên.
- Chưa thử trên máy chiếu vật lý, Safari hoặc Firefox. Khả năng đọc từ cuối phòng phụ thuộc thiết bị và độ sáng; chế độ trình chiếu dùng tên lớn và bố cục giữ nút chọn trong khung.
- Fullscreen phụ thuộc hỗ trợ của trình duyệt. Ứng dụng giữ bố cục máy chiếu ngay cả khi trình duyệt rời native fullscreen; nút THOÁT tắt bố cục này.
- Âm thanh được smoke-test qua thao tác ON/OFF và Web Audio; chưa đo âm lượng loa thực tế. Đã có nhạc nền mẫu và cơ chế tải file nhạc riêng; nhạc mẫu không phải một bản thu NCT.
- Không có service worker; chưa kiểm thử/bảo đảm reload offline. Không hỗ trợ PDF hoặc `.doc`.
- File có layout khác mẫu phải kiểm tra cột và preview. Dòng bỏ qua được báo rõ; dữ liệu không tự cập nhật khi import chưa xác nhận.

## Bố cục sân khấu lớn · 14/10/2026

- Nhạc chuyển lên header thành nút nhỏ; bảng điều khiển mặc định ẩn và mở nổi, không làm thay đổi chiều cao sân khấu. Đã xác nhận đóng bảng khi nhạc đang phát vẫn giữ `paused = false` và thời gian tiếp tục chạy. Đóng bảng trả focus về nút Nhạc.
- Thu gọn tiêu đề/số liệu, thanh Spotlight và nút chọn. Cảnh SVG thích ứng theo khung, giữ tỉ lệ nhân vật và cập nhật tâm spotlight/đường đi theo bề ngang thực tế.
- Kiểm tra 1920×1080: vùng cảnh cao 823 px, thanh chọn 52 px; chiều cao trang đúng 1080 px. Kiểm tra 1440×900 và chế độ máy chiếu: vùng cảnh 643 px, trang đúng 900 px; toàn bộ nút chọn nhìn thấy, không cần cuộn.
- Lượt chọn từ 20 fan đã đi qua scanning/countdown/inviting tới Reveal, chỉ tăng đã gọi từ 1 lên 2. Không có console error/warning mới.
- ESLint, TypeScript/build và 22 kiểm thử đều thành công.
- Ảnh mới: `12-compact-stage-desktop.jpg`, `13-floating-music-controls.jpg`.

## Kỹ xảo sân khấu và khán giả · 14/10/2026

- Bổ sung 2 pháo hoa SVG hai cánh sân khấu, 18 tia lửa, laser giao nhau và 13 đèn rig. Trên khung 1440×900, cảnh cao 643 px, trang cao đúng 900 px, không cần cuộn.
- 20 fan thử nghiệm đều xuất hiện; có 17 nguồn sáng lightstick/điện thoại trong lớp mẫu. Đã xem fan quét spotlight, một lượt Reveal và pháo giấy trên canvas. Hai pháo hoa chạy đồng thời lúc Reveal.
- Khán giả nhảy/vẫy nhanh hơn, có dấu cổ vũ và nguồn sáng. Người bật Giảm chuyển động thấy bố cục tĩnh; pháo giấy không chạy.
- Console không có error/warning mới; TypeScript/build, ESLint và 22 kiểm thử đều đạt.
- Ảnh mới: `14-stage-fireworks.jpg`, `15-cheering-crowd.jpg`.
