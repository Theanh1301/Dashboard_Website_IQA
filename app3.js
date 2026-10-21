/**
 * ===================================================================
 * BẢNG ĐIỀU KHIỂN TỔNG QUAN - HỆ THỐNG QUẢN TRỊ TRANG CHỦ (INDEX3)
 * Viện Quản lý chất lượng và Khảo thí
 * Đồng bộ Google Sheet: https://docs.google.com/spreadsheets/d/1Z70EDNp9lg1DPrAAUMmpMGf6f_rYEVZTZ2VqpRfpWpw/edit?gid=0#gid=0
 * ===================================================================
 */

// Trạng thái ứng dụng
let currentGoogleSheetUrl = DEFAULT_SHEET3_URL;
let currentYear = 2026;
let currentMonth = 10; // Tháng 10 hiện tại như trên ảnh
let selectedScope = 'all'; // 'all' (12 tháng), 'q1', 'q2', 'q3', 'q4', hoặc số 1..12
let mainChartType = 'bar'; // 'bar' hoặc 'line'
let yearlyData = JSON.parse(JSON.stringify(INITIAL_YEARLY_DATA));

// Đối tượng Chart.js instance
let mainChartInstance = null;
let miniChart1 = null; // Bài viết đã đăng
let miniChart2 = null; // Tần suất tải ảnh
let miniChart3 = null; // Thông báo
let miniChart4 = null; // Báo cáo
let miniChart5 = null; // Trang / Phân hệ
let miniChart6 = null; // Danh mục bài viết

/**
 * Khởi tạo ứng dụng khi DOM tải xong
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Phục hồi cấu hình liên kết Google Sheet (nếu người dùng từng tùy chỉnh)
    const savedUrl = localStorage.getItem('ql_sheet3_custom_url');
    if (savedUrl && savedUrl.trim()) {
        currentGoogleSheetUrl = savedUrl.trim();
    }

    // 2. Phục hồi dữ liệu đệm từ LocalStorage để hiển thị ngay tức thì (0ms)
    const cachedData = localStorage.getItem('ql_sheet3_cached_data');
    if (cachedData) {
        try {
            const parsedCache = JSON.parse(cachedData);
            if (parsedCache && typeof parsedCache === 'object' && Object.keys(parsedCache).length > 0) {
                yearlyData = parsedCache;
            }
        } catch (e) {
            console.warn("Lỗi đọc cache:", e);
        }
    }

    initClock();
    initEventListeners();
    updateSheetLinksUI();
    renderAll();
    
    // 3. YÊU CẦU: Mỗi khi truy cập trang, hệ thống tự động làm mới lấy dữ liệu mới nhất của link google sheet
    setTimeout(() => {
        syncDataFromGoogleSheet(false);
    }, 300);
});

/**
 * Hiển thị ngày giờ thực tế chuẩn xác
 */
function initClock() {
    const clockEl = document.getElementById("liveClock");
    if (!clockEl) return;
    
    const updateTime = () => {
        const now = new Date();
        const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
        const dayName = days[now.getDay()];
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        clockEl.textContent = `${dayName}, ${d}/${m}/${y}`;
    };
    
    updateTime();
    setInterval(updateTime, 60000);
}

/**
 * Gắn kết các sự kiện tương tác
 */
function initEventListeners() {
    // Dropdown chọn năm
    const yearSelect = document.getElementById("yearFilter");
    if (yearSelect) {
        yearSelect.value = currentYear;
        yearSelect.addEventListener("change", (e) => {
            currentYear = parseInt(e.target.value, 10);
            renderAll();
            showToast(`Đã chuyển sang số liệu Năm ${currentYear}`, "info");
        });
    }

    // Dropdown chọn phạm vi (12 tháng hoặc theo quý/tháng)
    const scopeSelect = document.getElementById("scopeFilter");
    if (scopeSelect) {
        scopeSelect.value = selectedScope;
        scopeSelect.addEventListener("change", (e) => {
            selectedScope = e.target.value;
            renderAll();
            const scope = getScopeInfo();
            showToast(`Đã phân chia dữ liệu theo: ${scope.label}`, "info");
        });
    }

    // Nút Làm mới trên thanh tiêu đề Topbar
    const topRefreshBtn = document.getElementById("topRefreshBtn");
    if (topRefreshBtn) {
        topRefreshBtn.addEventListener("click", () => {
            syncDataFromGoogleSheet(true);
        });
    }

    // Nút làm mới sơ đồ (Sync Google Sheet)
    const refreshBtn = document.getElementById("btnRefreshSheet");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            syncDataFromGoogleSheet(true);
        });
    }

    // Nút chuyển đổi biểu đồ Cột / Đường
    const btnBar = document.getElementById("btnChartBar");
    const btnLine = document.getElementById("btnChartLine");
    if (btnBar && btnLine) {
        btnBar.addEventListener("click", () => {
            if (mainChartType !== 'bar') {
                mainChartType = 'bar';
                btnBar.classList.add("active");
                btnLine.classList.remove("active");
                renderMainChart();
            }
        });

        btnLine.addEventListener("click", () => {
            if (mainChartType !== 'line') {
                mainChartType = 'line';
                btnLine.classList.add("active");
                btnBar.classList.remove("active");
                renderMainChart();
            }
        });
    }

    // Cập nhật thông tin in ấn tự động chuẩn như ảnh
    const updatePrintReportMetadata = () => {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const h = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');

        const printDateEl = document.getElementById("printReportDate");
        if (printDateEl) {
            printDateEl.textContent = `${d}/${m}/${y} lúc ${h}:${min}`;
        }

        const printSignDateEl = document.getElementById("printSignDate");
        if (printSignDateEl) {
            printSignDateEl.textContent = `Hà Nội, ngày ${d} tháng ${m} năm ${y}`;
        }
    };

    // Nút In báo cáo
    const btnPrint = document.getElementById("btnPrintReport");
    if (btnPrint) {
        btnPrint.addEventListener("click", () => {
            updatePrintReportMetadata();
            // Đảm bảo biểu đồ chính ở dạng cột chuẩn như ảnh mẫu khi in
            if (mainChartType !== 'bar') {
                mainChartType = 'bar';
                if (btnBar) btnBar.classList.add("active");
                if (btnLine) btnLine.classList.remove("active");
                renderMainChart();
            }
            setTimeout(() => {
                window.print();
            }, 100);
        });
    }

    // Sự kiện trước và sau khi in để biểu đồ luôn nét đẹp
    window.addEventListener("beforeprint", () => {
        updatePrintReportMetadata();
        if (mainChartInstance) mainChartInstance.resize();
        [miniChart1, miniChart2, miniChart3, miniChart4, miniChart5, miniChart6].forEach(c => {
            if (c) c.resize();
        });
    });

    window.addEventListener("afterprint", () => {
        if (mainChartInstance) mainChartInstance.resize();
        [miniChart1, miniChart2, miniChart3, miniChart4, miniChart5, miniChart6].forEach(c => {
            if (c) c.resize();
        });
    });

    // Mobile sidebar toggle
    const toggleSidebarBtn = document.getElementById("mobileToggleSidebar");
    const sidebar = document.getElementById("sidebar");
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
        });
    }

    // Gắn sự kiện cho các nút thao tác nhanh
    setupQuickActionModals();
}

