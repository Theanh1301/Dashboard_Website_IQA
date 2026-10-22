/**
 * ===================================================================
 * BẢNG ĐIỀU KHIỂN TỔNG QUAN - HỆ THỐNG QUẢN TRỊ TRANG CHỦ (INDEX3)
 * Viện Quản lý chất lượng và Khảo thí
 * Đồng bộ Google Sheet: https://docs.google.com/spreadsheets/d/1Z70EDNp9lg1DPrAAUMmpMGf6f_rYEVZTZ2VqpRfpWpw/edit?gid=0#gid=0
 * Sheet ID: 1Z70EDNp9lg1DPrAAUMmpMGf6f_rYEVZTZ2VqpRfpWpw | GID: 0
 * ===================================================================
 */


const DEFAULT_SHEET3_URL = "https://docs.google.com/spreadsheets/d/1Z70EDNp9lg1DPrAAUMmpMGf6f_rYEVZTZ2VqpRfpWpw/edit?gid=0#gid=0";
const DEFAULT_SHEET3_ID = "1Z70EDNp9lg1DPrAAUMmpMGf6f_rYEVZTZ2VqpRfpWpw";
const DEFAULT_SHEET3_GID = "0";

// Dữ liệu mặc định ban đầu được trích xuất chính xác 100% từ Google Sheet
const INITIAL_YEARLY_DATA = {
    2025: [
        { month: 1, monthName: "Tháng 1", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 2, monthName: "Tháng 2", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 3, monthName: "Tháng 3", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 4, monthName: "Tháng 4", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 5, monthName: "Tháng 5", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 6, monthName: "Tháng 6", images: 70, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 20, staff: 2, pages: 29 },
        { month: 7, monthName: "Tháng 7", images: 119, publishedPosts: 29, pendingPosts: 0, reports: 0, announcements: 0, categories: 8, staff: 1, pages: 7 },
        { month: 8, monthName: "Tháng 8", images: 19, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 1, pages: 0 },
        { month: 9, monthName: "Tháng 9", images: 26, publishedPosts: 3, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 5, pages: 0 },
        { month: 10, monthName: "Tháng 10", images: 57, publishedPosts: 8, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 1, pages: 0 },
        { month: 11, monthName: "Tháng 11", images: 80, publishedPosts: 11, pendingPosts: 0, reports: 0, announcements: 2, categories: 7, staff: 0, pages: 1 },
        { month: 12, monthName: "Tháng 12", images: 24, publishedPosts: 9, pendingPosts: 0, reports: 0, announcements: 4, categories: 0, staff: 0, pages: 0 }
    ],
    2026: [
        { month: 1, monthName: "Tháng 1", images: 43, publishedPosts: 5, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 1, pages: 0 },
        { month: 2, monthName: "Tháng 2", images: 17, publishedPosts: 6, pendingPosts: 0, reports: 0, announcements: 1, categories: 0, staff: 0, pages: 0 },
        { month: 3, monthName: "Tháng 3", images: 59, publishedPosts: 7, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 4, monthName: "Tháng 4", images: 27, publishedPosts: 7, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 5, monthName: "Tháng 5", images: 44, publishedPosts: 5, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 6, monthName: "Tháng 6", images: 8, publishedPosts: 3, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 7, monthName: "Tháng 7", images: 9, publishedPosts: 3, pendingPosts: 0, reports: 0, announcements: 1, categories: 2, staff: 1, pages: 0 },
        { month: 8, monthName: "Tháng 8", images: 30, publishedPosts: 7, pendingPosts: 0, reports: 1, announcements: 2, categories: 1, staff: 0, pages: 1 },
        { month: 9, monthName: "Tháng 9", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 2, pages: 0 },
        { month: 10, monthName: "Tháng 10", images: 10, publishedPosts: 2, pendingPosts: 0, reports: 0, announcements: 0, categories: 5, staff: 0, pages: 5 },
        { month: 11, monthName: "Tháng 11", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 12, monthName: "Tháng 12", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 }
    ],
    2027: [
        { month: 1, monthName: "Tháng 1", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 2, monthName: "Tháng 2", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 3, monthName: "Tháng 3", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 4, monthName: "Tháng 4", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 5, monthName: "Tháng 5", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 6, monthName: "Tháng 6", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 7, monthName: "Tháng 7", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 8, monthName: "Tháng 8", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 9, monthName: "Tháng 9", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 10, monthName: "Tháng 10", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 11, monthName: "Tháng 11", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 12, monthName: "Tháng 12", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 }
    ],
    2028: [
        { month: 1, monthName: "Tháng 1", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 2, monthName: "Tháng 2", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 3, monthName: "Tháng 3", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 4, monthName: "Tháng 4", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 5, monthName: "Tháng 5", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 6, monthName: "Tháng 6", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 7, monthName: "Tháng 7", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 8, monthName: "Tháng 8", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 9, monthName: "Tháng 9", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 10, monthName: "Tháng 10", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 11, monthName: "Tháng 11", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 },
        { month: 12, monthName: "Tháng 12", images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0 }
    ]
};

// Cấu hình thông tin hệ thống tổng quát (Tính lũy kế toàn bộ các năm từ dữ liệu thực tế)
const SYSTEM_METRICS_INFO = {
    totalStaff: 14,
    staffBreakdown: "14 cán bộ quản trị & chuyên viên",
    totalCategoriesAllTime: 43,
    totalPagesAllTime: 43,
    totalMediaAllTime: 642,
    totalPostsAllTime: 105,
    totalAnnouncementsAllTime: 10,
    totalReportsAllTime: 1
};

/**
 * Tách thông tin Sheet ID và GID từ liên kết Google Sheet
 */
