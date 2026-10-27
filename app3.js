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
    const CACHE_VERSION = 'v4.1_staff_14';
    const cachedVersion = localStorage.getItem('ql_sheet3_cache_ver');
    const cachedData = localStorage.getItem('ql_sheet3_cached_data');
    if (cachedVersion === CACHE_VERSION && cachedData) {
        try {
            const parsedCache = JSON.parse(cachedData);
            if (parsedCache && typeof parsedCache === 'object' && Object.keys(parsedCache).length > 0) {
                yearlyData = parsedCache;
            }
        } catch (e) {
            console.warn("Lỗi đọc cache:", e);
        }
    }

    applyUserModificationsToYearlyData();
    initClock();
    initEventListeners();
    initSignatureConfig();
    updateSheetLinksUI();
    updateWebhookStatusUI3();
    initWebhookKeepAlive3();
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
            currentYear = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
            updateScopeFilterOptionsUI();
            renderAll();
            showToast(currentYear === 'all' ? 'Đã chuyển sang xem Tổng kho Toàn bộ các năm' : `Đã chuyển sang số liệu Năm ${currentYear}`, "info");
        });
    }

    // Dropdown chọn phạm vi (12 tháng, 3 tháng gần nhất, hoặc theo quý/tháng cụ thể)
    const scopeSelect = document.getElementById("scopeFilter");
    if (scopeSelect) {
        scopeSelect.value = selectedScope;
        scopeSelect.addEventListener("change", (e) => {
            selectedScope = e.target.value;
            renderAll();
            const scope = getScopeInfo();
            showToast(`Đã chuyển phạm vi hiển thị: ${scope.label}`, "info");
        });
    }

    // Nút Xem tất cả 12 tháng trên bảng chi tiết
    const btnResetScopeAll = document.getElementById("btnResetScopeAll");
    if (btnResetScopeAll) {
        btnResetScopeAll.addEventListener("click", () => {
            selectedScope = 'all';
            if (scopeSelect) scopeSelect.value = 'all';
            renderAll();
            showToast("Đã quay lại hiển thị toàn bộ 12 tháng", "info");
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

        // Cập nhật thông tin Người lập & Lãnh đạo ký duyệt vào bản in
        applySignatureToPrintDOM();
    };

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

    // Mở nhanh mục cấu hình người ký bản in
    const btnConfigSignatures = document.getElementById("btnConfigSignatures");
    if (btnConfigSignatures) {
        btnConfigSignatures.addEventListener("click", () => {
            scrollToSignatureSection();
        });
    }

    const navSignatureLink = document.getElementById("navSignatureLink");
    if (navSignatureLink) {
        navSignatureLink.addEventListener("click", (e) => {
            e.preventDefault();
            scrollToSignatureSection();
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

    // Khởi tạo sự kiện cho Modal Cập Nhật Dữ Liệu
    initUpdateDataModalEvents();
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
            applyUserModificationsToYearlyData();

            // Lưu dữ liệu vào LocalStorage để lần mở tiếp theo tức thời
            try {
                localStorage.setItem('ql_sheet3_cached_data', JSON.stringify(yearlyData));
                localStorage.setItem('ql_sheet3_cache_ver', 'v3.6_tongkho');
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
 * Xác định thông tin phạm vi phân chia hiện tại (3 tháng gần nhất, Từng tháng 1..12, Quý, 6 tháng, 12 tháng)
 */
function getScopeInfo() {
    // 1. Kiểm tra nếu là chọn từng tháng cụ thể (m1 .. m12 hoặc số 1 .. 12)
    const monthMatch = String(selectedScope).match(/^(?:m)?([1-9]|1[0-2])$/);
    if (monthMatch) {
        const mo = parseInt(monthMatch[1], 10);
        return {
            id: `m${mo}`,
            label: `Tháng ${mo}`,
            shortLabel: `Tháng ${mo}`,
            periodName: `Tháng ${mo}`,
            months: [mo],
            isSingleMonth: true,
            monthNumber: mo
        };
    }

    // 2. Kiểm tra nếu là 3 tháng gần nhất
    if (selectedScope === 'last3') {
        let endMonth = 10;
        if (currentYear === 2025) {
            endMonth = 12;
        } else if (currentYear === 2026) {
            endMonth = 10; // Tháng 10 hiện tại của năm học 2026
        } else {
            endMonth = currentMonth || 10;
        }
        const m1 = Math.max(1, endMonth - 2);
        const m2 = Math.max(1, endMonth - 1);
        const m3 = endMonth;
        return {
            id: 'last3',
            label: `3 tháng gần nhất (T${m1} - T${m3})`,
            shortLabel: `3 tháng (T${m1}-T${m3})`,
            periodName: `3 tháng gần nhất (Tháng ${m1} - Tháng ${m3})`,
            months: [m1, m2, m3],
            isRecent3: true
        };
    }

    // 3. Các phạm vi phân chia theo Quý và 6 tháng
    switch (selectedScope) {
        case 'q1':
            return {
                id: 'q1',
                label: 'Quý 1 (T1 - T3)',
                shortLabel: 'Quý 1',
                periodName: 'Quý 1',
                months: [1, 2, 3]
            };
        case 'q2':
            return {
                id: 'q2',
                label: 'Quý 2 (T4 - T6)',
                shortLabel: 'Quý 2',
                periodName: 'Quý 2',
                months: [4, 5, 6]
            };
        case 'q3':
            return {
                id: 'q3',
                label: 'Quý 3 (T7 - T9)',
                shortLabel: 'Quý 3',
                periodName: 'Quý 3',
                months: [7, 8, 9]
            };
        case 'q4':
            return {
                id: 'q4',
                label: 'Quý 4 (T10 - T12)',
                shortLabel: 'Quý 4',
                periodName: 'Quý 4',
                months: [10, 11, 12]
            };
        case 'h1':
            return {
                id: 'h1',
                label: '6 tháng đầu năm (T1 - T6)',
                shortLabel: '6 tháng đầu',
                periodName: '6 tháng đầu năm',
                months: [1, 2, 3, 4, 5, 6]
            };
        case 'h2':
            return {
                id: 'h2',
                label: '6 tháng cuối năm (T7 - T12)',
                shortLabel: '6 tháng cuối',
                periodName: '6 tháng cuối năm',
                months: [7, 8, 9, 10, 11, 12]
            };
        case 'all':
        default:
            return {
                id: 'all',
                label: '12 tháng (Toàn năm)',
                shortLabel: '12 tháng',
                periodName: 'Cả năm',
                months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            };
    }
}

/**
 * Cập nhật nhãn và trạng thái các tùy chọn trong dropdown Phạm vi
 */
function updateScopeFilterOptionsUI() {
    const scopeSelect = document.getElementById("scopeFilter");
    if (!scopeSelect) return;

    // Cập nhật nhãn của tùy chọn "3 tháng gần nhất" theo năm đang chọn
    const last3Option = scopeSelect.querySelector('option[value="last3"]');
    if (last3Option) {
        if (currentYear === 2025) {
            last3Option.textContent = "3 tháng gần nhất (T10 - T12)";
        } else if (currentYear === 2026) {
            last3Option.textContent = "3 tháng gần nhất (T8 - T10)";
        } else {
            const endM = currentMonth || 10;
            const startM = Math.max(1, endM - 2);
            last3Option.textContent = `3 tháng gần nhất (T${startM} - T${endM})`;
        }
    }
}

/**
 * Chuyển nhanh phạm vi hiển thị sang một tháng cụ thể (khi click vào bảng hoặc chọn từ bên ngoài)
 */
function selectScopeMonth(monthNum) {
    const mo = parseInt(monthNum, 10);
    if (!mo || mo < 1 || mo > 12) return;

    selectedScope = `m${mo}`;
    const scopeSelect = document.getElementById("scopeFilter");
    if (scopeSelect) {
        scopeSelect.value = `m${mo}`;
    }
    renderAll();
    const scope = getScopeInfo();
    showToast(`Đang hiển thị số liệu ${scope.label}`, "info");

    // Cuộn nhẹ lên đầu để người dùng thấy rõ 8 thẻ KPI được cập nhật
    const statsGrid = document.querySelector(".stats-grid-4");
    if (statsGrid) {
        statsGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Gắn toàn cục
window.selectScopeMonth = selectScopeMonth;
window.updateScopeFilterOptionsUI = updateScopeFilterOptionsUI;

/**
 * Tính toán động Tổng kho Toàn bộ các năm từ dữ liệu thực tế
 */
function getAllTimeMetrics() {
    let posts = 0;
    let announcements = 0;
    let pending = 0;
    let reports = 0;
    let pages = 0;
    let staff = 0;
    let categories = 0;
    let images = 0;

    Object.keys(yearlyData).forEach(y => {
        const months = yearlyData[y] || [];
        months.forEach(m => {
            posts += (m.publishedPosts || 0);
            announcements += (m.announcements || 0);
            pending += (m.pendingPosts || 0);
            reports += (m.reports || 0);
            pages += (m.pages || 0);
            staff += (m.staff || 0);
            categories += (m.categories || 0);
            images += (m.images || 0);
        });
    });

    return {
        posts: posts || SYSTEM_METRICS_INFO.totalPostsAllTime || 105,
        announcements: announcements || SYSTEM_METRICS_INFO.totalAnnouncementsAllTime || 10,
        pending: pending || 0,
        reports: reports || SYSTEM_METRICS_INFO.totalReportsAllTime || 1,
        pages: pages || SYSTEM_METRICS_INFO.totalPagesAllTime || 43,
        categories: categories || SYSTEM_METRICS_INFO.totalCategoriesAllTime || 43,
        images: images || SYSTEM_METRICS_INFO.totalMediaAllTime || 642,
        staff: staff || SYSTEM_METRICS_INFO.totalStaff || 14,
        staffAdded: staff || 14
    };
}

/**
 * Lấy toàn bộ 12 tháng theo năm hiện tại (hoặc tổng hợp nếu xem Toàn bộ các năm)
 */
function getAllYearMonths() {
    if (currentYear === 'all') {
        const combined = [];
        for (let m = 1; m <= 12; m++) {
            const mObj = {
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
            };
            Object.keys(yearlyData).forEach(y => {
                const yearList = yearlyData[y] || [];
                const monthData = yearList.find(item => item.month === m);
                if (monthData) {
                    mObj.images += (monthData.images || 0);
                    mObj.publishedPosts += (monthData.publishedPosts || 0);
                    mObj.pendingPosts += (monthData.pendingPosts || 0);
                    mObj.reports += (monthData.reports || 0);
                    mObj.announcements += (monthData.announcements || 0);
                    mObj.categories += (monthData.categories || 0);
                    mObj.staff += (monthData.staff || 0);
                    mObj.pages += (monthData.pages || 0);
                }
            });
            combined.push(mObj);
        }
        return combined;
    }
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
 * Hiển thị 8 thẻ KPI tổng quan (Đồng bộ chuẩn 100% giữa Năm được chọn và Tổng kho tích lũy toàn bộ)
 */
function renderKpiCards(filteredMonths) {
    const allMonths = getAllYearMonths();
    const scope = getScopeInfo();
    const allTime = getAllTimeMetrics();
    const isYearAll = (currentYear === 'all');
    const isScopeAll = (selectedScope === 'all');
    const yearLabel = isYearAll ? "Tổng kho" : `Năm ${currentYear}`;

    // Tổng số liệu cả năm đang chọn
    let totalPostsYear = 0;
    let totalAnnounceYear = 0;
    let totalPendingYear = 0;
    let totalReportsYear = 0;
    let totalPagesYear = 0;
    let totalStaffYear = 0;
    let totalCatYear = 0;
    let totalImagesYear = 0;

    allMonths.forEach(m => {
        totalPostsYear += (m.publishedPosts || 0);
        totalAnnounceYear += (m.announcements || 0);
        totalPendingYear += (m.pendingPosts || 0);
        totalReportsYear += (m.reports || 0);
        totalPagesYear += (m.pages || 0);
        totalStaffYear += (m.staff || 0);
        totalCatYear += (m.categories || 0);
        totalImagesYear += (m.images || 0);
    });

    // Tổng số liệu trong phạm vi lọc được chọn (Quý / 6 tháng / 12 tháng)
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

    const currentMonthObj = allMonths.find(m => m.month === currentMonth) || allMonths[allMonths.length - 1] || {
        publishedPosts: 0, announcements: 0, pendingPosts: 0, pages: 0, staff: 0, categories: 0, images: 0, reports: 0
    };

    const yearDetailText = isYearAll ? "Toàn bộ các năm" : `Năm ${currentYear}`;

    // 1. ĐÃ XUẤT BẢN: Số to hiển thị số liệu hàng tháng (tháng hiện tại: 2 bài)
    const kpiPostsVal = document.getElementById("kpiPostsValue");
    const kpiPostsSublabel = document.getElementById("kpiPostsSublabel");
    const kpiPostsSub = document.getElementById("kpiPostsSub");
    if (kpiPostsVal) kpiPostsVal.textContent = isScopeAll ? (currentMonthObj.publishedPosts || 0) : scopePosts;
    if (kpiPostsSublabel) kpiPostsSublabel.textContent = isScopeAll ? "Bài viết đã đăng" : `Bài viết đã đăng (${scope.label})`;
    if (kpiPostsSub) {
        kpiPostsSub.textContent = isScopeAll
            ? `(Tổng kho: ${allTime.posts} bài | ${yearDetailText}: ${totalPostsYear} bài)`
            : `(${scope.shortLabel}: ${scopePosts} bài | ${yearDetailText}: ${totalPostsYear} bài | Tổng: ${allTime.posts})`;
    }

    // 2. THÔNG BÁO: Số to hiển thị số liệu hàng tháng (tháng hiện tại: 0 tb)
    const kpiAnnounceVal = document.getElementById("kpiAnnounceValue");
    const kpiAnnounceSublabel = document.getElementById("kpiAnnounceSublabel");
    const kpiAnnounceSub = document.getElementById("kpiAnnounceSub");
    if (kpiAnnounceVal) kpiAnnounceVal.textContent = isScopeAll ? (currentMonthObj.announcements || 0) : scopeAnnounce;
    if (kpiAnnounceSublabel) kpiAnnounceSublabel.textContent = isScopeAll ? "Thông báo ban hành" : `Thông báo ban hành (${scope.label})`;
    if (kpiAnnounceSub) {
        kpiAnnounceSub.textContent = isScopeAll
            ? `(Tổng kho: ${allTime.announcements} thông báo | ${yearDetailText}: ${totalAnnounceYear})`
            : `(${scope.shortLabel}: ${scopeAnnounce} tb | ${yearDetailText}: ${totalAnnounceYear} tb | Tổng: ${allTime.announcements})`;
    }

    // 3. CẦN XÉT DUYỆT: Số to hiển thị số liệu hàng tháng (0 bài)
    const kpiPendingVal = document.getElementById("kpiPendingValue");
    const kpiPendingSublabel = document.getElementById("kpiPendingSublabel");
    const kpiPendingSub = document.getElementById("kpiPendingSub");
    if (kpiPendingVal) kpiPendingVal.textContent = isScopeAll ? (currentMonthObj.pendingPosts || 0) : scopePending;
    if (kpiPendingSublabel) kpiPendingSublabel.textContent = isScopeAll ? "Bài viết chờ đăng" : `Bài viết chờ đăng (${scope.label})`;
    if (kpiPendingSub) kpiPendingSub.textContent = isScopeAll ? `(Đang chờ: ${isScopeAll ? (currentMonthObj.pendingPosts || 0) : scopePending} bài)` : `(Chờ duyệt ${scope.shortLabel}: ${scopePending} bài)`;

    // 4. TRANG & PHÂN HỆ: Số to hiển thị số liệu hàng tháng (tháng hiện tại: 5 trang)
    const kpiPagesVal = document.getElementById("kpiPagesValue");
    const kpiPagesSublabel = document.getElementById("kpiPagesSublabel");
    const kpiPagesSub = document.getElementById("kpiPagesSub");
    if (kpiPagesVal) kpiPagesVal.textContent = isScopeAll ? (currentMonthObj.pages || 0) : scopePages;
    if (kpiPagesSublabel) kpiPagesSublabel.textContent = isScopeAll ? "Trang/tháng" : `Trang & phân hệ (${scope.label})`;
    if (kpiPagesSub) {
        kpiPagesSub.textContent = isScopeAll
            ? `(Tổng kho: ${allTime.pages} trang | ${yearDetailText}: ${totalPagesYear} trang)`
            : `(${scope.shortLabel}: ${scopePages} trang | ${yearDetailText}: ${totalPagesYear} trang | Tổng: ${allTime.pages})`;
    }

    // 5. NHÂN SỰ: Số to hiển thị số liệu hàng tháng (tháng hiện tại: 0 cb)
    const kpiStaffVal = document.getElementById("kpiStaffValue");
    const kpiStaffSublabel = document.getElementById("kpiStaffSublabel");
    const kpiStaffSub = document.getElementById("kpiStaffSub");
    if (kpiStaffVal) kpiStaffVal.textContent = isScopeAll ? (currentMonthObj.staff || 0) : scopeStaff;
    if (kpiStaffSublabel) kpiStaffSublabel.textContent = isScopeAll ? "Cán bộ & Quản trị" : `Cán bộ tăng thêm (${scope.label})`;
    if (kpiStaffSub) {
        kpiStaffSub.textContent = isScopeAll
            ? `(Tổng: ${allTime.staff} cán bộ | ${isYearAll ? 'Tích lũy' : 'Tăng năm ' + currentYear}: +${totalStaffYear})`
            : `(Tổng: ${allTime.staff} cán bộ | Tăng ${scope.shortLabel}: +${scopeStaff})`;
    }

    // 6. DANH MỤC BÀI VIẾT: Số to hiển thị số liệu hàng tháng (tháng hiện tại: 5 dm)
    const kpiCatVal = document.getElementById("kpiCatValue");
    const kpiCatSublabel = document.getElementById("kpiCatSublabel");
    const kpiCatSub = document.getElementById("kpiCatSub");
    if (kpiCatVal) kpiCatVal.textContent = isScopeAll ? (currentMonthObj.categories || 0) : scopeCat;
    if (kpiCatSublabel) kpiCatSublabel.textContent = isScopeAll ? "Danh mục bài viết/tháng" : `Danh mục bài viết (${scope.label})`;
    if (kpiCatSub) {
        kpiCatSub.textContent = isScopeAll
            ? `(Tổng kho: ${allTime.categories} danh mục | ${yearDetailText}: ${totalCatYear} dm)`
            : `(${scope.shortLabel}: ${scopeCat} dm | ${yearDetailText}: ${totalCatYear} dm | Tổng: ${allTime.categories})`;
    }

    // 7. THƯ VIỆN MEDIA: Số to hiển thị số liệu hàng tháng (tháng hiện tại: 10 ảnh)
    const kpiMediaVal = document.getElementById("kpiMediaValue");
    const kpiMediaSublabel = document.getElementById("kpiMediaSublabel");
    const kpiMediaSub = document.getElementById("kpiMediaSub");
    if (kpiMediaVal) kpiMediaVal.textContent = isScopeAll ? (currentMonthObj.images || 0) : scopeImages;
    if (kpiMediaSublabel) kpiMediaSublabel.textContent = isScopeAll ? "Ảnh / Kho Media" : `Ảnh Media tải lên (${scope.label})`;
    if (kpiMediaSub) {
        kpiMediaSub.textContent = isScopeAll
            ? `(Tổng kho: ${allTime.images} tệp | ${yearDetailText}: ${totalImagesYear} ảnh)`
            : `(${scope.shortLabel}: ${scopeImages} ảnh | ${yearDetailText}: ${totalImagesYear} ảnh | Tổng: ${allTime.images})`;
    }

    // 8. BÁO CÁO: Số to hiển thị số liệu hàng tháng (tháng hiện tại: 0 bc)
    const kpiReportVal = document.getElementById("kpiReportValue");
    const kpiReportSublabel = document.getElementById("kpiReportSublabel");
    const kpiReportSub = document.getElementById("kpiReportSub");
    if (kpiReportVal) kpiReportVal.textContent = isScopeAll ? (currentMonthObj.reports || 0) : scopeReports;
    if (kpiReportSublabel) kpiReportSublabel.textContent = isScopeAll ? "Báo cáo/tháng" : `Báo cáo ban hành (${scope.label})`;
    if (kpiReportSub) {
        kpiReportSub.textContent = isScopeAll
            ? `(Tổng kho: ${allTime.reports} báo cáo | ${yearDetailText}: ${totalReportsYear})`
            : `(${scope.shortLabel}: ${scopeReports} bc | ${yearDetailText}: ${totalReportsYear} bc | Tổng: ${allTime.reports})`;
    }

    // Điều khiển hiển thị nút Xem tất cả 12 tháng ở bảng chi tiết
    const btnResetScopeAll = document.getElementById("btnResetScopeAll");
    if (btnResetScopeAll) {
        btnResetScopeAll.style.display = isScopeAll ? "none" : "inline-flex";
    }

    // Cập nhật text trong Legend biểu đồ chính theo đúng phạm vi lọc
    const legPosts = document.getElementById("legMainPosts");
    const legAnnounce = document.getElementById("legMainAnnounce");
    const legReports = document.getElementById("legMainReports");
    if (isScopeAll) {
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
        if (currentYear === 'all') {
            subtitleEl.textContent = selectedScope === 'all'
                ? "Thống kê chi tiết Tổng kho tích lũy toàn bộ các năm: Bài viết đã đăng, Thông báo và Báo cáo ban hành"
                : `Thống kê chi tiết Tổng kho tích lũy theo ${scope.label}: Bài viết đã đăng, Thông báo và Báo cáo ban hành`;
        } else if (selectedScope === 'all') {
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
    const maxBarWidth = labels.length <= 1 ? 58 : (labels.length <= 3 ? 46 : (labels.length <= 6 ? 38 : 28));

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
            pointRadius: mainChartType === 'line' ? (labels.length === 1 ? 6.5 : 4.5) : 0,
            pointHoverRadius: labels.length === 1 ? 8.5 : 6
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
            pointRadius: mainChartType === 'line' ? (labels.length === 1 ? 6.5 : 4.5) : 0,
            pointHoverRadius: labels.length === 1 ? 8.5 : 6
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
            pointRadius: mainChartType === 'line' ? (labels.length === 1 ? 6.5 : 4.5) : 0,
            pointHoverRadius: labels.length === 1 ? 8.5 : 6
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
                            const yrText = currentYear === 'all' ? 'Toàn bộ các năm' : `Năm ${currentYear}`;
                            return mObj ? `${mObj.monthName} / ${yrText}` : `Tháng ${items[0].label} / ${yrText}`;
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
    const allTime = getAllTimeMetrics();
    const isYearAll = (currentYear === 'all');
    let totalPostsYear = 0;
    let totalAnnounceYear = 0;
    let totalReportsYear = 0;
    let totalPagesYear = 0;
    let totalCatYear = 0;
    let totalImagesYear = 0;

    allMonths.forEach(m => {
        totalPostsYear += (m.publishedPosts || 0);
        totalAnnounceYear += (m.announcements || 0);
        totalReportsYear += (m.reports || 0);
        totalPagesYear += (m.pages || 0);
        totalCatYear += (m.categories || 0);
        totalImagesYear += (m.images || 0);
    });

    const currentMonthObj = allMonths.find(m => m.month === currentMonth) || {
        publishedPosts: 0, announcements: 0, pendingPosts: 0, pages: 0, staff: 0, categories: 0, images: 0, reports: 0
    };

    const isAll = selectedScope === 'all';

    // 1. Cập nhật Mini 1 (Bài viết đã đăng)
    const badge1 = document.getElementById("miniBadge1");
    const foot1 = document.getElementById("miniFooter1");
    if (badge1) {
        badge1.textContent = isAll 
            ? `Tháng ${currentMonth}: ${currentMonthObj.publishedPosts} bài viết` 
            : `${scope.label}: ${scopePosts} bài viết`;
    }
    if (foot1) {
        foot1.innerHTML = isAll
            ? `<i class="fa-solid fa-circle-check text-emerald"></i> ${totalPostsYear} Bài viết ${isYearAll ? 'tích lũy' : 'năm ' + currentYear} (Tổng kho: ${allTime.posts})`
            : `<i class="fa-solid fa-circle-check text-emerald"></i> ${scopePosts} Bài viết trong ${scope.label}`;
    }

    // 2. Cập nhật Mini 2 (Tần suất tải ảnh)
    const badge2 = document.getElementById("miniBadge2");
    const foot2 = document.getElementById("miniFooter2");
    if (badge2) {
        badge2.textContent = isAll
            ? `THÁNG ${currentMonth}: ${currentMonthObj.images} Ảnh`
            : `${scope.label.toUpperCase()}: ${scopeImages} Ảnh`;
    }
    if (foot2) {
        foot2.innerHTML = isAll
            ? `<i class="fa-solid fa-images" style="color: #8b5cf6;"></i> ${totalImagesYear} Ảnh ${isYearAll ? 'tích lũy' : 'năm ' + currentYear} (Tổng kho: ${allTime.images} tệp)`
            : `<i class="fa-solid fa-images" style="color: #8b5cf6;"></i> ${scopeImages} Ảnh trong ${scope.label}`;
    }

    // 3. Cập nhật Mini 3 (Thông báo)
    const badge3 = document.getElementById("miniBadge3");
    const foot3 = document.getElementById("miniFooter3");
    if (badge3) {
        badge3.textContent = isAll
            ? `Tháng ${currentMonth}: ${currentMonthObj.announcements} Thông báo`
            : `${scope.label}: ${scopeAnnounce} Thông báo`;
    }
    if (foot3) {
        foot3.innerHTML = isAll
            ? `<i class="fa-solid fa-bullhorn" style="color: #0284c7;"></i> ${totalAnnounceYear} Thông báo ${isYearAll ? 'tích lũy' : 'năm ' + currentYear} (Tổng kho: ${allTime.announcements})`
            : `<i class="fa-solid fa-bullhorn" style="color: #0284c7;"></i> ${scopeAnnounce} Thông báo trong ${scope.label}`;
    }

    // 4. Cập nhật Mini 4 (Báo cáo)
    const badge4 = document.getElementById("miniBadge4");
    const foot4 = document.getElementById("miniFooter4");
    if (badge4) {
        badge4.textContent = isAll
            ? `Tháng ${currentMonth}: ${currentMonthObj.reports} Báo cáo`
            : `${scope.label}: ${scopeReports} Báo cáo`;
    }
    if (foot4) {
        foot4.innerHTML = isAll
            ? `<i class="fa-solid fa-file-contract" style="color: #e11d48;"></i> ${totalReportsYear} Báo cáo ${isYearAll ? 'tích lũy' : 'năm ' + currentYear} (Tổng kho: ${allTime.reports})`
            : `<i class="fa-solid fa-file-contract" style="color: #e11d48;"></i> ${scopeReports} Báo cáo trong ${scope.label}`;
    }

    // 5. Cập nhật Mini 5 (Trang & Phân hệ)
    const badge5 = document.getElementById("miniBadge5");
    const foot5 = document.getElementById("miniFooter5");
    if (badge5) {
        badge5.textContent = isAll
            ? `Tháng ${currentMonth}: ${currentMonthObj.pages} Trang`
            : `${scope.label}: ${scopePages} Trang`;
    }
    if (foot5) {
        foot5.innerHTML = isAll
            ? `<i class="fa-solid fa-cubes" style="color: #0d9488;"></i> ${totalPagesYear} Trang ${isYearAll ? 'tích lũy' : 'tạo mới năm ' + currentYear} (Tổng kho: ${allTime.pages} trang)`
            : `<i class="fa-solid fa-cubes" style="color: #0d9488;"></i> ${scopePages} Trang trong ${scope.label}`;
    }

    // 6. Cập nhật Mini 6 (Danh mục bài viết)
    const badge6 = document.getElementById("miniBadge6");
    const foot6 = document.getElementById("miniFooter6");
    if (badge6) {
        badge6.textContent = isAll
            ? `Tháng ${currentMonth}: ${currentMonthObj.categories} Danh mục`
            : `${scope.label}: ${scopeCat} Danh mục`;
    }
    if (foot6) {
        foot6.innerHTML = isAll
            ? `<i class="fa-solid fa-folder-tree" style="color: #7c3aed;"></i> ${totalCatYear} Danh mục ${isYearAll ? 'tích lũy' : 'tạo mới năm ' + currentYear} (Tổng kho: ${allTime.categories} dm)`
            : `<i class="fa-solid fa-folder-tree" style="color: #7c3aed;"></i> ${scopeCat} Danh mục trong ${scope.label}`;
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
    const isSingle = labels.length === 1;

    const chartConfig = isSingle ? {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: borderColor,
                borderRadius: 5,
                maxBarThickness: 32
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
                            const yrText = currentYear === 'all' ? 'Tổng kho' : currentYear;
                            return mObj ? `${mObj.monthName} / ${yrText}` : `Tháng ${items[0].label}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: "#64748b",
                        font: { size: 10, weight: '600' }
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(...data, 4) + 1,
                    grid: { color: "#f8fafc" },
                    ticks: {
                        color: "#cbd5e1",
                        font: { size: 9 },
                        stepSize: 1,
                        maxTicksLimit: 4
                    }
                }
            }
        }
    } : {
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
                            const yrText = currentYear === 'all' ? 'Tổng kho' : currentYear;
                            return mObj ? `${mObj.monthName} / ${yrText}` : `Tháng ${items[0].label}`;
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
    };

    const inst = new Chart(ctx, chartConfig);
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
        tableTitleEl.textContent = currentYear === 'all'
            ? (selectedScope === 'all' ? "Bảng Chỉ Số Chi Tiết Toàn Bộ Các Năm (Tổng Kho Tích Lũy)" : `Bảng Chỉ Số Chi Tiết Toàn Bộ (${scope.label})`)
            : (selectedScope === 'all' ? `Bảng Chỉ Số Chi Tiết 12 Tháng Năm ${currentYear}` : `Bảng Chỉ Số Chi Tiết Năm ${currentYear} (${scope.label})`);
    }
    if (tableSubEl) {
        tableSubEl.textContent = currentYear === 'all'
            ? "Tổng hợp số liệu tích lũy toàn bộ các năm theo từng tháng: bài viết đã đăng, thông báo, báo cáo, trang, danh mục, bài chờ đăng và ảnh media (Dữ liệu thực tế)"
            : (selectedScope === 'all'
                ? `Tổng hợp cụ thể bài viết đã đăng, thông báo, báo cáo, trang, danh mục, bài chờ đăng và ảnh media qua 12 tháng năm ${currentYear} (Dữ liệu thực tế)`
                : `Tổng hợp chi tiết theo ${scope.label} năm ${currentYear}: bài viết đã đăng, thông báo, báo cáo, trang, danh mục, bài chờ đăng và ảnh media`);
    }

    tbody.innerHTML = "";

    let totalPosts = 0;
    let totalAnnounce = 0;
    let totalReports = 0;
    let totalPages = 0;
    let totalCategories = 0;
    let totalStaff = 0;
    let totalPending = 0;
    let totalImages = 0;

    months.forEach(m => {
        const posts = m.publishedPosts || 0;
        const announce = m.announcements || 0;
        const reports = m.reports || 0;
        const pages = m.pages || 0;
        const cat = m.categories || 0;
        const staff = m.staff || 0;
        const pending = m.pendingPosts || 0;
        const images = m.images || 0;

        totalPosts += posts;
        totalAnnounce += announce;
        totalReports += reports;
        totalPages += pages;
        totalCategories += cat;
        totalStaff += staff;
        totalPending += pending;
        totalImages += images;

        // Tính tỷ lệ xuất bản
        const rate = (posts > 0 || pending > 0) ? "100%" : "-";

        // Đánh giá hoạt động
        const hasActivity = (posts > 0 || announce > 0 || reports > 0 || pages > 0 || cat > 0 || staff > 0 || images > 0);
        const evalText = hasActivity ? "+ Đạt chỉ tiêu" : "Chưa có dữ liệu";
        const evalClass = hasActivity ? "pill-status-target" : "pill-status-empty";

        const tr = document.createElement("tr");

        // Đánh dấu tháng 10 hiện tại nếu đang trong năm 2026
        const isCurrentMonth = (m.month === currentMonth && currentYear === 2026);
        const isSelectedMonth = (scope.isSingleMonth && scope.months.includes(m.month));
        if (isSelectedMonth) {
            tr.className = isCurrentMonth ? "row-current-month row-selected" : "row-selected";
        } else if (isCurrentMonth) {
            tr.className = "row-current-month";
        }

        // Định dạng badge các cột
        const postsBadge = posts > 0 ? `<span class="pill-badge pill-green">${posts} bài</span>` : `0 bài`;
        const announceBadge = announce > 0 ? `<span class="pill-badge pill-blue">${announce} thông báo</span>` : `0 thông báo`;
        const reportsBadge = reports > 0 ? `<span class="pill-badge pill-emerald-dark">${reports} báo cáo</span>` : `0 báo cáo`;
        const pagesBadge = pages > 0 ? `<span class="pill-badge pill-cyan">${pages} trang</span>` : `0 trang`;
        const catBadge = cat > 0 ? `<span class="pill-badge pill-purple">${cat} dm</span>` : `0 dm`;
        const staffBadge = staff > 0 ? `<span class="pill-badge pill-pink">+${staff} cb</span>` : `0`;
        const pendingBadge = pending > 0 ? `<span class="pill-badge pill-orange">${pending} bài</span>` : `0 bài`;
        const imagesBadge = images > 0 ? `<span class="pill-badge pill-purple">${images} ảnh</span>` : `0 ảnh`;

        // Tên tháng (làm nổi bật và cho phép bấm chọn nhanh để lọc theo tháng)
        const monthDisplayName = isCurrentMonth
            ? `<strong class="text-emerald">${m.monthName}</strong>`
            : `<strong>${m.monthName}</strong>`;
        const monthColHtml = `<a href="javascript:void(0)" class="month-scope-link" onclick="selectScopeMonth(${m.month})" title="Bấm để lọc xem riêng số liệu ${m.monthName}">${monthDisplayName}</a>`;
        const isYearAll = (currentYear === 'all');
        const yearForEdit = isYearAll ? 2026 : currentYear;
        tr.id = `reportTableRow_m${m.month}`;

        tr.innerHTML = `
            <td>${monthColHtml}</td>
            <td>${postsBadge}</td>
            <td>${announceBadge}</td>
            <td>${reportsBadge}</td>
            <td>${pagesBadge}</td>
            <td>${catBadge}</td>
            <td>${staffBadge}</td>
            <td>${pendingBadge}</td>
            <td>${imagesBadge}</td>
            <td><strong>${rate}</strong></td>
            <td><span class="pill-badge ${evalClass}">${evalText}</span></td>
            <td class="no-print" style="text-align: center;">
                <button type="button" class="btn-row-edit" title="Cập nhật số liệu ${m.monthName}" onclick="openUpdateDataModal(${yearForEdit}, ${m.month})">
                    <i class="fa-solid fa-pen-to-square"></i>
                    <span>Sửa</span>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Cập nhật dòng tổng kết ở TFOOT
    if (tfoot) {
        const totalLabel = currentYear === 'all'
            ? (selectedScope === 'all' ? `Tổng kho tích lũy toàn bộ các năm` : `Tổng kho tích lũy (${scope.label})`)
            : (selectedScope === 'all' ? `Tổng cả năm (${currentYear})` : `Tổng ${scope.label} (${currentYear})`);

        const staffFootText = totalStaff > 0 ? `+${totalStaff} cb` : `0 cb`;

        tfoot.innerHTML = `
            <tr>
                <td><strong>${totalLabel}</strong></td>
                <td><strong>${totalPosts} bài</strong></td>
                <td><strong>${totalAnnounce} thông báo</strong></td>
                <td><strong>${totalReports} báo cáo</strong></td>
                <td><strong>${totalPages} trang</strong></td>
                <td><strong>${totalCategories} dm</strong></td>
                <td><strong style="color: #ec4899;">${staffFootText}</strong></td>
                <td><strong style="color: #ea580c;">${totalPending} bài</strong></td>
                <td><strong>${totalImages} ảnh</strong></td>
                <td><strong>100%</strong></td>
                <td><span class="pill-badge pill-status-normal">+ Hoạt động bình thường</span></td>
                <td class="no-print"></td>
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

/* ===================================================================
   HỆ THỐNG QUẢN LÝ CHỮ KÝ BẢN IN (NGƯỜI LẬP & LÃNH ĐẠO) - TRANG 3
   =================================================================== */
const DEFAULT_SIG_P3 = {
    userTitle: 'NGƯỜI LẬP',
    userName: 'Nguyễn Thế Anh',
    userHint: '(Ký, ghi rõ họ tên)',
    leaderTitle: 'TRƯỞNG PHÒNG PHỤ TRÁCH',
    leaderName: '....................................................',
    leaderHint: '(Ký, ghi rõ họ tên)',
    datePlace: '',
    autoDate: true
};

function getTodayVietnameseDate3() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `Hà Nội, ngày ${d} tháng ${m} năm ${y}`;
}

function loadSignatureConfig3() {
    try {
        const raw = localStorage.getItem('ql_signature_p3');
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_SIG_P3, ...parsed };
        }
    } catch (e) {
        console.warn('Lỗi đọc cấu hình chữ ký từ localStorage:', e);
    }
    const sharedUser = localStorage.getItem('ql_signature_shared_user');
    if (sharedUser) {
        return { ...DEFAULT_SIG_P3, userName: sharedUser };
    }
    return { ...DEFAULT_SIG_P3 };
}

function saveSignatureConfig3(config) {
    try {
        localStorage.setItem('ql_signature_p3', JSON.stringify(config));
        if (config.userName) {
            localStorage.setItem('ql_signature_shared_user', config.userName);
        }
    } catch (e) {
        console.warn('Lỗi lưu cấu hình chữ ký vào localStorage:', e);
    }
}

function applySignatureToPrintDOM(config) {
    if (!config) config = loadSignatureConfig3();

    const printUserTitle = document.getElementById('printSignUserTitle');
    const printUserName = document.getElementById('printSignUserName');
    const printUserHint = document.getElementById('printSignUserHint');
    const printLeaderTitle = document.getElementById('printSignLeaderTitle');
    const printLeaderName = document.getElementById('printSignLeaderName');
    const printLeaderHint = document.getElementById('printSignLeaderHint');
    const printSignDate = document.getElementById('printSignDate');

    if (printUserTitle) printUserTitle.textContent = config.userTitle || DEFAULT_SIG_P3.userTitle;
    if (printUserName) printUserName.textContent = config.userName || DEFAULT_SIG_P3.userName;
    if (printUserHint) printUserHint.textContent = config.userHint || DEFAULT_SIG_P3.userHint;
    if (printLeaderTitle) printLeaderTitle.textContent = config.leaderTitle || DEFAULT_SIG_P3.leaderTitle;
    if (printLeaderName) printLeaderName.textContent = config.leaderName || DEFAULT_SIG_P3.leaderName;
    if (printLeaderHint) printLeaderHint.textContent = config.leaderHint || DEFAULT_SIG_P3.leaderHint;

    if (printSignDate) {
        const dateStr = config.autoDate ? getTodayVietnameseDate3() : (config.datePlace || getTodayVietnameseDate3());
        printSignDate.textContent = dateStr;
    }
}

function updateSignatureLivePreview3(config) {
    const prevUserTitle = document.getElementById('prevUserTitle');
    const prevUserName = document.getElementById('prevUserName');
    const prevUserHint = document.getElementById('prevUserHint');
    const prevLeaderTitle = document.getElementById('prevLeaderTitle');
    const prevLeaderName = document.getElementById('prevLeaderName');
    const prevLeaderHint = document.getElementById('prevLeaderHint');
    const prevDatePlace = document.getElementById('prevDatePlace');

    if (prevUserTitle) prevUserTitle.textContent = config.userTitle || DEFAULT_SIG_P3.userTitle;
    if (prevUserName) prevUserName.textContent = config.userName || DEFAULT_SIG_P3.userName;
    if (prevUserHint) prevUserHint.textContent = config.userHint || DEFAULT_SIG_P3.userHint;
    if (prevLeaderTitle) prevLeaderTitle.textContent = config.leaderTitle || DEFAULT_SIG_P3.leaderTitle;
    if (prevLeaderName) prevLeaderName.textContent = config.leaderName || DEFAULT_SIG_P3.leaderName;
    if (prevLeaderHint) prevLeaderHint.textContent = config.leaderHint || DEFAULT_SIG_P3.leaderHint;

    if (prevDatePlace) {
        const dateStr = config.autoDate ? getTodayVietnameseDate3() : (config.datePlace || getTodayVietnameseDate3());
        prevDatePlace.textContent = dateStr;
    }
}

function scrollToSignatureSection() {
    const sec = document.getElementById('signatureSection');
    if (sec) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sec.classList.remove('highlight-pulse');
        void sec.offsetWidth; // kích hoạt animation lại
        sec.classList.add('highlight-pulse');
        const inputName = document.getElementById('cfgUserName');
        if (inputName) {
            setTimeout(() => inputName.focus(), 400);
        }
    }
}

function initSignatureConfig() {
    const cfgUserTitle = document.getElementById('cfgUserTitle');
    const cfgUserName = document.getElementById('cfgUserName');
    const cfgUserHint = document.getElementById('cfgUserHint');
    const cfgLeaderTitle = document.getElementById('cfgLeaderTitle');
    const cfgLeaderName = document.getElementById('cfgLeaderName');
    const cfgLeaderHint = document.getElementById('cfgLeaderHint');
    const cfgDatePlace = document.getElementById('cfgDatePlace');
    const chkAutoDate = document.getElementById('chkAutoDate');
    const btnSaveSignatures = document.getElementById('btnSaveSignatures');
    const btnResetSignatures = document.getElementById('btnResetSignatures');
    const btnPreviewPrintFromSig = document.getElementById('btnPreviewPrintFromSig');

    if (!cfgUserName) return;

    const currentConfig = loadSignatureConfig3();

    cfgUserTitle.value = currentConfig.userTitle || DEFAULT_SIG_P3.userTitle;
    cfgUserName.value = currentConfig.userName || DEFAULT_SIG_P3.userName;
    cfgUserHint.value = currentConfig.userHint || DEFAULT_SIG_P3.userHint;
    cfgLeaderTitle.value = currentConfig.leaderTitle || DEFAULT_SIG_P3.leaderTitle;
    cfgLeaderName.value = currentConfig.leaderName || DEFAULT_SIG_P3.leaderName;
    cfgLeaderHint.value = currentConfig.leaderHint || DEFAULT_SIG_P3.leaderHint;
    if (chkAutoDate) chkAutoDate.checked = currentConfig.autoDate !== false;

    if (currentConfig.autoDate) {
        cfgDatePlace.value = getTodayVietnameseDate3();
        cfgDatePlace.disabled = true;
    } else {
        cfgDatePlace.value = currentConfig.datePlace || getTodayVietnameseDate3();
        cfgDatePlace.disabled = false;
    }

    updateSignatureLivePreview3(currentConfig);
    applySignatureToPrintDOM(currentConfig);

    function getFormConfig() {
        const isAuto = chkAutoDate ? chkAutoDate.checked : true;
        return {
            userTitle: cfgUserTitle.value.trim() || DEFAULT_SIG_P3.userTitle,
            userName: cfgUserName.value.trim() || DEFAULT_SIG_P3.userName,
            userHint: cfgUserHint.value.trim() || DEFAULT_SIG_P3.userHint,
            leaderTitle: cfgLeaderTitle.value.trim() || DEFAULT_SIG_P3.leaderTitle,
            leaderName: cfgLeaderName.value.trim() || DEFAULT_SIG_P3.leaderName,
            leaderHint: cfgLeaderHint.value.trim() || DEFAULT_SIG_P3.leaderHint,
            datePlace: isAuto ? getTodayVietnameseDate3() : cfgDatePlace.value.trim(),
            autoDate: isAuto
        };
    }

    [cfgUserTitle, cfgUserName, cfgUserHint, cfgLeaderTitle, cfgLeaderName, cfgLeaderHint, cfgDatePlace].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                const conf = getFormConfig();
                updateSignatureLivePreview3(conf);
                applySignatureToPrintDOM(conf);
            });
        }
    });

    if (chkAutoDate) {
        chkAutoDate.addEventListener('change', () => {
            if (chkAutoDate.checked) {
                cfgDatePlace.value = getTodayVietnameseDate3();
                cfgDatePlace.disabled = true;
            } else {
                cfgDatePlace.disabled = false;
            }
            const conf = getFormConfig();
            updateSignatureLivePreview3(conf);
            applySignatureToPrintDOM(conf);
        });
    }

    document.querySelectorAll('#signatureSection .preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const targetVal = btn.getAttribute('data-val');
            const el = document.getElementById(targetId);
            if (el && targetVal) {
                el.value = targetVal;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });

    if (btnSaveSignatures) {
        btnSaveSignatures.addEventListener('click', () => {
            const conf = getFormConfig();
            saveSignatureConfig3(conf);
            updateSignatureLivePreview3(conf);
            applySignatureToPrintDOM(conf);

            // Cập nhật tên tài khoản trên Topbar và Sidebar nếu có
            const userMeta = document.querySelector('.user-meta');
            if (userMeta && conf.userName) {
                userMeta.textContent = `Người dùng: ${conf.userName} (theanhthtc@vnu.edu.vn)`;
            }
            const userFullName = document.querySelector('.user-fullname');
            if (userFullName && conf.userName) {
                userFullName.textContent = conf.userName;
            }

            const originalHtml = btnSaveSignatures.innerHTML;
            btnSaveSignatures.innerHTML = '<i class="fa-solid fa-circle-check"></i> Đã Lưu Thành Công!';
            btnSaveSignatures.style.background = '#059669';
            setTimeout(() => {
                btnSaveSignatures.innerHTML = originalHtml;
                btnSaveSignatures.style.background = '';
            }, 1800);

            showToast(`Đã lưu chữ ký in: ${conf.userName} (Người lập) & ${conf.leaderTitle}`, 'success');
        });
    }

    if (btnResetSignatures) {
        btnResetSignatures.addEventListener('click', () => {
            cfgUserTitle.value = DEFAULT_SIG_P3.userTitle;
            cfgUserName.value = DEFAULT_SIG_P3.userName;
            cfgUserHint.value = DEFAULT_SIG_P3.userHint;
            cfgLeaderTitle.value = DEFAULT_SIG_P3.leaderTitle;
            cfgLeaderName.value = DEFAULT_SIG_P3.leaderName;
            cfgLeaderHint.value = DEFAULT_SIG_P3.leaderHint;
            if (chkAutoDate) chkAutoDate.checked = true;
            cfgDatePlace.value = getTodayVietnameseDate3();
            cfgDatePlace.disabled = true;

            saveSignatureConfig3(DEFAULT_SIG_P3);
            updateSignatureLivePreview3(DEFAULT_SIG_P3);
            applySignatureToPrintDOM(DEFAULT_SIG_P3);

            showToast('Đã khôi phục thông tin chữ ký bản in về mặc định!', 'info');
        });
    }

    if (btnPreviewPrintFromSig) {
        btnPreviewPrintFromSig.addEventListener('click', () => {
            const conf = getFormConfig();
            saveSignatureConfig3(conf);
            applySignatureToPrintDOM(conf);
            const btnPrintEl = document.getElementById("btnPrintReport");
            if (btnPrintEl) btnPrintEl.click();
        });
    }
}

/* ===================================================================
   TRANG 3: CHỨC NĂNG CẬP NHẬT DỮ LIỆU SỐ LIỆU CMS THEO THÁNG
   =================================================================== */

const CMS_METRIC_CONFIG = [
    { key: 'publishedPosts', name: 'Bài viết đã đăng', unit: 'bài', defaultStep: 1 },
    { key: 'announcements', name: 'Thông báo', unit: 'thông báo', defaultStep: 1 },
    { key: 'reports', name: 'Báo cáo', unit: 'báo cáo', defaultStep: 1 },
    { key: 'pages', name: 'Trang', unit: 'trang', defaultStep: 1 },
    { key: 'categories', name: 'Danh mục', unit: 'dm', defaultStep: 1 },
    { key: 'staff', name: 'Cán bộ', unit: 'cán bộ', defaultStep: 1 },
    { key: 'pendingPosts', name: 'Bài viết chờ đăng', unit: 'bài', defaultStep: 1 },
    { key: 'images', name: 'Ảnh Media tải lên', unit: 'ảnh', defaultStep: 5 }
];

// Trạng thái modal cập nhật
let modalEditYear = 2026;
let modalEditMonth = 10;
let modalEditMode = 'delta'; // 'delta' (+/-) hoặc 'direct' (nhập trực tiếp)
let modalDeltas = {};
let modalDirectValues = {};

/**
 * Phục hồi các chỉnh sửa thủ công của người dùng từ LocalStorage vào yearlyData
 */
function applyUserModificationsToYearlyData() {
    const rawMods = localStorage.getItem('ql_sheet3_user_modifications');
    if (!rawMods) return;
    try {
        const mods = JSON.parse(rawMods);
        if (mods && typeof mods === 'object') {
            Object.keys(mods).forEach(key => {
                const parts = key.split('_');
                if (parts.length === 2) {
                    const yr = parseInt(parts[0], 10);
                    const mo = parseInt(parts[1], 10);
                    if (yearlyData[yr]) {
                        const targetMonth = yearlyData[yr].find(item => item.month === mo);
                        if (targetMonth) {
                            CMS_METRIC_CONFIG.forEach(cfg => {
                                if (mods[key][cfg.key] !== undefined) {
                                    targetMonth[cfg.key] = mods[key][cfg.key];
                                }
                            });
                        }
                    }
                }
            });
        }
    } catch (e) {
        console.warn("Lỗi khi phục hồi chỉnh sửa của người dùng:", e);
    }
}

/**
 * Lấy giá trị hiện tại của một mục trong tháng đã chọn
 */
function getCurrentMonthValue(year, month, key) {
    const yearList = yearlyData[year] || [];
    const mObj = yearList.find(item => item.month === month);
    return mObj ? (mObj[key] || 0) : 0;
}

/**
 * Khởi tạo sự kiện cho Modal Cập Nhật Dữ Liệu
 */
function initUpdateDataModalEvents() {
    // 1. Nút mở modal từ Topbar, Toolbar, Table và Quick Actions
    const topBtn = document.getElementById("topUpdateDataBtn");
    if (topBtn) {
        topBtn.addEventListener("click", () => openUpdateDataModal());
    }

    const toolbarBtn = document.getElementById("btnOpenUpdateDataModal");
    if (toolbarBtn) {
        toolbarBtn.addEventListener("click", () => openUpdateDataModal());
    }

    const tableBtn = document.getElementById("btnTableUpdateData");
    if (tableBtn) {
        tableBtn.addEventListener("click", () => openUpdateDataModal());
    }

    const quickBtn = document.getElementById("btnQuickUpdateData");
    if (quickBtn) {
        quickBtn.addEventListener("click", () => openUpdateDataModal());
    }

    // 2. Nút đóng modal
    const closeBtn = document.getElementById("btnCloseUpdateDataModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => closeUpdateDataModal());
    }

    const cancelBtn = document.getElementById("btnCancelUpdateData");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => closeUpdateDataModal());
    }

    // Click backdrop để đóng
    const modalBackdrop = document.getElementById("updateDataModal");
    if (modalBackdrop) {
        modalBackdrop.addEventListener("click", (e) => {
            if (e.target === modalBackdrop) {
                closeUpdateDataModal();
            }
        });
    }

    // 3. Dropdown chọn Năm trong modal
    const selectYear = document.getElementById("modalSelectYear");
    if (selectYear) {
        selectYear.addEventListener("change", (e) => {
            modalEditYear = parseInt(e.target.value, 10) || 2026;
            loadMonthDataToModal(modalEditYear, modalEditMonth);
        });
    }

    // 4. Lưới 12 nút Tháng
    const monthBtns = document.querySelectorAll(".month-picker-btn");
    monthBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const m = parseInt(btn.getAttribute("data-month"), 10);
            if (m && m >= 1 && m <= 12) {
                modalEditMonth = m;
                monthBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                loadMonthDataToModal(modalEditYear, modalEditMonth);
            }
        });
    });

    // 5. Chuyển đổi chế độ (Cộng/Trừ vs Nhập trực tiếp)
    const btnDelta = document.getElementById("btnModeDelta");
    const btnDirect = document.getElementById("btnModeDirect");
    const hintText = document.getElementById("modeHintText");

    if (btnDelta && btnDirect) {
        btnDelta.addEventListener("click", () => {
            if (modalEditMode !== 'delta') {
                modalEditMode = 'delta';
                btnDelta.classList.add("active");
                btnDirect.classList.remove("active");
                if (hintText) {
                    hintText.innerHTML = 'Chế độ <strong>Cộng thêm / Trừ bớt</strong>: nhập số lượng muốn tăng hoặc giảm (+/-), hệ thống tự tính kết quả mới.';
                }
                updateModalInputsForCurrentMode();
            }
        });

        btnDirect.addEventListener("click", () => {
            if (modalEditMode !== 'direct') {
                modalEditMode = 'direct';
                btnDirect.classList.add("active");
                btnDelta.classList.remove("active");
                if (hintText) {
                    hintText.innerHTML = 'Chế độ <strong>Nhập trực tiếp</strong>: đặt con số tổng mới cho tháng đã chọn.';
                }
                updateModalInputsForCurrentMode();
            }
        });
    }

    // 6. Stepper [-] và [+]
    document.querySelectorAll(".btn-stepper-minus").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-key");
            handleStepperChange(key, -1);
        });
    });

    document.querySelectorAll(".btn-stepper-plus").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-key");
            handleStepperChange(key, 1);
        });
    });

    // 7. Nhập trực tiếp vào ô input
    document.querySelectorAll(".input-metric-val").forEach(input => {
        input.addEventListener("input", () => {
            const key = input.getAttribute("data-key");
            const val = parseInt(input.value, 10) || 0;
            if (modalEditMode === 'delta') {
                modalDeltas[key] = val;
            } else {
                modalDirectValues[key] = Math.max(0, val);
            }
            updateModalCardPreview(key);
            updateModalSummaryPreview();
        });
    });

    // 8. Quick shortcut chips (+1, +5, -1, 0)
    document.querySelectorAll(".quick-chip-btn").forEach(chip => {
        chip.addEventListener("click", () => {
            const key = chip.getAttribute("data-key");
            if (chip.hasAttribute("data-setzero")) {
                if (modalEditMode === 'delta') {
                    const currentVal = getCurrentMonthValue(modalEditYear, modalEditMonth, key);
                    modalDeltas[key] = -currentVal;
                } else {
                    modalDirectValues[key] = 0;
                }
            } else if (chip.hasAttribute("data-delta")) {
                const delta = parseInt(chip.getAttribute("data-delta"), 10) || 0;
                if (modalEditMode === 'delta') {
                    modalDeltas[key] = (modalDeltas[key] || 0) + delta;
                } else {
                    modalDirectValues[key] = Math.max(0, (modalDirectValues[key] || 0) + delta);
                }
            }
            updateModalCardInput(key);
            updateModalCardPreview(key);
            updateModalSummaryPreview();
        });
    });

    // 9. Nút Khôi phục dữ liệu gốc tháng này
    const btnReset = document.getElementById("btnResetMonthData");
    if (btnReset) {
        btnReset.addEventListener("click", () => {
            handleResetCurrentMonth();
        });
    }

    // 10. Nút Xác nhận & Lưu
    const btnSave = document.getElementById("btnSaveUpdateData");
    if (btnSave) {
        btnSave.addEventListener("click", () => {
            handleSaveUpdateData();
        });
    }

    // 11. Accordion cấu hình Webhook Trang 3
    const toggleWebhookAccordion3 = document.getElementById("toggleWebhookAccordion3");
    const webhookAccordion3 = document.getElementById("webhookAccordion3");
    if (toggleWebhookAccordion3 && webhookAccordion3) {
        toggleWebhookAccordion3.addEventListener("click", () => {
            webhookAccordion3.classList.toggle("open");
        });
    }

    // 12. Nút lưu Webhook trong accordion
    const btnSaveWebhookUrl3 = document.getElementById("btnSaveWebhookUrl3");
    const inputWebhookUrl3 = document.getElementById("inputWebhookUrl3");
    if (btnSaveWebhookUrl3 && inputWebhookUrl3) {
        btnSaveWebhookUrl3.addEventListener("click", () => {
            const url = inputWebhookUrl3.value.trim();
            if (url) {
                if (url.includes('docs.google.com/spreadsheets')) {
                    showToast("Đây là link xem Google Sheet thông thường! Để tự động ghi dữ liệu, bạn cần dán URL Webhook (từ Google Apps Script hoặc n8n/Make/Zapier)!", "warning");
                    return;
                }
                if (!url.startsWith('https://') && !url.startsWith('http://')) {
                    showToast("Link Webhook không hợp lệ! URL phải bắt đầu bằng https:// (ví dụ URL Web App Apps Script hoặc Webhook n8n).", "warning");
                    return;
                }
                localStorage.setItem('ql_sheet3_webhook_url', url);
                updateWebhookStatusUI3();
                showToast("Đã lưu và kích hoạt Webhook Trang 3 thành công! Các số liệu từ nay sẽ tự động cập nhật vào Google Sheet.", "success");
            } else {
                localStorage.removeItem('ql_sheet3_webhook_url');
                updateWebhookStatusUI3();
                showToast("Đã xóa Webhook Trang 3.", "info");
            }
        });
    }
}

/**
 * Mở modal Cập Nhật Dữ Liệu
 */
function openUpdateDataModal(targetYear, targetMonth) {
    const modal = document.getElementById("updateDataModal");
    if (!modal) return;

    if (targetYear && [2025, 2026, 2027, 2028].includes(parseInt(targetYear, 10))) {
        modalEditYear = parseInt(targetYear, 10);
    } else {
        modalEditYear = (currentYear === 'all') ? 2026 : currentYear;
    }

    if (targetMonth && targetMonth >= 1 && targetMonth <= 12) {
        modalEditMonth = parseInt(targetMonth, 10);
    } else {
        modalEditMonth = currentMonth || 10;
    }

    // Cập nhật giá trị vào dropdown năm
    const selectYear = document.getElementById("modalSelectYear");
    if (selectYear) selectYear.value = String(modalEditYear);

    // Cập nhật ngày ghi nhận thời gian thực
    const dateInput = document.getElementById("modalRecordedDate");
    if (dateInput) {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${y}-${m}-${d}`;
    }

    // Nạp dữ liệu tháng
    loadMonthDataToModal(modalEditYear, modalEditMonth);

    modal.classList.add("show");
    modal.style.display = "flex";
}

/**
 * Đóng modal Cập Nhật Dữ Liệu
 */
function closeUpdateDataModal() {
    const modal = document.getElementById("updateDataModal");
    if (modal) {
        modal.classList.remove("show");
        modal.style.display = "none";
    }
}

/**
 * Nạp dữ liệu của tháng vào modal
 */
function loadMonthDataToModal(year, month) {
    // 1. Cập nhật nhãn tháng đang chọn
    const activeLabel = document.getElementById("modalActiveMonthLabel");
    if (activeLabel) {
        activeLabel.textContent = `Tháng ${month} / Năm ${year}`;
    }

    // 2. Active button tháng trên grid
    const monthBtns = document.querySelectorAll(".month-picker-btn");
    monthBtns.forEach(btn => {
        const m = parseInt(btn.getAttribute("data-month"), 10);
        if (m === month) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // 3. Khởi tạo giá trị ban đầu cho 8 mục
    modalDeltas = {};
    modalDirectValues = {};

    CMS_METRIC_CONFIG.forEach(cfg => {
        const currentVal = getCurrentMonthValue(year, month, cfg.key);
        modalDeltas[cfg.key] = 0;
        modalDirectValues[cfg.key] = currentVal;

        // Cập nhật badge hiện tại
        const badge = document.getElementById(`badgeCurrent_${cfg.key}`);
        if (badge) {
            badge.textContent = `Hiện tại: ${currentVal} ${cfg.unit}`;
        }

        updateModalCardInput(cfg.key);
        updateModalCardPreview(cfg.key);
    });

    updateModalSummaryPreview();
}

/**
 * Chuyển đổi hiển thị input theo chế độ
 */
function updateModalInputsForCurrentMode() {
    CMS_METRIC_CONFIG.forEach(cfg => {
        updateModalCardInput(cfg.key);
        updateModalCardPreview(cfg.key);
    });
    updateModalSummaryPreview();
}

/**
 * Cập nhật giá trị hiển thị trong ô input
 */
function updateModalCardInput(key) {
    const input = document.getElementById(`input_${key}`);
    if (!input) return;
    if (modalEditMode === 'delta') {
        const delta = modalDeltas[key] || 0;
        input.value = delta > 0 ? `+${delta}` : delta;
    } else {
        input.value = modalDirectValues[key] !== undefined ? modalDirectValues[key] : 0;
    }
}

/**
 * Cập nhật preview kết quả sau thay đổi cho từng thẻ
 */
function updateModalCardPreview(key) {
    const cfg = CMS_METRIC_CONFIG.find(c => c.key === key);
    if (!cfg) return;

    const currentVal = getCurrentMonthValue(modalEditYear, modalEditMonth, key);
    let newVal = currentVal;
    let delta = 0;

    if (modalEditMode === 'delta') {
        delta = modalDeltas[key] || 0;
        newVal = Math.max(0, currentVal + delta);
        delta = newVal - currentVal;
    } else {
        newVal = Math.max(0, modalDirectValues[key] !== undefined ? modalDirectValues[key] : currentVal);
        delta = newVal - currentVal;
    }

    const prevEl = document.getElementById(`preview_${key}`);
    if (prevEl) {
        prevEl.textContent = `${newVal} ${cfg.unit}`;
    }

    const diffEl = document.getElementById(`diff_${key}`);
    if (diffEl) {
        if (delta > 0) {
            diffEl.textContent = `+${delta}`;
            diffEl.className = "metric-diff-badge diff-positive";
        } else if (delta < 0) {
            diffEl.textContent = `${delta}`;
            diffEl.className = "metric-diff-badge diff-negative";
        } else {
            diffEl.textContent = "0";
            diffEl.className = "metric-diff-badge diff-neutral";
        }
    }
}

/**
 * Xử lý khi nhấn nút Stepper [-] hoặc [+]
 */
function handleStepperChange(key, stepSign) {
    const cfg = CMS_METRIC_CONFIG.find(c => c.key === key);
    const step = (cfg && cfg.defaultStep) ? cfg.defaultStep : 1;
    const change = stepSign * step;

    if (modalEditMode === 'delta') {
        modalDeltas[key] = (modalDeltas[key] || 0) + change;
    } else {
        modalDirectValues[key] = Math.max(0, (modalDirectValues[key] || 0) + change);
    }

    updateModalCardInput(key);
    updateModalCardPreview(key);
    updateModalSummaryPreview();
}

/**
 * Cập nhật dòng tóm tắt thay đổi ở chân modal
 */
function updateModalSummaryPreview() {
    const summaryText = document.getElementById("previewSummaryText");
    const statusBadge = document.getElementById("previewStatusBadge");
    if (!summaryText || !statusBadge) return;

    let changes = [];
    CMS_METRIC_CONFIG.forEach(cfg => {
        const currentVal = getCurrentMonthValue(modalEditYear, modalEditMonth, cfg.key);
        let newVal = currentVal;
        if (modalEditMode === 'delta') {
            newVal = Math.max(0, currentVal + (modalDeltas[cfg.key] || 0));
        } else {
            newVal = Math.max(0, modalDirectValues[cfg.key] !== undefined ? modalDirectValues[cfg.key] : currentVal);
        }
        const delta = newVal - currentVal;
        if (delta !== 0) {
            changes.push(`${cfg.name}: ${delta > 0 ? '+' : ''}${delta}`);
        }
    });

    if (changes.length > 0) {
        summaryText.innerHTML = `<strong>Tháng ${modalEditMonth}/${modalEditYear}:</strong> ${changes.join(' &bull; ')}`;
        statusBadge.innerHTML = `<span style="color: #059669; font-weight: 700;">• Có ${changes.length} mục thay đổi</span>`;
    } else {
        summaryText.innerHTML = `Đang chọn <strong>Tháng ${modalEditMonth} / Năm ${modalEditYear}</strong>. Bấm nút [+] [-] hoặc nhập trực tiếp để điều chỉnh số liệu.`;
        statusBadge.innerHTML = `• Chưa có thay đổi`;
    }
}

/**
 * Xác nhận & Lưu dữ liệu cập nhật
 */
function handleSaveUpdateData() {
    if (!yearlyData[modalEditYear]) {
        yearlyData[modalEditYear] = [];
    }

    let monthItem = yearlyData[modalEditYear].find(m => m.month === modalEditMonth);
    if (!monthItem) {
        monthItem = {
            month: modalEditMonth,
            monthName: `Tháng ${modalEditMonth}`,
            images: 0, publishedPosts: 0, pendingPosts: 0, reports: 0, announcements: 0, categories: 0, staff: 0, pages: 0
        };
        yearlyData[modalEditYear].push(monthItem);
        yearlyData[modalEditYear].sort((a, b) => a.month - b.month);
    }

    const modifiedMetrics = {};
    let hasChanges = false;

    CMS_METRIC_CONFIG.forEach(cfg => {
        const currentVal = monthItem[cfg.key] || 0;
        let newVal = currentVal;
        if (modalEditMode === 'delta') {
            newVal = Math.max(0, currentVal + (modalDeltas[cfg.key] || 0));
        } else {
            newVal = Math.max(0, modalDirectValues[cfg.key] !== undefined ? modalDirectValues[cfg.key] : currentVal);
        }

        if (newVal !== currentVal) {
            hasChanges = true;
        }

        monthItem[cfg.key] = newVal;
        modifiedMetrics[cfg.key] = newVal;
    });

    // Lưu vào userModifications
    const modKey = `${modalEditYear}_${modalEditMonth}`;
    let userMods = {};
    try {
        const saved = localStorage.getItem('ql_sheet3_user_modifications');
        if (saved) userMods = JSON.parse(saved);
    } catch (e) {}

    const recordedDate = document.getElementById("modalRecordedDate")?.value || "";
    userMods[modKey] = {
        ...modifiedMetrics,
        recordedDate: recordedDate,
        updatedAt: new Date().toISOString()
    };

    try {
        localStorage.setItem('ql_sheet3_user_modifications', JSON.stringify(userMods));
        localStorage.setItem('ql_sheet3_cached_data', JSON.stringify(yearlyData));
    } catch (lsErr) {
        console.warn("Lỗi lưu LocalStorage:", lsErr);
    }

    // Đóng modal
    closeUpdateDataModal();

    // Làm mới toàn bộ Dashboard ngay lập tức (8 KPI cards, biểu đồ chính, 6 biểu đồ mini, bảng chi tiết)
    renderAll();

    // Highlight dòng tháng vừa được cập nhật trong bảng chi tiết
    highlightTableRow(modalEditMonth);

    // Hiển thị thông báo Toast
    showToast(`Đã cập nhật số liệu Tháng ${modalEditMonth} / Năm ${modalEditYear} thành công!`, "success");

    // 2. Kiểm tra Webhook để tự động ghi vào Google Sheet
    const webhookUrl = getActiveWebhookUrl3();
    const isWebhookValid = Boolean(webhookUrl && (webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://')) && !webhookUrl.includes('docs.google.com/spreadsheets'));

    const updatePayload = {
        year: modalEditYear,
        month: modalEditMonth,
        images: monthItem.images,
        publishedPosts: monthItem.publishedPosts,
        pendingPosts: monthItem.pendingPosts,
        reports: monthItem.reports,
        announcements: monthItem.announcements,
        categories: monthItem.categories,
        staff: monthItem.staff,
        pages: monthItem.pages,
        gid: 0
    };

    lastUpdatedPayload3 = updatePayload;

    if (isWebhookValid) {
        sendUpdateToGoogleSheetWebhook3(webhookUrl, updatePayload);
    } else {
        openPostUpdateSyncModal3(updatePayload);
    }
}

let lastUpdatedPayload3 = null;

/**
 * Lấy URL Webhook Trang 3 hiện tại (kết hợp localStorage và cấu hình mặc định)
 */
function getActiveWebhookUrl3() {
    let savedUrl = '';
    try {
        savedUrl = (localStorage.getItem('ql_sheet3_webhook_url') || '').trim();
    } catch (e) {}
    if (!savedUrl && window.DEFAULT_WEBHOOK_URL_SHEET3) {
        savedUrl = String(window.DEFAULT_WEBHOOK_URL_SHEET3).trim();
    }
    return savedUrl;
}

/**
 * Cập nhật giao diện trạng thái Webhook Trang 3
 */
function updateWebhookStatusUI3() {
    const savedUrl = getActiveWebhookUrl3();
    const isValid = Boolean(savedUrl && (savedUrl.startsWith('http://') || savedUrl.startsWith('https://')) && !savedUrl.includes('docs.google.com/spreadsheets'));

    const inputWebhookUrl3 = document.getElementById('inputWebhookUrl3');
    const inputWebhookUrlGuide3 = document.getElementById('inputWebhookUrlGuide3');
    const webhookStatusBadge3 = document.getElementById('webhookStatusBadge3');
    const topbarWebhookBadge3 = document.getElementById('topbarWebhookBadge3');
    const topbarWebhookText3 = document.getElementById('topbarWebhookText3');

    if (inputWebhookUrl3) inputWebhookUrl3.value = savedUrl;
    if (inputWebhookUrlGuide3) inputWebhookUrlGuide3.value = savedUrl;

    if (webhookStatusBadge3) {
        if (isValid) {
            webhookStatusBadge3.textContent = "Đã kết nối Webhook";
            webhookStatusBadge3.style.background = "#dcfce7";
            webhookStatusBadge3.style.color = "#15803d";
            webhookStatusBadge3.style.borderColor = "#bbf7d0";
        } else {
            webhookStatusBadge3.textContent = "Chưa kết nối Webhook";
            webhookStatusBadge3.style.background = "#fff7ed";
            webhookStatusBadge3.style.color = "#c2410c";
            webhookStatusBadge3.style.borderColor = "#fed7aa";
        }
    }

    if (topbarWebhookBadge3 && topbarWebhookText3) {
        if (isValid) {
            topbarWebhookBadge3.className = "topbar-webhook-badge connected";
            topbarWebhookText3.textContent = "Webhook: Tự động ghi Sheet";
            topbarWebhookBadge3.title = "Đã kết nối Webhook Trang 3. Bấm để xem hoặc thay đổi URL";
        } else {
            topbarWebhookBadge3.className = "topbar-webhook-badge disconnected";
            topbarWebhookText3.textContent = "Webhook: Chưa kết nối";
            topbarWebhookBadge3.title = "Chưa kết nối Webhook ghi Google Sheet Trang 3. Bấm để thiết lập tự động trong 30 giây";
        }
    }
}

/**
 * Giữ ấm máy chủ Apps Script Trang 3 (Keep-Alive Ping) mỗi 4 phút để chống lag / cold start
 */
function initWebhookKeepAlive3() {
    setInterval(() => {
        const url = getActiveWebhookUrl3();
        if (url && url.startsWith('https://script.google.com/macros/s/')) {
            fetch(url + '?ping=keepalive', { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
        }
    }, 4 * 60 * 1000);
}

/**
 * Gửi dữ liệu cập nhật tới Webhook (Google Apps Script hoặc n8n) - Chạy ngầm chống lag
 */
async function sendUpdateToGoogleSheetWebhook3(webhookUrl, payload) {
    try {
        showToast(`Đang đồng bộ số liệu Tháng ${payload.month}/${payload.year} lên Google Sheet...`, "info");
        
        // Gửi ngầm (asynchronous background) - giao diện người dùng không bị đơ/lag
        fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        }).then(() => {
            showToast(`Đã đồng bộ số liệu Tháng ${payload.month}/${payload.year} vào Google Sheet thành công!`, "success");
            // Sau 4s, tự động refresh để tải số liệu mới nhất từ Google Sheet
            setTimeout(() => {
                syncDataFromGoogleSheet(false);
            }, 4000);
        }).catch(err => {
            console.warn("Lỗi gửi dữ liệu tới Webhook Trang 3:", err);
            showToast("Đã lưu trên website nhưng gửi tới Webhook gặp trục trặc!", "warning");
        });

        return true;
    } catch (err) {
        console.warn("Lỗi gửi dữ liệu tới Webhook Trang 3:", err);
        showToast("Đã lưu trên website nhưng chưa thể gửi tới Webhook (hãy kiểm tra URL Apps Script / n8n)!", "warning");
        return false;
    }
}

/**
 * Sao chép 8 giá trị của tháng đang chọn và mở file Google Sheet
 */
function handleCopyMonthAndOpenSheet() {
    let monthItem = (yearlyData[modalEditYear] || []).find(m => m.month === modalEditMonth);
    const img = (monthItem && monthItem.images !== undefined) ? monthItem.images : 0;
    const pub = (monthItem && monthItem.publishedPosts !== undefined) ? monthItem.publishedPosts : 0;
    const pen = (monthItem && monthItem.pendingPosts !== undefined) ? monthItem.pendingPosts : 0;
    const rep = (monthItem && monthItem.reports !== undefined) ? monthItem.reports : 0;
    const ann = (monthItem && monthItem.announcements !== undefined) ? monthItem.announcements : 0;
    const cat = (monthItem && monthItem.categories !== undefined) ? monthItem.categories : 0;
    const stf = (monthItem && monthItem.staff !== undefined) ? monthItem.staff : 0;
    const pag = (monthItem && monthItem.pages !== undefined) ? monthItem.pages : 0;

    const tsvData = `${img}\t${pub}\t${pen}\t${rep}\t${ann}\t${cat}\t${stf}\t${pag}`;

    const finishCopy = () => {
        showToast(`Đã sao chép 8 số liệu Tháng ${modalEditMonth}/${modalEditYear}! Hãy click ô Cột B của dòng này và bấm Ctrl+V.`, "success");
        window.open(DEFAULT_SHEET3_URL, '_blank');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tsvData).then(finishCopy).catch(() => {
            prompt(`Sao chép dữ liệu Tháng ${modalEditMonth}/${modalEditYear} (Ctrl+C) rồi dán vào cột B:`, tsvData);
            window.open(DEFAULT_SHEET3_URL, '_blank');
        });
    } else {
        prompt(`Sao chép dữ liệu Tháng ${modalEditMonth}/${modalEditYear} (Ctrl+C) rồi dán vào cột B:`, tsvData);
        window.open(DEFAULT_SHEET3_URL, '_blank');
    }
}

/**
 * Mở modal hướng dẫn Google Apps Script Trang 3
 */
window.openAppsScriptGuideModal3 = function() {
    const modal = document.getElementById('appsScriptGuideModal3');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
        const input = document.getElementById('inputWebhookUrlGuide3');
        if (input) input.value = localStorage.getItem('ql_sheet3_webhook_url') || '';
    }
};

window.closeAppsScriptGuideModal3 = function() {
    const modal = document.getElementById('appsScriptGuideModal3');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
};

/**
 * Mở modal thông báo sau khi cập nhật nếu chưa có Webhook
 */
window.openPostUpdateSyncModal3 = function(payload) {
    lastUpdatedPayload3 = payload;
    const modal = document.getElementById('postUpdateSyncModal3');
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';

        const targetLabel = document.getElementById('postUpdateTargetLabel');
        const detailsText = document.getElementById('postUpdateDetailsText');
        if (targetLabel) {
            targetLabel.textContent = `Tháng ${payload.month} / Năm ${payload.year}`;
        }
        if (detailsText) {
            detailsText.innerHTML = `Đã cập nhật: <strong>Ảnh:</strong> ${payload.images} &bull; <strong>Bài đăng:</strong> ${payload.publishedPosts} &bull; <strong>Báo cáo:</strong> ${payload.reports} &bull; <strong>Trang:</strong> ${payload.pages} &bull; <strong>Danh mục:</strong> ${payload.categories} &bull; <strong>Cán bộ:</strong> ${payload.staff}`;
        }
    }
};

window.closePostUpdateSyncModal3 = function() {
    const modal = document.getElementById('postUpdateSyncModal3');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
};

/**
 * Xử lý sao chép từ postUpdateSyncModal3
 */
window.handlePostUpdateCopyAndOpen3 = function() {
    if (!lastUpdatedPayload3) return;
    const p = lastUpdatedPayload3;
    const tsvData = `${p.images}\t${p.publishedPosts}\t${p.pendingPosts}\t${p.reports}\t${p.announcements}\t${p.categories}\t${p.staff}\t${p.pages}`;

    const finishCopy = () => {
        showToast(`Đã sao chép 8 số liệu Tháng ${p.month}/${p.year}! Đang mở Google Sheet...`, "success");
        window.open(DEFAULT_SHEET3_URL, '_blank');
        closePostUpdateSyncModal3();
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tsvData).then(finishCopy).catch(() => {
            prompt(`Sao chép dữ liệu Tháng ${p.month}/${p.year} (Ctrl+C):`, tsvData);
            window.open(DEFAULT_SHEET3_URL, '_blank');
            closePostUpdateSyncModal3();
        });
    } else {
        prompt(`Sao chép dữ liệu Tháng ${p.month}/${p.year} (Ctrl+C):`, tsvData);
        window.open(DEFAULT_SHEET3_URL, '_blank');
        closePostUpdateSyncModal3();
    }
};

/**
 * Sao chép mã Google Apps Script Trang 3
 */
window.handleCopyAppsScriptCode3 = function() {
    const codeEl = document.getElementById('appsScriptCodeText3');
    if (!codeEl) return;
    const text = codeEl.innerText || codeEl.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Đã sao chép mã Apps Script Trang 3 vào bộ nhớ tạm!", "success");
        }).catch(() => {
            prompt("Sao chép mã Apps Script bên dưới (Ctrl+C):", text);
        });
    } else {
        prompt("Sao chép mã Apps Script bên dưới (Ctrl+C):", text);
    }
};

/**
 * Lưu Webhook từ Modal hướng dẫn Trang 3
 */
window.handleSaveWebhookFromGuide3 = function() {
    const input = document.getElementById('inputWebhookUrlGuide3');
    const url = input ? input.value.trim() : '';

    if (!url) {
        localStorage.removeItem('ql_sheet3_webhook_url');
        showToast("Đã xóa cấu hình Webhook Trang 3.", "info");
        updateWebhookStatusUI3();
        return;
    }

    if (url.includes('docs.google.com/spreadsheets')) {
        showToast("Đây là link xem Google Sheet thông thường! Để tự động ghi dữ liệu, bạn cần dán URL Webhook (từ Google Apps Script hoặc n8n/Make/Zapier)!", "warning");
        return;
    }

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
        showToast("Link Webhook không hợp lệ! URL phải bắt đầu bằng https:// (ví dụ URL Web App Apps Script hoặc Webhook n8n).", "warning");
        return;
    }

    localStorage.setItem('ql_sheet3_webhook_url', url);
    updateWebhookStatusUI3();
    showToast("Đã kích hoạt Webhook Trang 3 thành công! Số liệu từ nay sẽ tự động cập nhật vào Google Sheet.", "success");
    closeAppsScriptGuideModal3();
};

/**
 * Khôi phục lại dữ liệu gốc của tháng
 */
function handleResetCurrentMonth() {
    if (!confirm(`Bạn có chắc muốn khôi phục lại dữ liệu ban đầu của Tháng ${modalEditMonth} / Năm ${modalEditYear}? Mọi thay đổi vừa nhập sẽ được hoàn tác.`)) {
        return;
    }

    const modKey = `${modalEditYear}_${modalEditMonth}`;
    try {
        const saved = localStorage.getItem('ql_sheet3_user_modifications');
        if (saved) {
            const userMods = JSON.parse(saved);
            delete userMods[modKey];
            localStorage.setItem('ql_sheet3_user_modifications', JSON.stringify(userMods));
        }
    } catch (e) {}

    // Lấy lại dữ liệu từ INITIAL_YEARLY_DATA
    if (INITIAL_YEARLY_DATA[modalEditYear]) {
        const originalMonth = INITIAL_YEARLY_DATA[modalEditYear].find(m => m.month === modalEditMonth);
        if (originalMonth && yearlyData[modalEditYear]) {
            const currentMonthObj = yearlyData[modalEditYear].find(m => m.month === modalEditMonth);
            if (currentMonthObj) {
                Object.assign(currentMonthObj, originalMonth);
            }
        }
    }

    try {
        localStorage.setItem('ql_sheet3_cached_data', JSON.stringify(yearlyData));
    } catch (e) {}

    loadMonthDataToModal(modalEditYear, modalEditMonth);
    renderAll();
    highlightTableRow(modalEditMonth);
    showToast(`Đã khôi phục dữ liệu gốc Tháng ${modalEditMonth} / Năm ${modalEditYear}!`, "info");
}

/**
 * Hiệu ứng highlight dòng bảng chi tiết sau khi cập nhật
 */
function highlightTableRow(month) {
    const row = document.getElementById(`reportTableRow_m${month}`);
    if (row) {
        row.classList.remove("row-updated-highlight");
        void row.offsetWidth; // trigger reflow
        row.classList.add("row-updated-highlight");
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Đóng modal khi bấm phím ESC hoặc click backdrop
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeUpdateDataModal();
        closeAppsScriptGuideModal3();
        closePostUpdateSyncModal3();
    }
});

['updateDataModal', 'appsScriptGuideModal3', 'postUpdateSyncModal3'].forEach(mId => {
    const m = document.getElementById(mId);
    if (m) {
        m.addEventListener('click', (e) => {
            if (e.target === m) {
                if (mId === 'updateDataModal') closeUpdateDataModal();
                if (mId === 'appsScriptGuideModal3') closeAppsScriptGuideModal3();
                if (mId === 'postUpdateSyncModal3') closePostUpdateSyncModal3();
            }
        });
    }
});

// Gắn hàm toàn cục để có thể gọi từ inline onclick HTML
window.openUpdateDataModal = openUpdateDataModal;
window.closeUpdateDataModal = closeUpdateDataModal;
window.handleStepperChange = handleStepperChange;
window.handleSaveUpdateData = handleSaveUpdateData;
window.handleResetCurrentMonth = handleResetCurrentMonth;
window.handleCopyMonthAndOpenSheet = handleCopyMonthAndOpenSheet;
window.openAppsScriptGuideModal3 = openAppsScriptGuideModal3;
window.closeAppsScriptGuideModal3 = closeAppsScriptGuideModal3;
window.openPostUpdateSyncModal3 = openPostUpdateSyncModal3;
window.closePostUpdateSyncModal3 = closePostUpdateSyncModal3;
window.handlePostUpdateCopyAndOpen3 = handlePostUpdateCopyAndOpen3;
window.handleCopyAppsScriptCode3 = handleCopyAppsScriptCode3;
window.handleSaveWebhookFromGuide3 = handleSaveWebhookFromGuide3;