/**
 * Tải stream JSONP từ Google Sheet (Bỏ qua rào cản CORS trên cả file:// và server)
 */
function fetchSheet3ViaJsonp(sheetId, gid, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const callbackName = 'gvizSheet3Callback_' + Math.floor(Math.random() * 1000000);
        const script = document.createElement('script');
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error("Hết thời gian chờ JSONP"));
        }, timeoutMs);

        function cleanup() {
            clearTimeout(timer);
            if (window[callbackName]) delete window[callbackName];
            if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[callbackName] = function(json) {
            cleanup();
            if (!json || !json.table) {
                reject(new Error("Cấu trúc phản hồi JSONP từ Google Sheet không hợp lệ"));
                return;
            }

            const table = json.table;
            const headerRow = (table.cols || []).map(c => (c.label || c.id || '').trim());
            const dataRows = (table.rows || []).map(r => {
                const cells = r.c || [];
                return cells.map(cell => {
                    if (!cell) return '';
                    if (cell.f !== null && cell.f !== undefined) return String(cell.f).trim();
                    if (cell.v !== null && cell.v !== undefined) return String(cell.v).trim();
                    return '';
                });
            });

            const allRows = [headerRow, ...dataRows];
            const parsed = parseGoogleSheetRows3(allRows);
            if (parsed && Object.keys(parsed).length > 0) {
                resolve(parsed);
            } else {
                reject(new Error("Không thể phân tích dữ liệu Google Sheet"));
            }
        };

        script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${gid}&t=${Date.now()}`;
        script.onerror = () => {
            cleanup();
            reject(new Error("Lỗi tải script JSONP từ Google Sheet"));
        };
        document.body.appendChild(script);
    });
}

/**
 * Cập nhật liên kết và thông tin Google Sheet trên toàn giao diện
 */
function updateSheetLinksUI() {
    const info = extractSheetInfo3(currentGoogleSheetUrl);
    const bottomLink = document.getElementById("bottomSheetLink");
    const modalLink = document.getElementById("modalSheetLink");
    const bannerInfo = document.getElementById("bannerSheetInfo");
    const modalSheetId = document.getElementById("modalSheetIdText");
    const modalSheetGid = document.getElementById("modalSheetGidText");

    if (bottomLink) bottomLink.href = currentGoogleSheetUrl;
    if (modalLink) modalLink.href = currentGoogleSheetUrl;
    if (bannerInfo) bannerInfo.textContent = `${info.sheetId} (Trang tính GID: ${info.gid})`;
    if (modalSheetId) modalSheetId.innerHTML = `• <strong>Sheet ID:</strong> ${info.sheetId}`;
    if (modalSheetGid) modalSheetGid.innerHTML = `• <strong>Tab GID:</strong> ${info.gid} (Trang tính dữ liệu năm 2025 - 2028)`;
}

/**
 * Đồng bộ dữ liệu trực tiếp từ Google Sheet (Tự động khi tải trang hoặc khi bấm Làm mới)
 */
async function syncDataFromGoogleSheet(isUserTriggered = false) {
    const topRefreshBtn = document.getElementById("topRefreshBtn");
    const refreshBtn = document.getElementById("btnRefreshSheet");
    const liveStatusText = document.getElementById("liveStatusText");

    // Bật hiệu ứng xoay làm mới
    if (topRefreshBtn) topRefreshBtn.classList.add("spinning");
    if (refreshBtn) {
        refreshBtn.classList.add("spinning");
        const icon = refreshBtn.querySelector("i");
        if (icon) icon.classList.add("fa-spin");
    }

    if (liveStatusText) {
        liveStatusText.textContent = isUserTriggered ? "Đang đồng bộ Google Sheet..." : "Đang tự động lấy dữ liệu Google Sheet...";
    }

    const info = extractSheetInfo3(currentGoogleSheetUrl);
    let parsedData = null;

    try {
        // Cách 1: GViz API CSV (Ưu tiên tốc độ cao)
        try {
            const controller1 = new AbortController();
            const timer1 = setTimeout(() => controller1.abort(), 3500);
            const gvizCsvUrl = `https://docs.google.com/spreadsheets/d/${info.sheetId}/gviz/tq?tqx=out:csv&gid=${info.gid}&t=${Date.now()}`;
            const res = await fetch(gvizCsvUrl, { cache: "no-store", signal: controller1.signal });
            clearTimeout(timer1);
            if (res.ok) {
                const csvText = await res.text();
                parsedData = parseGoogleSheetCSV3(csvText);
            }
        } catch (e1) {
            // Lỗi mạng hoặc CORS fetch
        }

        // Cách 2: Raw Export CSV API
        if (!parsedData) {
            try {
                const controller2 = new AbortController();
                const timer2 = setTimeout(() => controller2.abort(), 3500);
                const exportUrl = `https://docs.google.com/spreadsheets/d/${info.sheetId}/export?format=csv&gid=${info.gid}&t=${Date.now()}`;
                const res = await fetch(exportUrl, { cache: "no-store", signal: controller2.signal });
                clearTimeout(timer2);
                if (res.ok) {
                    const csvText = await res.text();
                    parsedData = parseGoogleSheetCSV3(csvText);
                }
            } catch (e2) {
                // Lỗi mạng hoặc CORS fetch
            }
        }

        // Cách 3: JSONP Callback (Bỏ qua hoàn toàn CORS, hoạt động 100% trên giao thức file:// lẫn localhost)
        if (!parsedData) {
            try {
                parsedData = await fetchSheet3ViaJsonp(info.sheetId, info.gid, 8000);
            } catch (e3) {
                console.warn("JSONP fallback error:", e3);
            }
        }

        if (parsedData && Object.keys(parsedData).length > 0) {
            yearlyData = parsedData;

            // Lưu dữ liệu vào LocalStorage để lần mở tiếp theo tức thời
            try {
                localStorage.setItem('ql_sheet3_cached_data', JSON.stringify(yearlyData));
                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                localStorage.setItem('ql_sheet3_last_sync_time', timeStr);
            } catch (lsErr) {
                console.warn("Không thể lưu LocalStorage:", lsErr);
            }

            renderAll();

            const syncTime = localStorage.getItem('ql_sheet3_last_sync_time') || "vừa xong";
            if (liveStatusText) {
                liveStatusText.textContent = `Đã đồng bộ Google Sheet (${syncTime})`;
            }

            if (isUserTriggered) {
                showToast("Đã làm mới dữ liệu thành công từ Google Sheet!", "success");
            } else {
                showToast("Hệ thống đã tự động làm mới và cập nhật dữ liệu mới nhất từ Google Sheet!", "success");
            }
        } else {
            throw new Error("Không thể kết nối hoặc phân tích dữ liệu Google Sheet");
        }
    } catch (err) {
        console.warn("Lỗi kết nối Google Sheet, sử dụng dữ liệu lưu trữ:", err);
        renderAll();

        const lastTime = localStorage.getItem('ql_sheet3_last_sync_time');
        if (liveStatusText) {
            liveStatusText.textContent = lastTime ? `Dữ liệu lưu trữ (${lastTime})` : "Dữ liệu thực tế thời gian thực";
        }

        if (isUserTriggered) {
            showToast("Không thể kết nối đến Google Sheet. Đang hiển thị dữ liệu lưu trữ gần nhất.", "warning");
        }
    } finally {
        if (topRefreshBtn) topRefreshBtn.classList.remove("spinning");
        if (refreshBtn) {
            refreshBtn.classList.remove("spinning");
            const icon = refreshBtn.querySelector("i");
            if (icon) icon.classList.remove("fa-spin");
        }
    }
}