function extractSheetInfo3(url) {
    if (!url) return { sheetId: DEFAULT_SHEET3_ID, gid: DEFAULT_SHEET3_GID };
    const matchId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = matchId ? matchId[1] : DEFAULT_SHEET3_ID;
    let gid = DEFAULT_SHEET3_GID;
    const matchGid = url.match(/[#&?]gid=([0-9]+)/);
    if (matchGid) {
        gid = matchGid[1];
    }
    return { sheetId, gid };
}

/**
 * Nhận diện tự động vị trí cột theo tiêu đề tiếng Việt / tiếng Anh
 */
function detectColumnMap3(headerRow) {
    const map = {
        images: 1,
        published: 2,
        pending: 3,
        reports: 4,
        announcements: 5,
        categories: 6,
        staff: 7,
        pages: 8
    };
    if (!Array.isArray(headerRow)) return map;

    headerRow.forEach((cell, idx) => {
        const txt = String(cell || '').toLowerCase().trim();
        if (txt.includes('ảnh') || txt.includes('media') || txt.includes('image')) map.images = idx;
        else if (txt.includes('đã đăng') || txt.includes('xuất bản') || txt.includes('bài đã')) map.published = idx;
        else if (txt.includes('chờ đăng') || txt.includes('xét duyệt') || txt.includes('chờ')) map.pending = idx;
        else if (txt.includes('báo cáo') || txt.includes('report')) map.reports = idx;
        else if (txt.includes('thông báo') || txt.includes('notice')) map.announcements = idx;
        else if (txt.includes('danh mục') || txt.includes('chuyên mục') || txt.includes('category')) map.categories = idx;
        else if (txt.includes('nhân sự') || txt.includes('cán bộ') || txt.includes('staff')) map.staff = idx;
        else if (txt.includes('trang') || txt.includes('phân hệ') || txt.includes('page')) map.pages = idx;
    });

    return map;
}

/**
 * Phân tích danh sách các hàng dữ liệu (từ CSV hoặc JSONP)
 */
function parseGoogleSheetRows3(rows) {
    if (!rows || rows.length < 2) return null;

    const result = {
        2025: [],
        2026: [],
        2027: [],
        2028: []
    };

    let activeYear = 2025;
    const colMap = detectColumnMap3(rows[0]);

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = String(row[0] || '').trim();

        // Kiểm tra nhận diện năm
        if (firstCell.includes("2025")) {
            activeYear = 2025;
            continue;
        } else if (firstCell.includes("2026")) {
            activeYear = 2026;
            continue;
        } else if (firstCell.includes("2027")) {
            activeYear = 2027;
            continue;
        } else if (firstCell.includes("2028")) {
            activeYear = 2028;
            continue;
        }

        // Nhận diện dòng tháng: "Tháng 1" ... "Tháng 12"
        const matchMonth = firstCell.match(/Tháng\s*(\d+)/i);
        if (matchMonth) {
            const mNum = parseInt(matchMonth[1], 10);
            if (mNum >= 1 && mNum <= 12) {
                const parseVal = (idx) => {
                    if (idx === undefined || idx < 0 || idx >= row.length) return 0;
                    const raw = String(row[idx] || '0').replace(/[^0-9]/g, '');
                    return parseInt(raw, 10) || 0;
                };

                const monthObj = {
                    month: mNum,
                    monthName: `Tháng ${mNum}`,
                    images: parseVal(colMap.images),
                    publishedPosts: parseVal(colMap.published),
                    pendingPosts: parseVal(colMap.pending),
                    reports: parseVal(colMap.reports),
                    announcements: parseVal(colMap.announcements),
                    categories: parseVal(colMap.categories),
                    staff: parseVal(colMap.staff),
                    pages: parseVal(colMap.pages)
                };

                if (!result[activeYear]) result[activeYear] = [];
                // Cập nhật hoặc đẩy vào mảng
                const existingIdx = result[activeYear].findIndex(item => item.month === mNum);
                if (existingIdx >= 0) {
                    result[activeYear][existingIdx] = monthObj;
                } else {
                    result[activeYear].push(monthObj);
                }
            }
        }
    }

    // Đảm bảo mỗi năm có đủ 12 tháng chuẩn mực
    [2025, 2026, 2027, 2028].forEach(y => {
        if (!result[y] || result[y].length === 0) {
            result[y] = JSON.parse(JSON.stringify(INITIAL_YEARLY_DATA[y] || []));
        } else {
            // Sắp xếp theo thứ tự tháng 1..12
            result[y].sort((a, b) => a.month - b.month);
            // Bổ sung nếu thiếu tháng
            for (let m = 1; m <= 12; m++) {
                if (!result[y].some(item => item.month === m)) {
                    result[y].push({
                        month: m,
                        monthName: `Tháng ${m}`,
                        images: 0,
                        publishedPosts: 0,
                        pendingPosts: 0,
                        reports: 0,
                        announcements: 0,
                        categories: 0,
                        staff: 0,
                        pages: 0
                    });
                }
            }
            result[y].sort((a, b) => a.month - b.month);
        }
    });

    return result;
}

/**
 * Hàm phân tích cú pháp chuỗi CSV từ Google Sheet
 */
function parseGoogleSheetCSV3(csvString) {
    if (!csvString || typeof csvString !== 'string') return null;

    let rows = [];
    if (typeof Papa !== 'undefined') {
        const parsed = Papa.parse(csvString, { skipEmptyLines: true });
        rows = parsed.data;
    } else {
        rows = csvString.split('\n').map(line => {
            return line.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
        });
    }

    return parseGoogleSheetRows3(rows);
}