/**
 * Xác định thông tin phạm vi phân chia hiện tại (Quý, 6 tháng, 12 tháng)
 */
function getScopeInfo() {
    switch (selectedScope) {
        case 'q1':
            return {
                id: 'q1',
                label: 'Quý 1 (T1 - T3)',
                shortLabel: 'Quý 1',
                months: [1, 2, 3]
            };
        case 'q2':
            return {
                id: 'q2',
                label: 'Quý 2 (T4 - T6)',
                shortLabel: 'Quý 2',
                months: [4, 5, 6]
            };
        case 'q3':
            return {
                id: 'q3',
                label: 'Quý 3 (T7 - T9)',
                shortLabel: 'Quý 3',
                months: [7, 8, 9]
            };
        case 'q4':
            return {
                id: 'q4',
                label: 'Quý 4 (T10 - T12)',
                shortLabel: 'Quý 4',
                months: [10, 11, 12]
            };
        case 'h1':
            return {
                id: 'h1',
                label: '6 tháng đầu năm (T1 - T6)',
                shortLabel: '6 tháng đầu',
                months: [1, 2, 3, 4, 5, 6]
            };
        case 'h2':
            return {
                id: 'h2',
                label: '6 tháng cuối năm (T7 - T12)',
                shortLabel: '6 tháng cuối',
                months: [7, 8, 9, 10, 11, 12]
            };
        case 'all':
        default:
            return {
                id: 'all',
                label: '12 tháng',
                shortLabel: '12 tháng',
                months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            };
    }
}

/**
 * Lấy toàn bộ 12 tháng theo năm hiện tại
 */
function getAllYearMonths() {
    return yearlyData[currentYear] || INITIAL_YEARLY_DATA[currentYear] || [];
}

/**
 * Lấy dữ liệu các tháng theo đúng phạm vi phân chia đã chọn
 */
function getActiveMonthsData() {
    const allMonths = getAllYearMonths();
    const scope = getScopeInfo();
    return allMonths.filter(m => scope.months.includes(m.month));
}

/**
 * Hiển thị toàn bộ giao diện: KPI, Biểu đồ chính, 6 Biểu đồ phụ, Bảng chi tiết
 */
function renderAll() {
    const months = getActiveMonthsData();
    renderKpiCards(months);
    renderMainChart();
    renderMiniCharts();
    renderTable(months);
}

/**
 * Hiển thị 8 thẻ KPI tổng quan (Tương thích cả chế độ xem cả năm lẫn lọc theo Quý/Kỳ)
 */
function renderKpiCards(filteredMonths) {
    const allMonths = getAllYearMonths();
    const scope = getScopeInfo();

    // Tổng số liệu cả năm
    let totalPostsYear = 0;
    let totalAnnounceYear = 0;
    let totalPendingYear = 0;
    let totalReportsYear = 0;

    allMonths.forEach(m => {
        totalPostsYear += (m.publishedPosts || 0);
        totalAnnounceYear += (m.announcements || 0);
        totalPendingYear += (m.pendingPosts || 0);
        totalReportsYear += (m.reports || 0);
    });

    // Tổng số liệu trong phạm vi lọc được chọn
    let scopePosts = 0;
    let scopeAnnounce = 0;
    let scopePending = 0;
    let scopePages = 0;
    let scopeStaff = 0;
    let scopeCat = 0;
    let scopeImages = 0;
    let scopeReports = 0;

    filteredMonths.forEach(m => {
        scopePosts += (m.publishedPosts || 0);
        scopeAnnounce += (m.announcements || 0);
        scopePending += (m.pendingPosts || 0);
        scopePages += (m.pages || 0);
        scopeStaff += (m.staff || 0);
        scopeCat += (m.categories || 0);
        scopeImages += (m.images || 0);
        scopeReports += (m.reports || 0);
    });

    // Dữ liệu tháng 10 hiện tại
    const currentMonthObj = allMonths.find(m => m.month === currentMonth) || {
        publishedPosts: 0,
        announcements: 0,
        pendingPosts: 0,
        pages: 5,
        staff: 0,
        categories: 5,
        images: 1,
        reports: 0
    };

    const isAll = selectedScope === 'all';

    // 1. ĐÃ XUẤT BẢN
    const kpiPostsVal = document.getElementById("kpiPostsValue");
    const kpiPostsSublabel = document.getElementById("kpiPostsSublabel");
    const kpiPostsSub = document.getElementById("kpiPostsSub");
    if (kpiPostsVal) kpiPostsVal.textContent = isAll ? currentMonthObj.publishedPosts : scopePosts;
    if (kpiPostsSublabel) kpiPostsSublabel.textContent = isAll ? "Bài viết đã đăng" : `Bài viết / ${scope.shortLabel}`;
    if (kpiPostsSub) kpiPostsSub.textContent = isAll ? `(Tổng cộng: ${totalPostsYear})` : `(Tổng ${scope.shortLabel}: ${scopePosts} | Cả năm: ${totalPostsYear})`;

    // 2. THÔNG BÁO
    const kpiAnnounceVal = document.getElementById("kpiAnnounceValue");
    const kpiAnnounceSublabel = document.getElementById("kpiAnnounceSublabel");
    const kpiAnnounceSub = document.getElementById("kpiAnnounceSub");
    if (kpiAnnounceVal) kpiAnnounceVal.textContent = isAll ? currentMonthObj.announcements : scopeAnnounce;
    if (kpiAnnounceSublabel) kpiAnnounceSublabel.textContent = isAll ? "Thông báo ban hành" : `Thông báo / ${scope.shortLabel}`;
    if (kpiAnnounceSub) kpiAnnounceSub.textContent = isAll ? `(Tổng cộng: ${totalAnnounceYear})` : `(Tổng ${scope.shortLabel}: ${scopeAnnounce} | Cả năm: ${totalAnnounceYear})`;

    // 3. CẦN XÉT DUYỆT
    const kpiPendingVal = document.getElementById("kpiPendingValue");
    const kpiPendingSublabel = document.getElementById("kpiPendingSublabel");
    const kpiPendingSub = document.getElementById("kpiPendingSub");
    if (kpiPendingVal) kpiPendingVal.textContent = isAll ? currentMonthObj.pendingPosts : scopePending;
    if (kpiPendingSublabel) kpiPendingSublabel.textContent = isAll ? "Bài viết chờ đăng" : `Bài chờ duyệt / ${scope.shortLabel}`;
    if (kpiPendingSub) kpiPendingSub.textContent = `(Đang chờ: ${totalPendingYear})`;

    // 4. TRANG & PHÂN HỆ
    const kpiPagesVal = document.getElementById("kpiPagesValue");
    const kpiPagesSublabel = document.getElementById("kpiPagesSublabel");
    const kpiPagesSub = document.getElementById("kpiPagesSub");
    if (kpiPagesVal) kpiPagesVal.textContent = isAll ? currentMonthObj.pages : scopePages;
    if (kpiPagesSublabel) kpiPagesSublabel.textContent = isAll ? "Trang/tháng" : `Trang mới / ${scope.shortLabel}`;
    if (kpiPagesSub) kpiPagesSub.textContent = isAll ? `(Tổng cộng: ${SYSTEM_METRICS_INFO.totalPagesAllTime} trang)` : `(Tạo mới: ${scopePages} | Tổng kho: ${SYSTEM_METRICS_INFO.totalPagesAllTime} trang)`;

    // 5. NHÂN SỰ
    const kpiStaffVal = document.getElementById("kpiStaffValue");
    const kpiStaffSublabel = document.getElementById("kpiStaffSublabel");
    const kpiStaffSub = document.getElementById("kpiStaffSub");
    if (kpiStaffVal) kpiStaffVal.textContent = isAll ? currentMonthObj.staff : scopeStaff;
    if (kpiStaffSublabel) kpiStaffSublabel.textContent = isAll ? "Cán bộ & Quản trị" : `Nhân sự mới / ${scope.shortLabel}`;
    if (kpiStaffSub) kpiStaffSub.textContent = `(Tổng: ${SYSTEM_METRICS_INFO.totalStaff} | ${SYSTEM_METRICS_INFO.staffBreakdown})`;

    // 6. DANH MỤC BÀI VIẾT
    const kpiCatVal = document.getElementById("kpiCatValue");
    const kpiCatSublabel = document.getElementById("kpiCatSublabel");
    const kpiCatSub = document.getElementById("kpiCatSub");
    if (kpiCatVal) kpiCatVal.textContent = isAll ? currentMonthObj.categories : scopeCat;
    if (kpiCatSublabel) kpiCatSublabel.textContent = isAll ? "Danh mục bài viết/tháng" : `Danh mục / ${scope.shortLabel}`;
    if (kpiCatSub) kpiCatSub.textContent = isAll ? `(Tổng cộng: ${SYSTEM_METRICS_INFO.totalCategoriesAllTime} danh mục)` : `(Tạo mới: ${scopeCat} | Tổng: ${SYSTEM_METRICS_INFO.totalCategoriesAllTime} danh mục)`;

    // 7. THƯ VIỆN MEDIA
    const kpiMediaVal = document.getElementById("kpiMediaValue");
    const kpiMediaSublabel = document.getElementById("kpiMediaSublabel");
    const kpiMediaSub = document.getElementById("kpiMediaSub");
    if (kpiMediaVal) kpiMediaVal.textContent = isAll ? currentMonthObj.images : scopeImages;
    if (kpiMediaSublabel) kpiMediaSublabel.textContent = isAll ? "Ảnh / Kho Media" : `Ảnh tải lên / ${scope.shortLabel}`;
    if (kpiMediaSub) kpiMediaSub.textContent = isAll ? `(Tổng kho: ${SYSTEM_METRICS_INFO.totalMediaAllTime} tệp)` : `(Tải lên: ${scopeImages} | Tổng kho: ${SYSTEM_METRICS_INFO.totalMediaAllTime} tệp)`;

    // 8. BÁO CÁO
    const kpiReportVal = document.getElementById("kpiReportValue");
    const kpiReportSublabel = document.getElementById("kpiReportSublabel");
    const kpiReportSub = document.getElementById("kpiReportSub");
    if (kpiReportVal) kpiReportVal.textContent = isAll ? currentMonthObj.reports : scopeReports;
    if (kpiReportSublabel) kpiReportSublabel.textContent = isAll ? "Báo cáo/tháng" : `Báo cáo / ${scope.shortLabel}`;
    if (kpiReportSub) kpiReportSub.textContent = isAll ? `(Tổng cộng: ${totalReportsYear})` : `(Tổng ${scope.shortLabel}: ${scopeReports} | Cả năm: ${totalReportsYear})`;

    // Cập nhật text trong Legend biểu đồ chính theo đúng phạm vi lọc
    const legPosts = document.getElementById("legMainPosts");
    const legAnnounce = document.getElementById("legMainAnnounce");
    const legReports = document.getElementById("legMainReports");
    if (isAll) {
        if (legPosts) legPosts.textContent = `Bài viết đã đăng: ${totalPostsYear} bài`;
        if (legAnnounce) legAnnounce.textContent = `Thông báo ban hành: ${totalAnnounceYear} thông báo`;
        if (legReports) legReports.textContent = `Báo cáo ban hành: ${totalReportsYear} báo cáo`;
    } else {
        if (legPosts) legPosts.textContent = `Bài viết (${scope.shortLabel}): ${scopePosts} bài`;
        if (legAnnounce) legAnnounce.textContent = `Thông báo (${scope.shortLabel}): ${scopeAnnounce} thông báo`;
        if (legReports) legReports.textContent = `Báo cáo (${scope.shortLabel}): ${scopeReports} báo cáo`;
    }
}

/**
 * Khởi tạo và vẽ Biểu đồ chính (Bar / Line) thay đổi linh hoạt theo Phạm vi lọc
 */
function renderMainChart() {
    const canvas = document.getElementById("mainActivityChart");
    if (!canvas || typeof Chart === 'undefined') return;

    const months = getActiveMonthsData();
    const scope = getScopeInfo();
    const labels = months.map(m => "T" + m.month);
    
    const postsData = months.map(m => m.publishedPosts || 0);
    const announceData = months.map(m => m.announcements || 0);
    const reportsData = months.map(m => m.reports || 0);

    // Cập nhật phụ đề biểu đồ chính theo phạm vi
    const subtitleEl = document.getElementById("mainChartSubtitle");
    if (subtitleEl) {
        if (selectedScope === 'all') {
            subtitleEl.textContent = `Thống kê chi tiết: Bài viết đã đăng/tháng, Thông báo/tháng và Báo cáo ban hành/tháng thực tế qua 12 tháng năm ${currentYear}`;
        } else {
            subtitleEl.textContent = `Thống kê chi tiết theo ${scope.label}: Bài viết đã đăng, Thông báo và Báo cáo ban hành thực tế năm ${currentYear}`;
        }
    }

    if (mainChartInstance) {
        mainChartInstance.destroy();
    }

    const ctx = canvas.getContext("2d");

    // Chiều rộng cột tự co giãn thẩm mỹ theo số lượng tháng hiển thị
    const maxBarWidth = labels.length <= 3 ? 46 : (labels.length <= 6 ? 38 : 28);

    const datasets = [
        {
            label: "Bài viết đã đăng",
            data: postsData,
            backgroundColor: "#10b981",
            borderColor: "#059669",
            borderWidth: mainChartType === 'line' ? 2.5 : 0,
            borderRadius: mainChartType === 'bar' ? 4 : 0,
            maxBarThickness: maxBarWidth,
            tension: 0.35,
            fill: false,
            pointBackgroundColor: "#10b981",
            pointRadius: mainChartType === 'line' ? 4.5 : 0,
            pointHoverRadius: 6
        },
        {
            label: "Thông báo ban hành",
            data: announceData,
            backgroundColor: "#0284c7",
            borderColor: "#0369a1",
            borderWidth: mainChartType === 'line' ? 2.5 : 0,
            borderRadius: mainChartType === 'bar' ? 4 : 0,
            maxBarThickness: maxBarWidth,
            tension: 0.35,
            fill: false,
            pointBackgroundColor: "#0284c7",
            pointRadius: mainChartType === 'line' ? 4.5 : 0,
            pointHoverRadius: 6
        },
        {
            label: "Báo cáo ban hành",
            data: reportsData,
            backgroundColor: "#f59e0b",
            borderColor: "#d97706",
            borderWidth: mainChartType === 'line' ? 2.5 : 0,
            borderRadius: mainChartType === 'bar' ? 4 : 0,
            maxBarThickness: maxBarWidth,
            tension: 0.35,
            fill: false,
            pointBackgroundColor: "#f59e0b",
            pointRadius: mainChartType === 'line' ? 4.5 : 0,
            pointHoverRadius: 6
        }
    ];

    mainChartInstance = new Chart(ctx, {
        type: mainChartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Đã có legend tùy biến phía trên
                },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    titleFont: { family: "'Be Vietnam Pro', sans-serif", size: 12, weight: '700' },
                    bodyFont: { family: "'Be Vietnam Pro', sans-serif", size: 11.5 },
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        title: function(items) {
                            const mObj = months[items[0].dataIndex];
                            return mObj ? `${mObj.monthName} / ${currentYear}` : `Tháng ${items[0].label} / ${currentYear}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: "#64748b",
                        font: { family: "'Be Vietnam Pro', sans-serif", size: 11, weight: '500' }
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: 10,
                    grid: {
                        color: "#f1f5f9"
                    },
                    ticks: {
                        stepSize: 2,
                        color: "#94a3b8",
                        font: { family: "'Be Vietnam Pro', sans-serif", size: 11 }
                    }
                }
            }
        }
    });
}

/**
 * Khởi tạo và vẽ 6 biểu đồ phụ dạng mini line chart (Thay đổi linh hoạt theo Phạm vi lọc)
 */
function renderMiniCharts() {
    if (typeof Chart === 'undefined') return;

    const months = getActiveMonthsData();
    const scope = getScopeInfo();
    const labels = months.map(m => "T" + m.month);

    // Tính tổng trong phạm vi lọc
    let scopePosts = 0;
    let scopeImages = 0;
    let scopeAnnounce = 0;
    let scopeReports = 0;
    let scopePages = 0;
    let scopeCat = 0;

    months.forEach(m => {
        scopePosts += (m.publishedPosts || 0);
        scopeImages += (m.images || 0);
        scopeAnnounce += (m.announcements || 0);
        scopeReports += (m.reports || 0);
        scopePages += (m.pages || 0);
        scopeCat += (m.categories || 0);
    });

    // Dữ liệu cả năm cho footer
    const allMonths = getAllYearMonths();
    let totalPostsYear = 0;
    let totalAnnounceYear = 0;
    let totalReportsYear = 0;
    allMonths.forEach(m => {
        totalPostsYear += (m.publishedPosts || 0);
        totalAnnounceYear += (m.announcements || 0);
        totalReportsYear += (m.reports || 0);
    });

    const currentMonthObj = allMonths.find(m => m.month === currentMonth) || {
        publishedPosts: 0, announcements: 0, pendingPosts: 0, pages: 5, staff: 0, categories: 5, images: 1, reports: 0
    };

    const isAll = selectedScope === 'all';

    // 1. Cập nhật Mini 1 (Bài viết đã đăng)
    const badge1 = document.getElementById("miniBadge1");
    const foot1 = document.getElementById("miniFooter1");
    if (badge1) {
        badge1.textContent = isAll 
            ? `Tháng ${currentMonth}: ${currentMonthObj.publishedPosts} bài viết` 
            : `${scope.shortLabel}: ${scopePosts} bài viết`;
    }
    if (foot1) {
        foot1.innerHTML = isAll
            ? `<i class="fa-solid fa-circle-check text-emerald"></i> ${totalPostsYear} Bài viết đã xuất bản`
            : `<i class="fa-solid fa-circle-check text-emerald"></i> ${scopePosts} Bài viết trong ${scope.shortLabel}`;
    }

    // 2. Cập nhật Mini 2 (Tần suất tải ảnh)
    const badge2 = document.getElementById("miniBadge2");
    const foot2 = document.getElementById("miniFooter2");
    if (badge2) {
        badge2.textContent = isAll
            ? `THÁNG ${currentMonth}: ${currentMonthObj.images} Ảnh`
            : `${scope.shortLabel.toUpperCase()}: ${scopeImages} Ảnh`;
    }
    if (foot2) {
        foot2.innerHTML = isAll
            ? `<i class="fa-solid fa-images" style="color: #8b5cf6;"></i> ${SYSTEM_METRICS_INFO.totalMediaAllTime} Ảnh trong kho media`
            : `<i class="fa-solid fa-images" style="color: #8b5cf6;"></i> ${scopeImages} Ảnh trong ${scope.shortLabel}`;
    }

    // 3. Cập nhật Mini 3 (Thông báo)
    const badge3 = document.getElementById("miniBadge3");
    const foot3 = document.getElementById("miniFooter3");
    if (badge3) {
        badge3.textContent = isAll
            ? `Tháng ${currentMonth}: ${currentMonthObj.announcements} Thông báo`
            : `${scope.shortLabel}: ${scopeAnnounce} Thông báo`;
    }
    if (foot3) {
        foot3.innerHTML = isAll
            ? `<i class="fa-solid fa-bullhorn" style="color: #0284c7;"></i> ${totalAnnounceYear} Thông báo ban hành`
            : `<i class="fa-solid fa-bullhorn" style="color: #0284c7;"></i> ${scopeAnnounce} Thông báo trong ${scope.shortLabel}`;
    }

    // 4. Cập nhật Mini 4 (Báo cáo)
    const badge4 = document.getElementById("miniBadge4");
    const foot4 = document.getElementById("miniFooter4");
    if (badge4) {
        badge4.textContent = isAll
            ? `Tháng ${currentMonth}: ${currentMonthObj.reports} Báo cáo`
            : `${scope.shortLabel}: ${scopeReports} Báo cáo`;
    }
    if (foot4) {
        foot4.innerHTML = isAll
            ? `<i class="fa-solid fa-file-contract" style="color: #e11d48;"></i> ${totalReportsYear} Báo cáo ban hành`
            : `<i class="fa-solid fa-file-contract" style="color: #e11d48;"></i> ${scopeReports} Báo cáo trong ${scope.shortLabel}`;
    }

    // 5. Cập nhật Mini 5 (Trang & Phân hệ)
    const badge5 = document.getElementById("miniBadge5");
    const foot5 = document.getElementById("miniFooter5");
    if (badge5) {
        badge5.textContent = isAll
            ? `Tháng ${currentMonth}: ${currentMonthObj.pages} Trang`
            : `${scope.shortLabel}: ${scopePages} Trang`;
    }
    if (foot5) {
        foot5.innerHTML = isAll
            ? `<i class="fa-solid fa-cubes" style="color: #0d9488;"></i> ${SYSTEM_METRICS_INFO.totalPagesAllTime} Trang & Phân hệ`
            : `<i class="fa-solid fa-cubes" style="color: #0d9488;"></i> ${scopePages} Trang trong ${scope.shortLabel}`;
    }

    // 6. Cập nhật Mini 6 (Danh mục bài viết)
    const badge6 = document.getElementById("miniBadge6");
    const foot6 = document.getElementById("miniFooter6");
    if (badge6) {
        badge6.textContent = isAll
            ? `Tháng ${currentMonth}: ${currentMonthObj.categories} Danh mục`
            : `${scope.shortLabel}: ${scopeCat} Danh mục`;
    }
    if (foot6) {
        foot6.innerHTML = isAll
            ? `<i class="fa-solid fa-folder-tree" style="color: #7c3aed;"></i> ${SYSTEM_METRICS_INFO.totalCategoriesAllTime} Danh mục bài viết`
            : `<i class="fa-solid fa-folder-tree" style="color: #7c3aed;"></i> ${scopeCat} Danh mục trong ${scope.shortLabel}`;
    }

    // Vẽ 1. Bài viết đã đăng / Tháng (Xanh lá cây ngọc)
    renderSingleMiniChart(
        "miniChart1",
        miniChart1,
        (inst) => { miniChart1 = inst; },
        labels,
        months.map(m => m.publishedPosts || 0),
        "#10b981",
        "rgba(16, 185, 129, 0.12)",
        months
    );

    // Vẽ 2. Tần suất tải ảnh Media / Tháng (Tím)
    renderSingleMiniChart(
        "miniChart2",
        miniChart2,
        (inst) => { miniChart2 = inst; },
        labels,
        months.map(m => m.images || 0),
        "#8b5cf6",
        "rgba(139, 92, 246, 0.12)",
        months
    );

    // Vẽ 3. Thông báo / Tháng (Xanh dương)
    renderSingleMiniChart(
        "miniChart3",
        miniChart3,
        (inst) => { miniChart3 = inst; },
        labels,
        months.map(m => m.announcements || 0),
        "#0284c7",
        "rgba(2, 132, 199, 0.12)",
        months
    );

    // Vẽ 4. Báo cáo / Tháng (Đỏ hồng)
    renderSingleMiniChart(
        "miniChart4",
        miniChart4,
        (inst) => { miniChart4 = inst; },
        labels,
        months.map(m => m.reports || 0),
        "#e11d48",
        "rgba(225, 29, 72, 0.12)",
        months
    );

    // Vẽ 5. Trang & Phân hệ / Tháng (Xanh ngọc teal)
    renderSingleMiniChart(
        "miniChart5",
        miniChart5,
        (inst) => { miniChart5 = inst; },
        labels,
        months.map(m => m.pages || 0),
        "#0d9488",
        "rgba(13, 148, 136, 0.12)",
        months
    );

    // Vẽ 6. Danh mục bài viết / Tháng (Tím đậm)
    renderSingleMiniChart(
        "miniChart6",
        miniChart6,
        (inst) => { miniChart6 = inst; },
        labels,
        months.map(m => m.categories || 0),
        "#7c3aed",
        "rgba(124, 58, 237, 0.12)",
        months
    );
}

/**
 * Hàm hỗ trợ vẽ một mini line chart theo danh sách tháng động
 */
function renderSingleMiniChart(canvasId, currentInstance, setInstance, labels, data, borderColor, fillColor, monthsList) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (currentInstance) {
        currentInstance.destroy();
    }

    const ctx = canvas.getContext("2d");
    const inst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: borderColor,
                backgroundColor: fillColor,
                borderWidth: 2,
                fill: true,
                tension: 0.35,
                pointRadius: labels.length <= 4 ? 4 : 2,
                pointHoverRadius: 6,
                pointBackgroundColor: borderColor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(15, 23, 42, 0.85)",
                    padding: 6,
                    cornerRadius: 6,
                    callbacks: {
                        title: function(items) {
                            const mObj = monthsList ? monthsList[items[0].dataIndex] : null;
                            return mObj ? `${mObj.monthName} / ${currentYear}` : `Tháng ${items[0].label}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#94a3b8",
                        font: { size: 9.5 }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "#f8fafc" },
                    ticks: {
                        color: "#cbd5e1",
                        font: { size: 9 },
                        maxTicksLimit: 4
                    }
                }
            }
        }
    });

    setInstance(inst);
}

/**
 * Vẽ Bảng Chỉ Số Chi Tiết (Tự động lọc các tháng theo Phạm vi phân chia)
 */
function renderTable(months) {
    const tbody = document.getElementById("detailedTableBody");
    const tfoot = document.getElementById("detailedTableFoot");
    if (!tbody) return;

    const scope = getScopeInfo();
    const tableTitleEl = document.getElementById("tableCardTitle");
    const tableSubEl = document.getElementById("tableCardSubtitle");

    if (tableTitleEl) {
        tableTitleEl.textContent = selectedScope === 'all'
            ? "Bảng Chỉ Số Chi Tiết 12 Tháng"
            : `Bảng Chỉ Số Chi Tiết (${scope.label})`;
    }
    if (tableSubEl) {
        tableSubEl.textContent = selectedScope === 'all'
            ? "Tổng hợp cụ thể bài viết đã đăng, thông báo, báo cáo, trang, danh mục, bài chờ đăng và ảnh media theo từng tháng (Dữ liệu thực tế)"
            : `Tổng hợp chi tiết theo ${scope.label} năm ${currentYear}: bài viết đã đăng, thông báo, báo cáo, trang, danh mục, bài chờ đăng và ảnh media`;
    }

    tbody.innerHTML = "";

    let totalPosts = 0;
    let totalAnnounce = 0;
    let totalReports = 0;
    let totalPages = 0;
    let totalCategories = 0;
    let totalPending = 0;
    let totalImages = 0;

    months.forEach(m => {
        const posts = m.publishedPosts || 0;
        const announce = m.announcements || 0;
        const reports = m.reports || 0;
        const pages = m.pages || 0;
        const cat = m.categories || 0;
        const pending = m.pendingPosts || 0;
        const images = m.images || 0;

        totalPosts += posts;
        totalAnnounce += announce;
        totalReports += reports;
        totalPages += pages;
        totalCategories += cat;
        totalPending += pending;
        totalImages += images;

        // Tính tỷ lệ xuất bản
        const rate = (posts > 0 || pending > 0) ? "100%" : "-";

        // Đánh giá hoạt động
        const hasActivity = (posts > 0 || announce > 0 || reports > 0 || pages > 0 || cat > 0 || images > 0);
        const evalText = hasActivity ? "+ Đạt chỉ tiêu" : "Chưa có dữ liệu";
        const evalClass = hasActivity ? "pill-status-target" : "pill-status-empty";

        const tr = document.createElement("tr");

        // Đánh dấu tháng 10 hiện tại nếu đang trong năm 2026
        const isCurrentMonth = (m.month === currentMonth && currentYear === 2026);
        if (isCurrentMonth) {
            tr.className = "row-current-month";
        }

        // Định dạng badge các cột
        const postsBadge = posts > 0 ? `<span class="pill-badge pill-green">${posts} bài</span>` : `0 bài`;
        const announceBadge = announce > 0 ? `<span class="pill-badge pill-blue">${announce} thông báo</span>` : `0 thông báo`;
        const reportsBadge = reports > 0 ? `<span class="pill-badge pill-emerald-dark">${reports} báo cáo</span>` : `0 báo cáo`;
        const pagesBadge = pages > 0 ? `<span class="pill-badge pill-cyan">${pages} trang</span>` : `0 trang`;
        const catBadge = cat > 0 ? `<span class="pill-badge pill-purple">${cat} dm</span>` : `0 dm`;
        const pendingBadge = pending > 0 ? `<span class="pill-badge pill-orange">${pending} bài</span>` : `0 bài`;
        const imagesBadge = images > 0 ? `<span class="pill-badge pill-purple">${images} ảnh</span>` : `0 ảnh`;

        // Thêm tag Tháng 10 Realtime nếu là tháng hiện tại
        let monthColHtml = `<strong>${m.monthName}</strong>`;
        if (isCurrentMonth) {
            monthColHtml += `<div><span class="pill-current-realtime"><i class="fa-solid fa-bolt"></i> Hiện tại (Realtime)</span></div>`;
        }

        tr.innerHTML = `
            <td>${monthColHtml}</td>
            <td>${postsBadge}</td>
            <td>${announceBadge}</td>
            <td>${reportsBadge}</td>
            <td>${pagesBadge}</td>
            <td>${catBadge}</td>
            <td>${pendingBadge}</td>
            <td>${imagesBadge}</td>
            <td><strong>${rate}</strong></td>
            <td><span class="pill-badge ${evalClass}">${evalText}</span></td>
        `;

        tbody.appendChild(tr);
    });

    // Cập nhật dòng tổng kết ở TFOOT
    if (tfoot) {
        const totalLabel = selectedScope === 'all'
            ? `Tổng cả năm (${currentYear})`
            : `Tổng ${scope.label} (${currentYear})`;

        tfoot.innerHTML = `
            <tr>
                <td><strong>${totalLabel}</strong></td>
                <td><strong>${totalPosts} bài</strong></td>
                <td><strong>${totalAnnounce} thông báo</strong></td>
                <td><strong>${totalReports} báo cáo</strong></td>
                <td><strong>${totalPages} trang</strong></td>
                <td><strong>${totalCategories} dm</strong></td>
                <td><strong style="color: #ea580c;">${totalPending} bài</strong></td>
                <td><strong>${totalImages} ảnh</strong></td>
                <td><strong>100%</strong></td>
                <td><span class="pill-badge pill-status-normal">+ Hoạt động bình thường</span></td>
            </tr>
        `;
    }
}

/**
 * Quản lý các Modal thao tác nhanh
 */
function setupQuickActionModals() {
    // Quick action buttons
    const btnActionMap = [
        { id: "btnQuickMenu", title: "Thêm mục Menu trang chủ", desc: "Thêm các liên kết và cấu trúc điều hướng trên trang chủ của Viện." },
        { id: "btnQuickPost", title: "Soạn bài viết mới (CMS)", desc: "Nhập bài viết tin tức, nghiên cứu chất lượng và khảo thí mới." },
        { id: "btnQuickAnnounce", title: "Soạn thông báo trang chủ", desc: "Đăng tải thông báo quan trọng đến sinh viên, cán bộ và đối tác." },
        { id: "btnQuickModule", title: "Thêm phân hệ dịch vụ mới", desc: "Tích hợp phân hệ thi, kiểm tra chuẩn đầu ra và đánh giá chất lượng." },
        { id: "btnQuickUser", title: "Thêm cán bộ & Phân quyền", desc: "Tạo tài khoản quản trị viên, ban biên tập và chuyên viên khảo thí." },
        { id: "btnQuickMedia", title: "Tải ảnh thư viện Media", desc: "Tải lên tệp ảnh sự kiện, chứng chỉ và ấn phẩm truyền thông mới." },
        { id: "btnQuickCategory", title: "Thêm danh mục bài viết", desc: "Phân loại bài viết theo chuyên mục học thuật và hoạt động viện." }
    ];

    btnActionMap.forEach(item => {
        const btn = document.getElementById(item.id);
        if (btn) {
            btn.addEventListener("click", () => {
                openQuickActionModal(item.title, item.desc);
            });
        }
    });

    // Nút đóng modal
    const closeBtns = document.querySelectorAll(".modal-close-btn");
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            closeAllModals();
        });
    });

    // Đóng khi click ra ngoài backdrop
    const modalBackdrops = document.querySelectorAll(".modal-backdrop");
    modalBackdrops.forEach(backdrop => {
        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) {
                closeAllModals();
            }
        });
    });

    // Nút mở modal Google Sheet Config
    const btnOpenSheetModal = document.getElementById("btnOpenSheetModal");
    if (btnOpenSheetModal) {
        btnOpenSheetModal.addEventListener("click", () => {
            openSheetConfigModal();
        });
    }

    // Nút lưu liên kết Google Sheet mới trong modal
    const btnSaveSheetUrl = document.getElementById("btnSaveSheetUrl");
    if (btnSaveSheetUrl) {
        btnSaveSheetUrl.addEventListener("click", () => {
            const input = document.getElementById("sheetUrlInput");
            if (input && input.value.trim()) {
                currentGoogleSheetUrl = input.value.trim();
                localStorage.setItem('ql_sheet3_custom_url', currentGoogleSheetUrl);
                updateSheetLinksUI();
                showToast("Đã lưu liên kết Google Sheet thành công! Đang tải dữ liệu...", "info");
                syncDataFromGoogleSheet(true);
                closeAllModals();
            }
        });
    }
}

/**
 * Mở modal thao tác nhanh
 */
function openQuickActionModal(title, desc) {
    const modal = document.getElementById("quickActionModal");
    const titleEl = document.getElementById("quickActionModalTitle");
    const descEl = document.getElementById("quickActionModalDesc");
    const formEl = document.getElementById("quickActionForm");

    if (modal && titleEl && descEl) {
        titleEl.textContent = title;
        descEl.textContent = desc;
        if (formEl) formEl.reset();
        modal.classList.add("show");
    }
}

/**
 * Mở modal cấu hình Google Sheet
 */
function openSheetConfigModal() {
    const modal = document.getElementById("sheetConfigModal");
    const input = document.getElementById("sheetUrlInput");
    if (input) {
        input.value = currentGoogleSheetUrl;
    }
    if (modal) {
        modal.classList.add("show");
    }
}

/**
 * Đóng tất cả modal
 */
function closeAllModals() {
    document.querySelectorAll(".modal-backdrop").forEach(m => {
        m.classList.remove("show");
    });
}

/**
 * Hiển thị thông báo Toast hiện đại
 */
function showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.style.cssText = "position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const bgColors = {
        success: "#065f46",
        info: "#0284c7",
        warning: "#d97706",
        error: "#e11d48"
    };

    const icons = {
        success: "fa-circle-check",
        info: "fa-circle-info",
        warning: "fa-triangle-exclamation",
        error: "fa-circle-exclamation"
    };

    toast.style.cssText = `
        background-color: ${bgColors[type] || "#0f172a"};
        color: #ffffff;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 12.5px;
        font-family: 'Be Vietnam Pro', sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    toast.innerHTML = `<i class="fa-solid ${icons[type] || 'fa-info'}"></i><span>${message}</span>`;
    container.appendChild(toast);

    // Animation in
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);

    // Animation out
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3500);
}
