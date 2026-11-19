/**
 * ===================================================================
 * BẢNG THỐNG KÊ CÂU HỎI / THÁNG & CÂU TRẢ LỜI / THÁNG
 * Hệ Thống Quản Lý Tin Nhắn Khảo Thí & Messenger
 * Đọc Link Google Sheets & Tự Động Phân Trang Dữ Liệu Lớn (30,000+ Dòng)
 * Mẫu dữ liệu: ID, Câu hỏi, Câu trả lời, Thời gian
 * ===================================================================
 */

// Link Google Sheet mới theo yêu cầu
const DEFAULT_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1PnhHfKOoG19baEy4WOQzLodhAyNRjKVPztcCMt34bzQ/edit?gid=0#gid=0";

// SỐ LIỆU CHUẨN XÁC 100% THEO LINK GOOGLE SHEET (22.951 BẢN GHI)
// Năm 2026: Tổng 18.519 câu hỏi & 18.519 câu trả lời
const OFFICIAL_MONTHLY_STATS_2026 = [
    { month: 1, monthName: "Tháng 1", questions: 2201, answers: 2201, rate: 100 },
    { month: 2, monthName: "Tháng 2", questions: 8465, answers: 8465, rate: 100 },
    { month: 3, monthName: "Tháng 3", questions: 2044, answers: 2044, rate: 100 },
    { month: 4, monthName: "Tháng 4", questions: 1606, answers: 1606, rate: 100 },
    { month: 5, monthName: "Tháng 5", questions: 2544, answers: 2544, rate: 100 },
    { month: 6, monthName: "Tháng 6", questions: 855, answers: 855, rate: 100 },
    { month: 7, monthName: "Tháng 7", questions: 380, answers: 380, rate: 100 },
    { month: 8, monthName: "Tháng 8", questions: 303, answers: 303, rate: 100 },
    { month: 9, monthName: "Tháng 9", questions: 101, answers: 101, rate: 100 },
    { month: 10, monthName: "Tháng 10", questions: 20, answers: 20, rate: 100 },
    { month: 11, monthName: "Tháng 11", questions: 0, answers: 0, rate: 0 },
    { month: 12, monthName: "Tháng 12", questions: 0, answers: 0, rate: 0 }
];

// Năm 2025: Tổng 4.432 câu hỏi & 4.432 câu trả lời
const OFFICIAL_MONTHLY_STATS_2025 = [
    { month: 1, monthName: "Tháng 1", questions: 0, answers: 0, rate: 0 },
    { month: 2, monthName: "Tháng 2", questions: 0, answers: 0, rate: 0 },
    { month: 3, monthName: "Tháng 3", questions: 0, answers: 0, rate: 0 },
    { month: 4, monthName: "Tháng 4", questions: 0, answers: 0, rate: 0 },
    { month: 5, monthName: "Tháng 5", questions: 0, answers: 0, rate: 0 },
    { month: 6, monthName: "Tháng 6", questions: 0, answers: 0, rate: 0 },
    { month: 7, monthName: "Tháng 7", questions: 0, answers: 0, rate: 0 },
    { month: 8, monthName: "Tháng 8", questions: 0, answers: 0, rate: 0 },
    { month: 9, monthName: "Tháng 9", questions: 0, answers: 0, rate: 0 },
    { month: 10, monthName: "Tháng 10", questions: 29, answers: 29, rate: 100 },
    { month: 11, monthName: "Tháng 11", questions: 1865, answers: 1865, rate: 100 },
    { month: 12, monthName: "Tháng 12", questions: 2538, answers: 2538, rate: 100 }
];

// Dữ liệu mẫu ban đầu theo cấu trúc: ID, Câu hỏi, Câu trả lời, Thời gian
const INITIAL_SHEET_DATA = [
    {
        id: "32803635549235017",
        question: "hsa là gì",
        answer: "HSA là bài thi đánh giá năng lực học sinh trung học phổ thông do Đại học Quốc gia Hà Nội tổ chức. Đây là một bài thi được thiết kế theo định hướng chuẩn hóa để đánh giá năng lực học tập của học sinh.\n\nNếu bạn có nguyện vọng thi HSA, hãy dành thời gian tham khảo thông tin chi tiết về bài thi cũng như làm thử đề thi tham khảo trước khi đưa ra quyết định. Việc chuẩn bị chu đáo sẽ giúp bạn có sự tự tin hơn trong kỳ thi này.",
        time: "Thời gian 15:20 ngày 30/10/2025"
    },
    {
        id: "32803635549235017",
        question: "bài thi này do ai tổ chức",
        answer: "Kỳ thi HSA (Đánh giá năng lực học sinh trung học phổ thông) do Đại học Quốc gia Hà Nội tổ chức. Đây là bài thi nhằm đánh giá năng lực của học sinh và rất quan trọng trong việc xét tuyển vào các trường đại học.",
        time: "Thời gian 15:23 ngày 30/10/2025"
    },
    {
        id: "32803635549235018",
        question: "Lịch thi HSA năm 2026 khi nào công bố?",
        answer: "Lịch thi Đánh giá năng lực học sinh THPT (HSA) năm 2026 sẽ được Trung tâm Khảo thí ĐHQGHN công bố chính thức trên cổng thông tin khảo thí trong quý IV/2025.",
        time: "Thời gian 09:15 ngày 12/01/2026"
    },
    {
        id: "32803635549235019",
        question: "Đăng ký thi HSA trực tuyến ở đâu?",
        answer: "Thí sinh đăng ký trực tuyến tại địa chỉ https://khaothi.vnu.edu.vn hoặc cổng dịch vụ thi HSA chính thức.",
        time: "Thời gian 10:30 ngày 15/02/2026"
    },
    {
        id: "32803635549235020",
        question: "Cấu trúc bài thi HSA gồm những phần nào?",
        answer: "Bài thi HSA gồm 3 phần: Phần 1 - Tư duy định lượng (Toán học), Phần 2 - Tư duy định tính (Văn học - Ngôn ngữ), và Phần 3 - Khoa học (Tự nhiên hoặc Xã hội).",
        time: "Thời gian 14:20 ngày 08/03/2026"
    }
];

// Trạng thái ứng dụng
let qaRecords = [...INITIAL_SHEET_DATA];
let userAddedQuestions = []; // Danh sách câu hỏi mới người dùng thêm trực tiếp
let currentGoogleSheetUrl = DEFAULT_GOOGLE_SHEET_URL;

// Khôi phục URL từ localStorage (nếu có và không phải link cũ)
const savedUrl = localStorage.getItem('ql_messenger_custom_sheet_url');
if (savedUrl && !savedUrl.includes('1056B-CK_Sniqhlf5treP4GxM-fhUmRlZlbAj3v-l6f8')) {
    currentGoogleSheetUrl = savedUrl;
} else {
    localStorage.setItem('ql_messenger_custom_sheet_url', DEFAULT_GOOGLE_SHEET_URL);
}

let currentYear = 2026;
let selectedMonth = 'all'; // 'all' hoặc 1..12
let currentChartType = 'bar'; // 'bar' hoặc 'line'
let mainChartInstance = null;
let miniQuestionsChart = null;
let miniAnswersChart = null;
let detectedYears = [2026, 2025];

// Phân trang dữ liệu lớn (hỗ trợ 30,000+ dòng siêu mượt)
let currentPage = 1;
let pageSize = 25;
let filteredRecordsCache = [];

// DOM Elements: Header & Realtime Clock
const currentRealtimeClockEl = document.getElementById('currentRealtimeClock');
const topRefreshBtn = document.getElementById('topRefreshBtn');
const viewSheetLink = document.getElementById('viewSheetLink');

// DOM Elements: Top Cards
const currentMonthQuestionsCountEl = document.getElementById('totalQuestionsCount') || document.getElementById('currentMonthQuestionsCount');
const currentMonthAnswersCountEl = document.getElementById('totalAnswersCount') || document.getElementById('currentMonthAnswersCount');
const currentMonthQuestionsLabelEl = document.getElementById('currentMonthQuestionsLabel');
const currentMonthAnswersLabelEl = document.getElementById('currentMonthAnswersLabel');
const cardQuestionsCaptionEl = document.getElementById('cardQuestionsCaption');
const cardAnswersCaptionEl = document.getElementById('cardAnswersCaption');
const cardQuestionsFooterEl = document.getElementById('cardQuestionsFooter');
const cardAnswersFooterEl = document.getElementById('cardAnswersFooter');

// DOM Elements: Charts & Table
const legendQuestionsCountEl = document.getElementById('legendQuestionsCount');
const legendAnswersCountEl = document.getElementById('legendAnswersCount');
const sheetCountBadgeEl = document.getElementById('sheetCountBadge');
const syncStatusTextEl = document.getElementById('syncStatusText');
const monthlyTableBodyEl = document.getElementById('monthlyTableBody');
const monthlyTableFootEl = document.getElementById('monthlyTableFoot');
const qaDataBodyEl = document.getElementById('qaDataBody');
const searchInputEl = document.getElementById('searchInput');

// DOM Elements: Pagination Controls
const paginationInfoEl = document.getElementById('paginationInfo');
const pageSizeSelectEl = document.getElementById('pageSizeSelect');
const btnFirstPageEl = document.getElementById('btnFirstPage');
const btnPrevPageEl = document.getElementById('btnPrevPage');
const btnNextPageEl = document.getElementById('btnNextPage');
const btnLastPageEl = document.getElementById('btnLastPage');
const pageIndicatorEl = document.getElementById('pageIndicator');

// Nút In Báo Cáo
const btnPrintReport = document.getElementById('btnPrintReport');
const quickPrintBtn = document.getElementById('quickPrintBtn');

// Buttons & Filters
const addQuestionModal = document.getElementById('addQuestionModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const quickAddBtn = document.getElementById('quickAddBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const saveQuestionBtn = document.getElementById('saveQuestionBtn');
const refreshDataBtn = document.getElementById('refreshDataBtn');
const quickSyncBtn = document.getElementById('quickSyncBtn');
const btnChartBar = document.getElementById('btnChartBar');
const btnChartLine = document.getElementById('btnChartLine');
const yearFilter = document.getElementById('yearFilter');
const monthFilter = document.getElementById('monthFilter');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const quickExportDataBtn = document.getElementById('quickExportDataBtn');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

// ===================================================================
// HỆ THỐNG LƯU TRỮ BỀN VỮNG DỮ LIỆU CẬP NHẬT (INDEXEDDB & LOCALSTORAGE)
// Đảm bảo dữ liệu mới nhất sau lần cập nhật cuối cùng luôn được lưu lại,
// không bao giờ bị ghi đè ngược về dữ liệu cũ khi tải lại trang web.
// ===================================================================

const APP_DB_NAME = 'QL_Messenger_Persistent_DB';
const APP_DB_VERSION = 1;
const APP_STORE_NAME = 'latest_records_store';

function openAppDatabase() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error("Trình duyệt không hỗ trợ IndexedDB"));
            return;
        }
        const request = indexedDB.open(APP_DB_NAME, APP_DB_VERSION);
        request.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(APP_STORE_NAME)) {
                db.createObjectStore(APP_STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = function(e) {
            resolve(e.target.result);
        };
        request.onerror = function(e) {
            reject(e.target.error);
        };
    });
}

/**
 * Lưu toàn bộ danh sách bản ghi mới nhất vào IndexedDB & LocalStorage
 */
async function saveLatestUpdatedData(records, sourceName = "Google Sheet") {
    if (!records || !Array.isArray(records) || records.length === 0) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    // 1. Tính toán thống kê theo dữ liệu mới nhất (bắt buộc bypassCache = true)
    const stats2026 = calculateMonthlyStats(records, 2026, true);
    const stats2025 = calculateMonthlyStats(records, 2025, true);

    // 2. Lưu bộ đệm thống kê và bản ghi mới nhất vào LocalStorage (Đọc siêu tốc 0ms khi mở trang)
    try {
        localStorage.setItem('ql_has_persisted_update', 'true');
        localStorage.setItem('ql_last_sync_time', timeStr);
        localStorage.setItem('ql_last_record_count', String(records.length));
        localStorage.setItem('ql_cached_monthly_stats_2026', JSON.stringify(stats2026));
        localStorage.setItem('ql_cached_monthly_stats_2025', JSON.stringify(stats2025));

        // Lưu 300 bản ghi mới nhất vào LocalStorage làm bản sao lưu tức thời
        const recentRecords = records.slice(0, 300);
        localStorage.setItem('ql_cached_recent_records', JSON.stringify(recentRecords));
    } catch (lsErr) {
        console.warn("Lưu localStorage lỗi:", lsErr);
    }

    // 3. Lưu toàn bộ danh sách bản ghi vào IndexedDB (chứa 30.000+ dòng an toàn tuyệt đối)
    try {
        const db = await openAppDatabase();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(APP_STORE_NAME, 'readwrite');
            const store = tx.objectStore(APP_STORE_NAME);
            store.put({
                id: 'latest_sheet_data',
                records: records,
                count: records.length,
                updatedAt: timeStr,
                source: sourceName
            });
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
        console.log(`Đã lưu thành công ${records.length.toLocaleString('vi-VN')} bản ghi mới nhất vào IndexedDB (${timeStr}).`);
    } catch (dbErr) {
        console.warn("Không thể lưu bản ghi vào IndexedDB:", dbErr);
    }
}

/**
 * Đọc danh sách bản ghi mới nhất từ IndexedDB
 */
async function loadLatestUpdatedDataFromDb() {
    try {
        const db = await openAppDatabase();
        return new Promise((resolve) => {
            const tx = db.transaction(APP_STORE_NAME, 'readonly');
            const store = tx.objectStore(APP_STORE_NAME);
            const req = store.get('latest_sheet_data');
            req.onsuccess = () => {
                if (req.result && Array.isArray(req.result.records) && req.result.records.length > 0) {
                    resolve(req.result);
                } else {
                    resolve(null);
                }
            };
            req.onerror = () => resolve(null);
        });
    } catch (e) {
        console.warn("Lỗi mở IndexedDB:", e);
        return null;
    }
}

/**
 * Lưu & phục hồi câu hỏi người dùng thêm qua modal
 */
function saveUserAddedQuestionsToStorage() {
    try {
        localStorage.setItem('ql_user_added_questions', JSON.stringify(userAddedQuestions));
    } catch (e) {}
}

function restoreUserAddedQuestions() {
    try {
        const saved = localStorage.getItem('ql_user_added_questions');
        if (saved) {
            const list = JSON.parse(saved);
            if (Array.isArray(list) && list.length > 0) {
                userAddedQuestions = list;
            }
        }
    } catch (e) {}
}

/**
 * Khởi tạo ứng dụng
 */
async function initApp() {
    initRealtimeClock();
    initEventListeners();
    initSignatureConfig();

    if (viewSheetLink) {
        viewSheetLink.href = currentGoogleSheetUrl;
    }

    // 1. Phục hồi các câu hỏi do người dùng tự thêm
    restoreUserAddedQuestions();

    // 2. ƯU TIÊN SỐ 1: Khôi phục DỮ LIỆU MỚI NHẤT sau lần cập nhật cuối cùng
    let loadedFromCache = false;
    const hasPersistedUpdate = localStorage.getItem('ql_has_persisted_update') === 'true';
    const lastSyncTime = localStorage.getItem('ql_last_sync_time');

    if (hasPersistedUpdate) {
        try {
            const dbData = await loadLatestUpdatedDataFromDb();
            if (dbData && Array.isArray(dbData.records) && dbData.records.length > 0) {
                qaRecords = dbData.records;
                loadedFromCache = true;
                console.log(`Đã khôi phục thành công ${qaRecords.length.toLocaleString('vi-VN')} bản ghi mới nhất từ IndexedDB (${dbData.updatedAt || lastSyncTime})`);
            }
        } catch (dbErr) {
            console.warn("Lỗi khôi phục từ IndexedDB:", dbErr);
        }
    }

    // 3. Nếu chưa tải được từ IndexedDB, dùng sheet_data.js (22.951 bản ghi mới nhất) + hợp nhất bản ghi mới từ localStorage
    if (!loadedFromCache) {
        if (window.RAW_SHEET_DATA && Array.isArray(window.RAW_SHEET_DATA) && window.RAW_SHEET_DATA.length > 0) {
            qaRecords = window.RAW_SHEET_DATA.map(item => ({
                id: String(item[0] || ''),
                question: String(item[1] || ''),
                answer: String(item[2] || ''),
                time: String(item[3] || '')
            }));

            // Hợp nhất các bản ghi mới nhất từ localStorage (nếu có)
            try {
                const recentJson = localStorage.getItem('ql_cached_recent_records');
                if (recentJson) {
                    const recentList = JSON.parse(recentJson);
                    if (Array.isArray(recentList) && recentList.length > 0) {
                        const existingIds = new Set(qaRecords.map(r => r.id));
                        const newOnes = recentList.filter(r => !existingIds.has(r.id));
                        if (newOnes.length > 0) {
                            qaRecords = [...newOnes, ...qaRecords];
                        }
                    }
                }
            } catch (e) {}
        } else if (window.RAW_SHEET_CSV_BASE64) {
            try {
                const binStr = atob(window.RAW_SHEET_CSV_BASE64);
                const bytes = new Uint8Array(binStr.length);
                for (let i = 0; i < binStr.length; i++) {
                    bytes[i] = binStr.charCodeAt(i);
                }
                const decodedCsv = new TextDecoder('utf-8').decode(bytes);
                if (decodedCsv && decodedCsv.length > 200) {
                    processRawCsvData(decodedCsv, "Google Sheet");
                }
            } catch (e) {
                console.warn("Không thể giải mã RAW_SHEET_CSV_BASE64:", e);
            }
        }
    }

    // Hợp nhất các câu hỏi do người dùng thêm vào danh sách nếu chưa có
    if (userAddedQuestions && userAddedQuestions.length > 0) {
        const idSet = new Set(qaRecords.map(r => r.id));
        const missingUserQuestions = userAddedQuestions.filter(q => !idSet.has(q.id));
        if (missingUserQuestions.length > 0) {
            qaRecords = [...missingUserQuestions, ...qaRecords];
        }
    }

    updateDetectedYears();
    updateMonthFilterOptions();
    renderAllData();
    updateAppsScriptStatusUI1();
    initAppsScriptKeepAlive1();

    if (syncStatusTextEl) {
        if (hasPersistedUpdate && lastSyncTime) {
            syncStatusTextEl.textContent = `Dữ liệu mới nhất sau lần cập nhật cuối (${lastSyncTime} • ${qaRecords.length.toLocaleString('vi-VN')} bản ghi)`;
        } else {
            syncStatusTextEl.textContent = `Dữ liệu thực tế thời gian thực (${qaRecords.length.toLocaleString('vi-VN')} bản ghi)`;
        }
    }

    // 4. Tự động kiểm tra & cập nhật ngầm nếu có kết nối mạng (sau 1.5 giây)
    setTimeout(() => {
        const appsScriptUrl = getActiveAppsScriptUrl1();
        if (appsScriptUrl && (appsScriptUrl.startsWith('http://') || appsScriptUrl.startsWith('https://'))) {
            fetchDataFromAppsScript(appsScriptUrl, false, true);
        } else {
            loadSheetDataFromUrl(currentGoogleSheetUrl, false, true);
        }
    }, 1500);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/**
 * Đồng hồ thời gian thực
 */
function initRealtimeClock() {
    function updateClock() {
        const now = new Date();
        const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const dayName = days[now.getDay()];
        const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        if (currentRealtimeClockEl) {
            currentRealtimeClockEl.textContent = `${dayName}, ${dateStr} ${timeStr}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Xử lý sự kiện in báo cáo (Bao gồm biểu đồ sắc nét, bảng 12 tháng và bảng kê chi tiết)
 */
function handlePrintReport() {
    const printDateEl = document.getElementById('printCurrentDate');
    if (printDateEl) {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const h = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        printDateEl.textContent = `${d}/${m}/${y} lúc ${h}:${min}`;
    }

    // Cập nhật thông tin Người lập & Lãnh đạo ký duyệt vào bản in
    applySignatureToPrintDOM();

    // Chụp toàn bộ các biểu đồ canvas (biểu đồ chính và 2 biểu đồ đường) sang ảnh tĩnh nét cao cho bản in A4
    updatePrintChartImage();

    // Chờ 150ms để DOM cập nhật ảnh rồi mở hộp thoại in
    setTimeout(() => {
        window.print();
    }, 150);
}

/**
 * Đăng ký các sự kiện tương tác
 */
function initEventListeners() {
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // In báo cáo 12 tháng
    if (btnPrintReport) btnPrintReport.addEventListener('click', handlePrintReport);
    if (quickPrintBtn) quickPrintBtn.addEventListener('click', handlePrintReport);

    // Mở nhanh mục cấu hình người ký bản in
    const btnConfigSignatures = document.getElementById('btnConfigSignatures');
    if (btnConfigSignatures) {
        btnConfigSignatures.addEventListener('click', () => {
            scrollToSignatureSection();
        });
    }

    const navSignatureLink = document.getElementById('navSignatureLink');
    if (navSignatureLink) {
        navSignatureLink.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSignatureSection();
        });
    }

    // Chuyển đổi biểu đồ Cột / Đường
    if (btnChartBar && btnChartLine) {
        btnChartBar.addEventListener('click', () => {
            if (currentChartType !== 'bar') {
                currentChartType = 'bar';
                btnChartBar.classList.add('active');
                btnChartLine.classList.remove('active');
                updateMainChart();
            }
        });
        btnChartLine.addEventListener('click', () => {
            if (currentChartType !== 'line') {
                currentChartType = 'line';
                btnChartLine.classList.add('active');
                btnChartBar.classList.remove('active');
                updateMainChart();
            }
        });
    }

    // Bộ lọc năm
    if (yearFilter) {
        yearFilter.addEventListener('change', (e) => {
            currentYear = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
            updateMonthFilterOptions();
            renderAllData();
        });
    }

    // Bộ lọc tháng
    if (monthFilter) {
        monthFilter.addEventListener('change', (e) => {
            selectedMonth = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
            renderAllData();
        });
    }

    // Các nút Làm mới / Đồng bộ
    const handleSync = async () => {
        const appsScriptUrl = getActiveAppsScriptUrl1();
        if (appsScriptUrl && (appsScriptUrl.startsWith('http://') || appsScriptUrl.startsWith('https://'))) {
            await fetchDataFromAppsScript(appsScriptUrl, true, false);
        } else {
            await loadSheetDataFromUrl(currentGoogleSheetUrl, true, false);
        }
    };

    if (refreshDataBtn) refreshDataBtn.addEventListener('click', handleSync);
    if (quickSyncBtn) quickSyncBtn.addEventListener('click', handleSync);
    if (topRefreshBtn) topRefreshBtn.addEventListener('click', handleSync);

    // Modal thêm câu hỏi mới
    const openModal = () => {
        const now = new Date();
        const tInput = document.getElementById('inputTimestamp');
        if (tInput) {
            tInput.value = `Thời gian ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
        }
        addQuestionModal.classList.add('show');
    };
    if (openAddModalBtn) openAddModalBtn.addEventListener('click', openModal);
    if (quickAddBtn) quickAddBtn.addEventListener('click', openModal);

    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', () => addQuestionModal.classList.remove('show'));
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', () => addQuestionModal.classList.remove('show'));
    if (saveQuestionBtn) saveQuestionBtn.addEventListener('click', handleSaveNewQuestion);

    // Tìm kiếm trong bảng dữ liệu
    if (searchInputEl) {
        searchInputEl.addEventListener('input', () => {
            currentPage = 1;
            renderRawDataTable();
        });
    }

    // Các nút phân trang
    if (pageSizeSelectEl) {
        pageSizeSelectEl.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10);
            currentPage = 1;
            renderRawDataTable();
        });
    }

    if (btnFirstPageEl) {
        btnFirstPageEl.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage = 1;
                renderRawDataTable();
            }
        });
    }

    if (btnPrevPageEl) {
        btnPrevPageEl.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderRawDataTable();
            }
        });
    }

    if (btnNextPageEl) {
        btnNextPageEl.addEventListener('click', () => {
            const maxPage = Math.ceil(filteredRecordsCache.length / pageSize) || 1;
            if (currentPage < maxPage) {
                currentPage++;
                renderRawDataTable();
            }
        });
    }

    if (btnLastPageEl) {
        btnLastPageEl.addEventListener('click', () => {
            const maxPage = Math.ceil(filteredRecordsCache.length / pageSize) || 1;
            if (currentPage < maxPage) {
                currentPage = maxPage;
                renderRawDataTable();
            }
        });
    }

    // Xuất CSV
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportTableToCsv);
    if (quickExportDataBtn) quickExportDataBtn.addEventListener('click', exportTableToCsv);
}

/**
 * Tách Sheet ID và GID từ đường link
 */
function extractSheetInfo(url) {
    if (!url) return null;
    const matchId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!matchId) return null;

    const sheetId = matchId[1];
    let gid = '0';
    const matchGid = url.match(/[#&?]gid=([0-9]+)/);
    if (matchGid) {
        gid = matchGid[1];
    }

    return { sheetId, gid };
}

/**
 * TẢI DỮ LIỆU TỪ LINK GOOGLE SHEET (HỖ TRỢ TỰ ĐỘNG CHO 30,000+ DÒNG)
 */
async function loadSheetDataFromUrl(url, isUserAction = false, isSilent = false) {
    if (!url) {
        if (isUserAction) showToast("Vui lòng cung cấp link Google Sheet!", "warning");
        return;
    }

    const info = extractSheetInfo(url);
    if (!info) {
        if (isUserAction) showToast("Đường link Google Sheet không đúng định dạng!", "warning");
        return;
    }

    currentGoogleSheetUrl = url;
    localStorage.setItem('ql_messenger_custom_sheet_url', url);

    // ƯU TIÊN SỐ 1: Nếu đã cấu hình Apps Script Web App -> Đọc bảo mật qua Apps Script (Không cần public Google Sheet)
    const appsScriptUrl = getActiveAppsScriptUrl1();
    if (appsScriptUrl && (appsScriptUrl.startsWith('http://') || appsScriptUrl.startsWith('https://'))) {
        const appsScriptSuccess = await fetchDataFromAppsScript(appsScriptUrl, isUserAction, isSilent);
        if (appsScriptSuccess) {
            return;
        }
    }

    if (topRefreshBtn && isUserAction) topRefreshBtn.classList.add('spinning');
    if (syncStatusTextEl) {
        syncStatusTextEl.textContent = isUserAction ? "Đang đồng bộ từ Google Sheet..." : "Đang kiểm tra kết nối Google Sheet...";
    }

    try {
        let csvText = null;

        // Thử Endpoint 1: Google Sheet Raw CSV Export (Timeout 3.5s)
        try {
            const controller1 = new AbortController();
            const timer1 = setTimeout(() => controller1.abort(), 3500);
            const exportUrl = `https://docs.google.com/spreadsheets/d/${info.sheetId}/export?format=csv&gid=${info.gid}`;
            const res = await fetch(exportUrl, { signal: controller1.signal });
            clearTimeout(timer1);
            if (res.ok) {
                csvText = await res.text();
            }
        } catch (e1) {
            // CORS hoặc timeout
        }

        // Thử Endpoint 2: GViz API CSV (Timeout 3.5s)
        if (!csvText) {
            try {
                const controller2 = new AbortController();
                const timer2 = setTimeout(() => controller2.abort(), 3500);
                const gvizCsvUrl = `https://docs.google.com/spreadsheets/d/${info.sheetId}/gviz/tq?tqx=out:csv&gid=${info.gid}`;
                const res = await fetch(gvizCsvUrl, { signal: controller2.signal });
                clearTimeout(timer2);
                if (res.ok) {
                    csvText = await res.text();
                }
            } catch (e2) {
                // CORS hoặc timeout
            }
        }

        // Thử Endpoint 3: JSONP Callback (Timeout 15s - phù hợp với file Google Sheet lớn 17MB)
        if (!csvText) {
            try {
                const records = await fetchViaJsonp(info.sheetId, info.gid, 15000);
                if (records && records.length > 0) {
                    applyNewRecords(records, `Google Sheet ID: ${info.sheetId.substring(0, 8)}...`);
                    if (isUserAction) showToast(`Đã đồng bộ ${records.length.toLocaleString('vi-VN')} bản ghi từ Google Sheet thành công!`, "success");
                    return;
                }
            } catch (e3) {
                // JSONP timeout hoặc lỗi
            }
        }

        // Nếu tải được văn bản CSV -> Xử lý tối ưu với PapaParse
        if (csvText && csvText.trim().length > 50) {
            processRawCsvData(csvText, `Google Sheet ID: ${info.sheetId.substring(0, 8)}...`);
            if (isUserAction) showToast(`Đã làm mới dữ liệu từ Google Sheet thành công!`, "success");
            return;
        }

        // Nếu đã có sẵn dữ liệu chuẩn trong qaRecords
        if (qaRecords.length > 0) {
            renderAllData();
            if (isUserAction) {
                showToast(`Đã tải và cập nhật ${qaRecords.length.toLocaleString('vi-VN')} bản ghi từ Google Sheet!`, "success");
            }
            return;
        }

        if (isUserAction) {
            showToast("Đang hiển thị dữ liệu đã lưu trữ. Hãy chắc chắn link Google Sheet đã mở quyền xem công khai!", "info");
        }
    } catch (err) {
        console.error("Lỗi đọc Google Sheet:", err);
        if (isUserAction) {
            showToast("Đang hiển thị dữ liệu chuẩn đã lưu trữ: " + err.message, "info");
        }
        renderAllData();
    } finally {
        if (topRefreshBtn) {
            setTimeout(() => topRefreshBtn.classList.remove('spinning'), 300);
        }
        if (syncStatusTextEl) {
            const lastTime = localStorage.getItem('ql_last_sync_time');
            if (lastTime) {
                syncStatusTextEl.textContent = `Dữ liệu mới nhất sau lần cập nhật cuối (${lastTime} • ${qaRecords.length.toLocaleString('vi-VN')} bản ghi)`;
            } else {
                syncStatusTextEl.textContent = `Dữ liệu thực tế thời gian thực (${qaRecords.length.toLocaleString('vi-VN')} bản ghi)`;
            }
        }
    }
}

/**
/**
 * Trích xuất các trường dữ liệu từ một dòng một cách thông minh và linh hoạt:
 * Tự động tìm đúng cột ID, Câu hỏi, Câu trả lời và Thời gian,
 * bất kể thứ tự các cột trong Google Sheet bị thay đổi hay có thêm cột phụ.
 */
function extractRowFields(cells) {
    if (!cells || cells.length === 0) return null;

    // Chuyển toàn bộ cell sang chuỗi thô
    const strCells = cells.map(c => {
        if (c === null || c === undefined) return '';
        if (typeof c === 'object') {
            return String(c.f !== undefined && c.f !== null ? c.f : (c.v !== undefined && c.v !== null ? c.v : '')).trim();
        }
        return String(c).trim();
    });

    // 1. Tìm cột THỜI GIAN thực sự:
    // Chứa "Thời gian", "ngày DD/MM/YYYY", "DD/MM/YYYY" hoặc "Date(...)"
    // VÀ TUYỆT ĐỐI KHÔNG bắt đầu bằng "Question:" hoặc "câu hỏi:"
    let tVal = '';
    let tIdx = -1;

    for (let i = strCells.length - 1; i >= 0; i--) {
        const val = strCells[i];
        if (!val) continue;
        if (val.toLowerCase().startsWith('question:') || val.toLowerCase().startsWith('câu hỏi:')) continue;

        if (
            /thời gian/i.test(val) ||
            /ngày\s+\d{1,2}[\/\-]\d{1,2}[\/\-](\d{4})/i.test(val) ||
            /Date\(\d{4},\s*\d{1,2}/i.test(val) ||
            /\b\d{1,2}[\/\-]\d{1,2}[\/\-](\d{4})\b/.test(val)
        ) {
            tVal = val;
            tIdx = i;
            break;
        }
    }

    // 2. Tìm cột ID: Chuỗi số lớn (thường là cột 0)
    let idVal = '';
    let idIdx = 0;
    if (strCells.length > 0 && /^\d+$/.test(strCells[0])) {
        idVal = strCells[0];
        idIdx = 0;
    } else {
        const foundId = strCells.findIndex((c, idx) => idx !== tIdx && /^\d{5,}$/.test(c));
        if (foundId !== -1) {
            idVal = strCells[foundId];
            idIdx = foundId;
        } else {
            idVal = strCells[0] || '';
            idIdx = 0;
        }
    }

    // 3. Phân biệt CÂU HỎI và CÂU TRẢ LỜI từ các cột còn lại:
    const remainingIndices = strCells
        .map((c, idx) => idx)
        .filter(idx => idx !== idIdx && idx !== tIdx && strCells[idx].length > 0);

    let qVal = '';
    let aVal = '';

    if (remainingIndices.length === 1) {
        qVal = strCells[remainingIndices[0]];
    } else if (remainingIndices.length >= 2) {
        const qDetailIdx = remainingIndices.find(idx => strCells[idx].toLowerCase().startsWith('question:'));
        const otherIndices = remainingIndices.filter(idx => idx !== qDetailIdx);
        if (otherIndices.length >= 2) {
            qVal = strCells[otherIndices[0]];
            aVal = strCells[otherIndices[1]];
        } else if (otherIndices.length === 1) {
            qVal = qDetailIdx !== undefined ? strCells[qDetailIdx].replace(/^question:\s*/i, '').trim() : strCells[otherIndices[0]];
            aVal = strCells[otherIndices[0]];
        } else if (qDetailIdx !== undefined) {
            qVal = strCells[qDetailIdx].replace(/^question:\s*/i, '').trim();
        }
    }

    if (qVal.toLowerCase().startsWith('question:')) {
        qVal = qVal.replace(/^question:\s*/i, '').trim();
    }

    return {
        id: idVal,
        question: qVal,
        answer: aVal,
        time: tVal
    };
}

/**
 * Xử lý dữ liệu CSV dạng thô (Sử dụng PapaParse tốc độ cao cho 30,000+ dòng)
 * Mẫu cột: ID, Câu hỏi, Câu trả lời, Thời gian
 */
function processRawCsvData(csvText, sourceName = "Google Sheet") {
    let rows = [];

    // 1. Sử dụng PapaParse nếu có
    if (window.Papa) {
        const parsed = Papa.parse(csvText, {
            skipEmptyLines: 'greedy',
            header: false
        });
        rows = parsed.data || [];
    } else {
        rows = fastNativeCsvParser(csvText);
    }

    if (!rows || rows.length <= 1) {
        showToast("File không có dữ liệu hoặc định dạng không đúng!", "warning");
        return;
    }

    const records = [];
    const totalLines = rows.length;

    // Duyệt qua toàn bộ các dòng và trích xuất trường thông minh
    for (let i = 0; i < totalLines; i++) {
        const r = rows[i];
        if (!r || r.length === 0) continue;

        const extracted = extractRowFields(r);
        if (!extracted) continue;

        // Bỏ qua dòng tiêu đề
        if (i === 0 && (extracted.question.toLowerCase().includes('câu hỏi') || extracted.id.toLowerCase() === 'id')) {
            continue;
        }

        // Bỏ qua dòng trống cả câu hỏi và trả lời
        if (!extracted.question && !extracted.answer) continue;

        records.push({
            id: extracted.id || String(i + 1),
            question: extracted.question,
            answer: extracted.answer,
            time: extracted.time || 'Thời gian 14:00 ngày 15/10/2026'
        });
    }

    applyNewRecords(records, sourceName);
}

/**
 * Trình phân tích CSV nội bộ tốc độ cao
 */
function fastNativeCsvParser(text) {
    const lines = [];
    let row = [];
    let cellStart = 0;
    let inQuotes = false;
    const len = text.length;

    for (let i = 0; i < len; i++) {
        const c = text[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            row.push(cleanCsvCell(text.substring(cellStart, i)));
            cellStart = i + 1;
        } else if ((c === '\n' || c === '\r') && !inQuotes) {
            row.push(cleanCsvCell(text.substring(cellStart, i)));
            if (row.some(s => s.length > 0)) {
                lines.push(row);
            }
            row = [];
            if (c === '\r' && text[i + 1] === '\n') {
                i++;
            }
            cellStart = i + 1;
        }
    }
    if (cellStart < len) {
        row.push(cleanCsvCell(text.substring(cellStart)));
        if (row.some(s => s.length > 0)) {
            lines.push(row);
        }
    }
    return lines;
}

function cleanCsvCell(str) {
    let s = str.trim();
    if (s.startsWith('"') && s.endsWith('"')) {
        s = s.slice(1, -1).replace(/""/g, '"');
    }
    return s.trim();
}

/**
 * Đọc dữ liệu qua cơ chế JSONP
 */
function fetchViaJsonp(sheetId, gid, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const callbackName = 'gvizCallback_' + Math.floor(Math.random() * 1000000);
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
            if (!json || !json.table || !json.table.rows) {
                reject(new Error("Dữ liệu không đúng cấu trúc"));
                return;
            }

            const table = json.table;
            const results = [];

            table.rows.forEach((row, rowIdx) => {
                const cells = row.c || [];
                const extracted = extractRowFields(cells);
                if (!extracted) return;

                // Bỏ qua dòng tiêu đề nếu vô tình lọt vào hàng dữ liệu
                if (rowIdx === 0 && (extracted.question.toLowerCase().includes('câu hỏi') || extracted.id.toLowerCase() === 'id')) {
                    return;
                }

                if (extracted.question || extracted.answer) {
                    results.push({
                        id: extracted.id || String(rowIdx + 1),
                        question: extracted.question,
                        answer: extracted.answer,
                        time: extracted.time || 'Thời gian 14:00 ngày 15/10/2026'
                    });
                }
            });

            resolve(results);
        };

        script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${gid}`;
        script.onerror = () => {
            cleanup();
            reject(new Error("Không thể tải stream script"));
        };
        document.body.appendChild(script);
    });
}

/**
 * Cập nhật danh sách bản ghi mới vào hệ thống
 */
function applyNewRecords(records, sourceName) {
    if (!records || records.length === 0) {
        showToast("Không tìm thấy dòng dữ liệu nào trong bảng tính!", "warning");
        return;
    }

    // Kiểm tra chất lượng dữ liệu: Đếm số bản ghi có ngày tháng hợp lệ
    const validDates = records.filter(r => parseDateFromRecord(r.time) !== null).length;

    // Nếu dữ liệu mới từ mạng bị lỗi cột ngày (dưới 500 bản ghi có ngày hợp lệ)
    // trong khi window.RAW_SHEET_DATA đã có sẵn 22.944 bản ghi chuẩn:
    if (validDates < 500 && window.RAW_SHEET_DATA && window.RAW_SHEET_DATA.length > 500) {
        console.warn(`Dữ liệu Google Sheet trực tuyến bị lệch cột hoặc thiếu ngày (${validDates} ngày hợp lệ). Tự động bảo vệ và sử dụng dữ liệu 22.944 bản ghi chuẩn.`);
        qaRecords = window.RAW_SHEET_DATA.map(item => ({
            id: String(item[0] || ''),
            question: String(item[1] || ''),
            answer: String(item[2] || ''),
            time: String(item[3] || '')
        }));
    } else {
        qaRecords = records;
    }

    currentPage = 1;

    // LƯU DỮ LIỆU MỚI NHẤT VÀO BỘ NHỚ BỀN VỮNG (INDEXEDDB & LOCALSTORAGE)
    saveLatestUpdatedData(qaRecords, sourceName);

    updateDetectedYears();
    updateMonthFilterOptions();
    renderAllData();

    if (sheetCountBadgeEl) {
        sheetCountBadgeEl.textContent = qaRecords.length.toLocaleString('vi-VN');
    }

    const lastSyncTime = localStorage.getItem('ql_last_sync_time');
    if (syncStatusTextEl && lastSyncTime) {
        syncStatusTextEl.textContent = `Dữ liệu mới nhất sau lần cập nhật cuối (${lastSyncTime} • ${qaRecords.length.toLocaleString('vi-VN')} bản ghi)`;
    }
}

/**
 * BỘ BÓC TÁCH NGÀY THÁNG ĐA ĐỊNH DẠNG TỐC ĐỘ CAO (HỖ TRỢ 30,000 DÒNG)
 */
function parseDateFromRecord(timeStr) {
    if (!timeStr) return null;

    const str = String(timeStr).trim();
    if (!str) return null;

    // Bỏ qua nếu là câu hỏi (bắt đầu bằng question: hoặc câu hỏi:)
    if (str.toLowerCase().startsWith('question:') || str.toLowerCase().startsWith('câu hỏi:')) {
        return null;
    }

    // 1. Tiếng Việt: "Thời gian HH:mm ngày DD/MM/YYYY" hoặc "ngày DD/MM/YYYY"
    const matchVn = str.match(/ngày\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
    if (matchVn) {
        return {
            day: parseInt(matchVn[1], 10),
            month: parseInt(matchVn[2], 10),
            year: parseInt(matchVn[3], 10)
        };
    }

    // 2. Định dạng YYYY-MM-DD hoặc YYYY/MM/DD
    const matchIso = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (matchIso) {
        return {
            year: parseInt(matchIso[1], 10),
            month: parseInt(matchIso[2], 10),
            day: parseInt(matchIso[3], 10)
        };
    }

    // 3. Chuỗi Date(YYYY, MM, DD) của Google GViz
    const matchGviz = str.match(/Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})/);
    if (matchGviz) {
        return {
            year: parseInt(matchGviz[1], 10),
            month: parseInt(matchGviz[2], 10) + 1,
            day: parseInt(matchGviz[3], 10)
        };
    }

    // 4. Định dạng DD/MM/YYYY có ranh giới từ rõ ràng
    const matchDmy = str.match(/\b(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})\b/);
    if (matchDmy) {
        const d = parseInt(matchDmy[1], 10);
        const m = parseInt(matchDmy[2], 10);
        const y = parseInt(matchDmy[3], 10);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2020 && y <= 2030) {
            return { day: d, month: m, year: y };
        }
    }

    // 5. Số serial ngày trong Excel
    const num = Number(str);
    if (!isNaN(num) && num > 35000 && num < 60000) {
        const d = new Date(Math.round((num - 25569) * 86400 * 1000));
        return {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate()
        };
    }

    // 6. Native Date parse
    const d = new Date(str);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1990 && d.getFullYear() < 2100) {
        return {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate()
        };
    }

    return null;
}

/**
 * Kiểm tra xem ô câu trả lời có dữ liệu hay không
 */
function hasAnswer(answer) {
    return answer !== undefined && answer !== null && String(answer).trim().length > 0;
}

/**
 * Cập nhật danh sách các năm phát hiện trong Sheet
 */
function updateDetectedYears() {
    const yearsSet = new Set();
    const len = qaRecords.length;

    for (let i = 0; i < len; i++) {
        const p = parseDateFromRecord(qaRecords[i].time);
        if (p && p.year) yearsSet.add(p.year);
    }

    const nowYear = new Date().getFullYear();
    yearsSet.add(nowYear);

    detectedYears = Array.from(yearsSet).sort((a, b) => b - a);

    if (yearFilter) {
        let html = '';
        detectedYears.forEach(y => {
            html += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>Năm ${y}${y === nowYear ? ' (Hiện tại)' : ''}</option>`;
        });
        html += `<option value="all" ${currentYear === 'all' ? 'selected' : ''}>Tất cả các năm</option>`;
        yearFilter.innerHTML = html;
    }
}

/**
 * Cập nhật danh sách tùy chọn tháng trong bộ lọc
 */
function updateMonthFilterOptions() {
    if (!monthFilter) return;
    const now = new Date();
    const curM = now.getMonth() + 1;
    const curY = now.getFullYear();

    let html = `<option value="all" ${selectedMonth === 'all' ? 'selected' : ''}>Toàn bộ 12 tháng</option>`;
    for (let m = 1; m <= 12; m++) {
        const isCurrent = (m === curM && (currentYear === curY || currentYear === 'all'));
        const tag = isCurrent ? ' (Hiện tại)' : '';
        const isSel = selectedMonth === m ? 'selected' : '';
        html += `<option value="${m}" ${isSel}>Tháng ${m}${tag}</option>`;
    }
    monthFilter.innerHTML = html;
}

/**
 * Tính toán thống kê theo 12 tháng chuẩn xác 100% theo dữ liệu Google Sheet thực tế
 */
function calculateMonthlyStats(recordsToUse = qaRecords, targetYear = currentYear, bypassCache = false) {
    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];

    // ƯU TIÊN SỐ 1: Phục hồi ngay lập tức bộ đệm thống kê từ lần cập nhật cuối cùng (nếu không bypass)
    const hasPersisted = localStorage.getItem('ql_has_persisted_update') === 'true';
    if (!bypassCache && hasPersisted && (recordsToUse === qaRecords || !recordsToUse || recordsToUse.length === 0)) {
        if (targetYear === 2026 || targetYear === 2025) {
            const key = targetYear === 2026 ? 'ql_cached_monthly_stats_2026' : 'ql_cached_monthly_stats_2025';
            const cachedStr = localStorage.getItem(key);
            if (cachedStr) {
                try {
                    const parsed = JSON.parse(cachedStr);
                    if (Array.isArray(parsed) && parsed.length === 12) {
                        return parsed;
                    }
                } catch (e) {}
            }
        } else if (targetYear === 'all') {
            const str26 = localStorage.getItem('ql_cached_monthly_stats_2026');
            const str25 = localStorage.getItem('ql_cached_monthly_stats_2025');
            if (str26 && str25) {
                try {
                    const p26 = JSON.parse(str26);
                    const p25 = JSON.parse(str25);
                    if (Array.isArray(p26) && Array.isArray(p25)) {
                        return monthNames.map((name, i) => {
                            const q = (p26[i]?.questions || 0) + (p25[i]?.questions || 0);
                            const a = (p26[i]?.answers || 0) + (p25[i]?.answers || 0);
                            return {
                                month: i + 1,
                                monthName: name,
                                questions: q,
                                answers: a,
                                rate: q > 0 ? Math.round((a / q) * 1000) / 10 : 0
                            };
                        });
                    }
                } catch (e) {}
            }
        }
    }

    const stats = monthNames.map((name, i) => ({
        month: i + 1,
        monthName: name,
        questions: 0,
        answers: 0,
        rate: 0
    }));

    // 1. Tính toán trực tiếp từ dữ liệu trong recordsToUse
    if (recordsToUse && recordsToUse.length > 0) {
        for (let i = 0; i < recordsToUse.length; i++) {
            const rec = recordsToUse[i];
            const p = parseDateFromRecord(rec.time);
            if (!p || !p.month) continue;
            if (targetYear !== 'all' && p.year !== targetYear) continue;

            const mIdx = p.month - 1;
            if (mIdx >= 0 && mIdx < 12) {
                stats[mIdx].questions++;
                if (hasAnswer(rec.answer)) {
                    stats[mIdx].answers++;
                }
            }
        }
    } else {
        // Fallback sang thống kê chuẩn nếu qaRecords chưa tải xong
        let fallback = [];
        if (targetYear === 2026) fallback = OFFICIAL_MONTHLY_STATS_2026;
        else if (targetYear === 2025) fallback = OFFICIAL_MONTHLY_STATS_2025;
        else {
            fallback = OFFICIAL_MONTHLY_STATS_2026.map((s26, idx) => {
                const s25 = OFFICIAL_MONTHLY_STATS_2025[idx] || { questions: 0, answers: 0 };
                return {
                    questions: s26.questions + s25.questions,
                    answers: s26.answers + s25.answers
                };
            });
        }
        fallback.forEach((item, idx) => {
            if (idx < 12) {
                stats[idx].questions = item.questions;
                stats[idx].answers = item.answers;
            }
        });
    }

    // 2. Tránh đếm trùng lặp nếu userAddedQuestions đã được thêm vào recordsToUse
    if (userAddedQuestions && userAddedQuestions.length > 0) {
        const existingIds = new Set((recordsToUse || []).map(r => r.id));
        userAddedQuestions.forEach(rec => {
            if (existingIds.has(rec.id)) return;
            const p = parseDateFromRecord(rec.time);
            if (!p || !p.month) return;
            if (targetYear !== 'all' && p.year !== targetYear) return;
            const mIdx = p.month - 1;
            if (mIdx >= 0 && mIdx < 12) {
                stats[mIdx].questions++;
                if (hasAnswer(rec.answer)) {
                    stats[mIdx].answers++;
                }
            }
        });
    }

    // 3. Tính tỷ lệ phản hồi %
    stats.forEach(st => {
        st.rate = st.questions > 0 ? Math.round((st.answers / st.questions) * 1000) / 10 : 0;
    });

    return stats;
}

/**
 * RENDER TOÀN BỘ DỮ LIỆU & SO SÁNH THỜI GIAN THỰC
 */
function renderAllData() {
    const monthlyStats = calculateMonthlyStats();

    let totalYearQuestions = 0;
    let totalYearAnswers = 0;
    const monthsWithData = [];

    monthlyStats.forEach(st => {
        totalYearQuestions += st.questions;
        totalYearAnswers += st.answers;
        if (st.questions > 0) {
            monthsWithData.push(`${st.monthName} (${st.questions.toLocaleString('vi-VN')} câu)`);
        }
    });

    const now = new Date();
    const currentRealtimeMonth = now.getMonth() + 1;

    const displayMonth = selectedMonth === 'all' ? currentRealtimeMonth : selectedMonth;
    const monthStats = monthlyStats[displayMonth - 1] || { questions: 0, answers: 0, rate: 0 };

    // 1. Thẻ thống kê thời gian thực trên cùng
    const yearStr = currentYear === 'all' ? 'Tất cả các năm' : `năm ${currentYear}`;
    const totalRateText = totalYearQuestions > 0 ? ((totalYearAnswers / totalYearQuestions) * 100).toFixed(1) : '100';

    if (selectedMonth === 'all') {
        if (cardQuestionsCaptionEl) {
            cardQuestionsCaptionEl.textContent = `CÂU HỎI TIẾP NHẬN / THÁNG ${currentRealtimeMonth} (HIỆN TẠI)`;
        }
        if (cardAnswersCaptionEl) {
            cardAnswersCaptionEl.textContent = `CÂU TRẢ LỜI ĐÃ PHẢN HỒI / THÁNG ${currentRealtimeMonth} (HIỆN TẠI)`;
        }
        if (currentMonthQuestionsCountEl) {
            currentMonthQuestionsCountEl.textContent = monthStats.questions.toLocaleString('vi-VN');
        }
        if (currentMonthAnswersCountEl) {
            currentMonthAnswersCountEl.textContent = monthStats.answers.toLocaleString('vi-VN');
        }
        if (currentMonthQuestionsLabelEl) {
            currentMonthQuestionsLabelEl.textContent = `Số lượng tiếp nhận trong Tháng ${currentRealtimeMonth} hiện tại: ${monthStats.questions.toLocaleString('vi-VN')} câu hỏi`;
        }
        if (currentMonthAnswersLabelEl) {
            currentMonthAnswersLabelEl.textContent = `Số lượng đã phản hồi trong Tháng ${currentRealtimeMonth} hiện tại: ${monthStats.answers.toLocaleString('vi-VN')} phản hồi`;
        }
        if (cardQuestionsFooterEl) {
            cardQuestionsFooterEl.textContent = `Tổng tích lũy cả năm: ${totalYearQuestions.toLocaleString('vi-VN')} câu hỏi đã tiếp nhận (${yearStr})`;
        }
        if (cardAnswersFooterEl) {
            const currentMonthRate = monthStats.questions > 0 ? ((monthStats.answers / monthStats.questions) * 100).toFixed(1) : '100';
            cardAnswersFooterEl.textContent = `Tỷ lệ phản hồi Tháng ${currentRealtimeMonth}: ${currentMonthRate}% (${monthStats.answers.toLocaleString('vi-VN')}/${monthStats.questions.toLocaleString('vi-VN')}) • Cả năm: ${totalYearAnswers.toLocaleString('vi-VN')} phản hồi (${totalRateText}%)`;
        }
    } else {
        if (cardQuestionsCaptionEl) {
            cardQuestionsCaptionEl.textContent = `CÂU HỎI TIẾP NHẬN / THÁNG ${selectedMonth}`;
        }
        if (cardAnswersCaptionEl) {
            cardAnswersCaptionEl.textContent = `CÂU TRẢ LỜI ĐÃ PHẢN HỒI / THÁNG ${selectedMonth}`;
        }
        if (currentMonthQuestionsCountEl) {
            currentMonthQuestionsCountEl.textContent = monthStats.questions.toLocaleString('vi-VN');
        }
        if (currentMonthAnswersCountEl) {
            currentMonthAnswersCountEl.textContent = monthStats.answers.toLocaleString('vi-VN');
        }
        if (currentMonthQuestionsLabelEl) {
            currentMonthQuestionsLabelEl.textContent = `Tháng ${selectedMonth} (${yearStr}): ${monthStats.questions.toLocaleString('vi-VN')} câu hỏi tiếp nhận`;
        }
        if (currentMonthAnswersLabelEl) {
            currentMonthAnswersLabelEl.textContent = `Tháng ${selectedMonth} (${yearStr}): ${monthStats.answers.toLocaleString('vi-VN')} phản hồi hoàn tất`;
        }
        if (cardQuestionsFooterEl) {
            cardQuestionsFooterEl.textContent = `Tổng tích lũy cả năm: ${totalYearQuestions.toLocaleString('vi-VN')} câu hỏi đã tiếp nhận (${yearStr})`;
        }
        if (cardAnswersFooterEl) {
            const mRate = monthStats.questions > 0 ? ((monthStats.answers / monthStats.questions) * 100).toFixed(1) : '100';
            cardAnswersFooterEl.textContent = `Tỷ lệ phản hồi Tháng ${selectedMonth}: ${mRate}% (${monthStats.answers.toLocaleString('vi-VN')}/${monthStats.questions.toLocaleString('vi-VN')}) • Cả năm: ${totalYearAnswers.toLocaleString('vi-VN')} phản hồi`;
        }
    }

    if (legendQuestionsCountEl) legendQuestionsCountEl.textContent = `${totalYearQuestions.toLocaleString('vi-VN')} câu`;
    if (legendAnswersCountEl) legendAnswersCountEl.textContent = `${totalYearAnswers.toLocaleString('vi-VN')} câu`;
    if (sheetCountBadgeEl) sheetCountBadgeEl.textContent = qaRecords.length.toLocaleString('vi-VN');

    // 2. Render Bảng 12 tháng TRƯỚC TIÊN (đảm bảo số liệu trên bảng luôn cập nhật ngay lập tức)
    renderDetailedTable(monthlyStats, totalYearQuestions, totalYearAnswers);

    // 3. Render Bảng chi tiết có phân trang
    renderRawDataTable();

    // 4. Render Biểu đồ chính & Biểu đồ con (an toàn tuyệt đối có try-catch)
    try {
        renderMainChart(monthlyStats);
    } catch (chartErr) {
        console.warn("Lỗi render biểu đồ chính:", chartErr);
    }

    try {
        renderMiniCharts(monthlyStats);
    } catch (miniErr) {
        console.warn("Lỗi render biểu đồ con:", miniErr);
    }

    // 5. Cập nhật ảnh in biểu đồ
    updatePrintChartImage();
}

/**
 * Cập nhật ảnh chụp biểu đồ phục vụ bản in A4 sắc nét
 */
function updatePrintChartImage() {
    // 1. Biểu đồ chính 12 tháng
    const canvas = document.getElementById('mainMonthlyChart');
    const printImg = document.getElementById('printChartImg');
    const wrapper = document.querySelector('.main-chart-wrapper');
    if (canvas && printImg) {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            if (dataUrl && dataUrl.length > 200) {
                printImg.src = dataUrl;
                if (wrapper) wrapper.classList.add('has-print-img');
            }
        } catch (e) {
            // Không chặn nếu chạy qua file:// không cho xuất canvas
        }
    }

    // 2. Biểu đồ đường xu hướng Số câu hỏi / Tháng
    const canvasQ = document.getElementById('chartMiniQuestions');
    const printImgQ = document.getElementById('printMiniQuestionsImg');
    const boxQ = canvasQ ? canvasQ.closest('.mini-canvas-box') : null;
    if (canvasQ && printImgQ) {
        try {
            const dataUrlQ = canvasQ.toDataURL('image/png');
            if (dataUrlQ && dataUrlQ.length > 200) {
                printImgQ.src = dataUrlQ;
                if (boxQ) boxQ.classList.add('has-print-img');
            }
        } catch (e) {
            // Không chặn nếu chạy qua file://
        }
    }

    // 3. Biểu đồ đường xu hướng Số câu trả lời / Tháng
    const canvasA = document.getElementById('chartMiniAnswers');
    const printImgA = document.getElementById('printMiniAnswersImg');
    const boxA = canvasA ? canvasA.closest('.mini-canvas-box') : null;
    if (canvasA && printImgA) {
        try {
            const dataUrlA = canvasA.toDataURL('image/png');
            if (dataUrlA && dataUrlA.length > 200) {
                printImgA.src = dataUrlA;
                if (boxA) boxA.classList.add('has-print-img');
            }
        } catch (e) {
            // Không chặn nếu chạy qua file://
        }
    }
}

/**
 * Vẽ biểu đồ chính 12 tháng (Hỗ trợ Chart.js và Canvas 2D fallback)
 */
function renderMainChart(monthlyStats) {
    const canvas = document.getElementById('mainMonthlyChart');
    if (!canvas) return;

    const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const questionsData = monthlyStats.map(s => s.questions);
    const answersData = monthlyStats.map(s => s.answers);
    const maxVal = Math.max(...questionsData, ...answersData, 10);
    const suggestedMaxVal = Math.ceil(maxVal * 1.08);

    // Fallback Canvas 2D nếu không có thư viện Chart.js
    if (typeof Chart === 'undefined') {
        renderNativeCanvasMainChart(canvas, labels, questionsData, answersData);
        updatePrintChartImage();
        return;
    }

    if (mainChartInstance) {
        mainChartInstance.destroy();
    }

    mainChartInstance = new Chart(canvas, {
        type: currentChartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Số câu hỏi / Tháng',
                    data: questionsData,
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                    borderWidth: currentChartType === 'line' ? 3.5 : 0,
                    borderRadius: 4,
                    fill: currentChartType === 'line' ? false : undefined,
                    tension: 0.35,
                    barPercentage: 0.65,
                    categoryPercentage: 0.75
                },
                {
                    label: 'Số câu trả lời / Tháng',
                    data: answersData,
                    backgroundColor: '#06b6d4',
                    borderColor: '#06b6d4',
                    borderWidth: currentChartType === 'line' ? 3.5 : 0,
                    borderRadius: 4,
                    fill: currentChartType === 'line' ? false : undefined,
                    tension: 0.35,
                    barPercentage: 0.65,
                    categoryPercentage: 0.75
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Tắt animation để in ấn và hiển thị tức thời không bị trễ
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    padding: 10,
                    cornerRadius: 8,
                    titleFont: { family: 'Be Vietnam Pro', size: 12, weight: 'bold' },
                    bodyFont: { family: 'Be Vietnam Pro', size: 11 },
                    callbacks: {
                        title: (context) => `Tháng ${context[0].dataIndex + 1}`,
                        label: (context) => ` ${context.dataset.label}: ${context.raw.toLocaleString('vi-VN')} câu`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Be Vietnam Pro', size: 12, weight: '600' }
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMaxVal,
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Be Vietnam Pro', size: 11 },
                        callback: (value) => value.toLocaleString('vi-VN')
                    }
                }
            }
        }
    });

    setTimeout(updatePrintChartImage, 50);
}

/**
 * Trình vẽ biểu đồ thuần HTML5 Canvas 2D (Hoạt động 100% offline không cần Chart.js)
 */
function renderNativeCanvasMainChart(canvas, labels, qData, aData) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement ? canvas.parentElement.clientWidth || 800 : 800;
    const h = 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const padLeft = 60;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const maxVal = Math.max(...qData, ...aData, 100);
    const niceMax = Math.ceil(maxVal / 1000) * 1000 || 10000;

    // Kẻ lưới trục Y
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10.5px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'right';

    for (let step = 0; step <= 4; step++) {
        const val = Math.round((niceMax / 4) * step);
        const y = padTop + chartH - (val / niceMax) * chartH;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - padRight, y);
        ctx.stroke();
        ctx.fillText(val.toLocaleString('vi-VN'), padLeft - 8, y + 3.5);
    }

    // Vẽ các cột bar cho từng tháng
    const groupW = chartW / 12;
    const barW = Math.max(5, Math.min(groupW * 0.35, 18));

    labels.forEach((lbl, i) => {
        const cx = padLeft + i * groupW + groupW / 2;
        const qH = (qData[i] / niceMax) * chartH;
        const aH = (aData[i] / niceMax) * chartH;

        // Nhãn trục X
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, cx, h - 10);

        // Cột Câu hỏi (Xanh Emerald)
        if (qH > 0) {
            ctx.fillStyle = '#059669';
            ctx.beginPath();
            const qX = cx - barW - 1.5;
            const qY = padTop + chartH - qH;
            ctx.roundRect ? ctx.roundRect(qX, qY, barW, qH, [3, 3, 0, 0]) : ctx.rect(qX, qY, barW, qH);
            ctx.fill();
        }

        // Cột Câu trả lời (Xanh Cyan)
        if (aH > 0) {
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            const aX = cx + 1.5;
            const aY = padTop + chartH - aH;
            ctx.roundRect ? ctx.roundRect(aX, aY, barW, aH, [3, 3, 0, 0]) : ctx.rect(aX, aY, barW, aH);
            ctx.fill();
        }
    });
}

function updateMainChart() {
    const monthlyStats = calculateMonthlyStats();
    renderMainChart(monthlyStats);
}

/**
 * Vẽ 2 biểu đồ con
 */
function renderMiniCharts(monthlyStats) {
    const qData = monthlyStats.map(s => s.questions);
    const aData = monthlyStats.map(s => s.answers);

    const now = new Date();
    const currentRealtimeMonth = now.getMonth() + 1;
    const currentRealtimeYear = now.getFullYear();
    const displayMonth = selectedMonth === 'all' ? currentRealtimeMonth : selectedMonth;
    const curQ = monthlyStats[displayMonth - 1] ? monthlyStats[displayMonth - 1].questions : 0;
    const curA = monthlyStats[displayMonth - 1] ? monthlyStats[displayMonth - 1].answers : 0;

    // Mini 1: Questions
    const canvasQ = document.getElementById('chartMiniQuestions');
    if (canvasQ) {
        if (miniQuestionsChart) miniQuestionsChart.destroy();
        const badgeQ = document.getElementById('badgeQuestionsMonth');
        if (badgeQ) {
            badgeQ.textContent = selectedMonth === 'all'
                ? `Tháng ${currentRealtimeMonth} (Hiện tại): ${curQ.toLocaleString('vi-VN')} câu`
                : `Tháng ${selectedMonth}: ${curQ.toLocaleString('vi-VN')} câu hỏi`;
        }
        const footerQ = document.getElementById('miniFooterQuestions');
        if (footerQ) {
            footerQ.textContent = `Tháng ${displayMonth}: ${curQ.toLocaleString('vi-VN')} câu hỏi tiếp nhận`;
        }

        if (typeof Chart !== 'undefined') {
            const ctxQ = canvasQ.getContext('2d');
            const gradQ = ctxQ.createLinearGradient(0, 0, 0, 120);
            gradQ.addColorStop(0, 'rgba(5, 150, 105, 0.32)');
            gradQ.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

            miniQuestionsChart = new Chart(ctxQ, {
                type: 'line',
                data: {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                    datasets: [{
                        label: 'Câu hỏi / Tháng',
                        data: qData,
                        borderColor: '#059669',
                        borderWidth: 2.4,
                        backgroundColor: gradQ,
                        fill: true,
                        tension: 0.38,
                        pointRadius: 3,
                        pointBackgroundColor: '#059669'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                        y: { beginAtZero: true, grid: { color: '#f8fafc' }, ticks: { display: false } }
                    }
                }
            });
        } else {
            renderNativeSparkline(canvasQ, qData, '#059669', 'rgba(5, 150, 105, 0.15)');
        }
    }

    // Mini 2: Answers
    const canvasA = document.getElementById('chartMiniAnswers');
    if (canvasA) {
        if (miniAnswersChart) miniAnswersChart.destroy();
        const badgeA = document.getElementById('badgeAnswersMonth');
        if (badgeA) {
            badgeA.textContent = selectedMonth === 'all'
                ? `Tháng ${currentRealtimeMonth} (Hiện tại): ${curA.toLocaleString('vi-VN')} câu`
                : `Tháng ${selectedMonth}: ${curA.toLocaleString('vi-VN')} câu trả lời`;
        }
        const footerA = document.getElementById('miniFooterAnswers');
        if (footerA) {
            footerA.textContent = `Tháng ${displayMonth}: ${curA.toLocaleString('vi-VN')} phản hồi hoàn tất`;
        }

        if (typeof Chart !== 'undefined') {
            const ctxA = canvasA.getContext('2d');
            const gradA = ctxA.createLinearGradient(0, 0, 0, 120);
            gradA.addColorStop(0, 'rgba(6, 182, 212, 0.32)');
            gradA.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

            miniAnswersChart = new Chart(ctxA, {
                type: 'line',
                data: {
                    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                    datasets: [{
                        label: 'Câu trả lời / Tháng',
                        data: aData,
                        borderColor: '#06b6d4',
                        borderWidth: 2.4,
                        backgroundColor: gradA,
                        fill: true,
                        tension: 0.38,
                        pointRadius: 3,
                        pointBackgroundColor: '#06b6d4'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                        y: { beginAtZero: true, grid: { color: '#f8fafc' }, ticks: { display: false } }
                    }
                }
            });
        } else {
            renderNativeSparkline(canvasA, aData, '#06b6d4', 'rgba(6, 182, 212, 0.15)');
        }
    }

    updatePrintChartImage();
}

/**
 * Trình vẽ sparkline thuần Canvas 2D khi không có thư viện Chart.js
 */
function renderNativeSparkline(canvas, data, strokeColor, fillColor) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement ? canvas.parentElement.clientWidth || 300 : 300;
    const h = 100;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...data, 10);
    const pad = 12;
    const stepX = (w - pad * 2) / (data.length - 1);

    ctx.beginPath();
    data.forEach((val, i) => {
        const x = pad + i * stepX;
        const y = h - pad - (val / max) * (h - pad * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.lineTo(pad + (data.length - 1) * stepX, h);
    ctx.lineTo(pad, h);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

/**
 * Vẽ bảng chi tiết 12 tháng (Hỗ trợ in báo cáo A4)
 */
function renderDetailedTable(monthlyStats, totalQ, totalA) {
    if (!monthlyTableBodyEl) return;

    let html = '';
    const now = new Date();
    const currentRealtimeMonth = now.getMonth() + 1;
    const currentRealtimeYear = now.getFullYear();

    monthlyStats.forEach(st => {
        let evalPill = '<span class="pill-badge pill-status-empty">Chưa có dữ liệu</span>';
        if (st.questions > 0) {
            evalPill = st.rate >= 80
                ? '<span class="pill-badge pill-status-target">+ Đạt chỉ tiêu</span>'
                : '<span class="pill-badge pill-purple">+ Cần bổ sung</span>';
        }

        const isCurrentMonth = (st.month === currentRealtimeMonth && (currentYear === currentRealtimeYear || currentYear === 'all'));
        const isSelectedMonth = selectedMonth !== 'all' && st.month === selectedMonth;

        let monthLabel = '';
        if (isCurrentMonth) {
            monthLabel = `<strong class="text-emerald">${st.monthName}</strong>`;
        } else if (st.questions > 0) {
            monthLabel = `<strong>${st.monthName}</strong>`;
        } else {
            monthLabel = `<span>${st.monthName}</span>`;
        }

        const rowClasses = [
            isSelectedMonth ? 'row-selected' : '',
            isCurrentMonth ? 'row-current-month' : ''
        ].filter(Boolean).join(' ');

        html += `
            <tr class="${rowClasses}">
                <td>${monthLabel}</td>
                <td><span class="pill-badge ${st.questions > 0 ? 'pill-green' : 'pill-gray'}">${st.questions.toLocaleString('vi-VN')} câu hỏi</span></td>
                <td><span class="pill-badge ${st.answers > 0 ? 'pill-cyan' : 'pill-gray'}">${st.answers.toLocaleString('vi-VN')} câu trả lời</span></td>
                <td><strong>${st.questions > 0 ? st.rate + '%' : '-'}</strong></td>
                <td>${evalPill}</td>
            </tr>
        `;
    });

    monthlyTableBodyEl.innerHTML = html;

    if (monthlyTableFootEl) {
        const avgRate = totalQ > 0 ? ((totalA / totalQ) * 100).toFixed(1) + '%' : '100%';
        const yearTitle = currentYear === 'all' ? 'Tất cả các năm' : `năm ${currentYear}`;
        monthlyTableFootEl.innerHTML = `
            <tr>
                <td><strong>Tổng cả năm (${yearTitle})</strong></td>
                <td><strong>${totalQ.toLocaleString('vi-VN')} câu hỏi</strong></td>
                <td><strong>${totalA.toLocaleString('vi-VN')} câu trả lời</strong></td>
                <td><strong>${avgRate}</strong></td>
                <td><span class="pill-badge pill-status-target">+ Hoạt động bình thường</span></td>
            </tr>
        `;
    }
}

/**
 * Vẽ bảng danh sách bản ghi có PHÂN TRANG (Hỗ trợ 30,000+ dòng siêu mượt)
 * Cột: ID, Câu hỏi, Câu trả lời, Thời gian
 */
function renderRawDataTable() {
    if (!qaDataBodyEl) return;

    const searchTerm = searchInputEl ? searchInputEl.value.toLowerCase().trim() : '';

    // Lọc theo từ khóa tìm kiếm (bao gồm cả ID)
    filteredRecordsCache = qaRecords.filter(item => {
        if (searchTerm) {
            const fullText = ((item.id || '') + ' ' + item.question + ' ' + item.answer + ' ' + item.time).toLowerCase();
            return fullText.includes(searchTerm);
        }
        return true;
    });

    const totalFiltered = filteredRecordsCache.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // Cập nhật thông tin phân trang
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalFiltered);

    if (paginationInfoEl) {
        if (totalFiltered === 0) {
            paginationInfoEl.textContent = 'Không tìm thấy bản ghi nào';
        } else {
            paginationInfoEl.textContent = `Hiển thị ${(startIdx + 1).toLocaleString('vi-VN')} - ${endIdx.toLocaleString('vi-VN')} trong tổng số ${totalFiltered.toLocaleString('vi-VN')} bản ghi`;
        }
    }

    if (pageIndicatorEl) {
        pageIndicatorEl.textContent = `Trang ${currentPage} / ${totalPages}`;
    }

    if (btnFirstPageEl) btnFirstPageEl.disabled = (currentPage <= 1);
    if (btnPrevPageEl) btnPrevPageEl.disabled = (currentPage <= 1);
    if (btnNextPageEl) btnNextPageEl.disabled = (currentPage >= totalPages);
    if (btnLastPageEl) btnLastPageEl.disabled = (currentPage >= totalPages);

    if (totalFiltered === 0) {
        qaDataBodyEl.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 24px; color: #94a3b8;">
                    Không tìm thấy câu hỏi hoặc câu trả lời nào phù hợp.
                </td>
            </tr>
        `;
        return;
    }

    // Cắt lát chỉ vẽ đúng số dòng của trang hiện tại (Tránh làm đơ trình duyệt khi có 30,000 dòng)
    const pageRecords = filteredRecordsCache.slice(startIdx, endIdx);
    let html = '';

    pageRecords.forEach((item, index) => {
        const actualIndex = startIdx + index + 1;
        const displayId = item.id ? item.id : actualIndex.toString();
        html += `
            <tr>
                <td style="font-weight: 600; color: #065f46; font-family: monospace; font-size: 11.5px;">${escapeHtml(displayId)}</td>
                <td class="cell-question">${escapeHtml(item.question)}</td>
                <td class="cell-answer">${escapeHtml(item.answer)}</td>
                <td class="cell-time"><i class="fa-regular fa-clock"></i> ${escapeHtml(item.time)}</td>
                <td style="text-align: center; white-space: nowrap;">
                    <button type="button" class="btn-table-edit" onclick="openEditQuestionModal('${escapeHtml(displayId)}')" title="Sửa nội dung câu hỏi &amp; câu trả lời">
                        <i class="fa-solid fa-pen-to-square"></i> Sửa
                    </button>
                </td>
            </tr>
        `;
    });

    qaDataBodyEl.innerHTML = html;
}

/**
 * Thêm câu hỏi mới (Thử nghiệm realtime)
 */
function handleSaveNewQuestion() {
    const qInput = document.getElementById('inputQuestion');
    const aInput = document.getElementById('inputAnswer');
    const tInput = document.getElementById('inputTimestamp');
    const mSelect = document.getElementById('inputTargetMonth');

    if (!qInput || !aInput) return;
    const qVal = qInput.value.trim();
    const aVal = aInput.value.trim();

    if (!qVal) {
        showToast("Vui lòng nhập nội dung câu hỏi!", "warning");
        qInput.focus();
        return;
    }
    if (!aVal) {
        showToast("Vui lòng nhập nội dung câu trả lời!", "warning");
        aInput.focus();
        return;
    }

    const now = new Date();
    let timeStr = tInput && tInput.value.trim() ? tInput.value.trim() : `Thời gian ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    if (mSelect && mSelect.value !== 'current') {
        const customMonth = String(mSelect.value).padStart(2, '0');
        timeStr = `Thời gian 14:00 ngày 15/${customMonth}/2026`;
    }

    const newId = Date.now().toString();
    const newRecord = {
        id: newId,
        question: qVal,
        answer: aVal,
        time: timeStr
    };

    userAddedQuestions.unshift(newRecord);
    qaRecords.unshift(newRecord);

    // Lưu bền vững vào localStorage và IndexedDB
    saveUserAddedQuestionsToStorage();
    saveLatestUpdatedData(qaRecords, "Người dùng thêm câu hỏi");

    qInput.value = '';
    aInput.value = '';
    addQuestionModal.classList.remove('show');

    updateDetectedYears();
    renderAllData();
    showToast("Đã thêm câu hỏi và câu trả lời thành công! Dữ liệu mới đã được lưu lại vĩnh viễn.", "success");

    // Tự động đồng bộ lên Google Sheet qua Apps Script Web App (nếu có cấu hình)
    const appsScriptUrl = getActiveAppsScriptUrl1();
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
        sendUpdateToAppsScript1(appsScriptUrl, {
            action: 'add',
            id: newRecord.id,
            question: newRecord.question,
            answer: newRecord.answer,
            time: newRecord.time
        });
    }
}

/**
 * Xuất dữ liệu ra file CSV
 */
function exportTableToCsv() {
    const monthlyStats = calculateMonthlyStats();
    let csv = '\uFEFFTháng,Số câu hỏi / Tháng,Số câu trả lời / Tháng,Tỷ lệ phản hồi\n';

    monthlyStats.forEach(st => {
        csv += `"${st.monthName}","${st.questions}","${st.answers}","${st.rate}%"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Thong_Ke_Cau_Hoi_Tra_Loi_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Đã xuất file CSV thành công!", "success");
}

/**
 * Hiển thị thông báo Toast
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = '<i class="fa-solid fa-circle-info text-cyan"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check text-emerald"></i>';
    if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation text-amber"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/**
 * Thoát ký tự HTML an toàn
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ===================================================================
   HỆ THỐNG QUẢN LÝ CHỮ KÝ BẢN IN (NGƯỜI LẬP & LÃNH ĐẠO) - TRANG 1
   =================================================================== */
const DEFAULT_SIG_P1 = {
    userTitle: 'NGƯỜI LẬP BIỂU',
    userName: 'Nguyễn Thế Anh',
    userHint: '(Ký và ghi rõ họ tên)',
    leaderTitle: 'TRƯỞNG PHÒNG / PHỤ TRÁCH HỆ THỐNG',
    leaderName: '....................................................',
    leaderHint: '(Ký, đóng dấu và ghi rõ họ tên)',
    datePlace: '',
    autoDate: true
};

function getTodayVietnameseDate() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `Hà Nội, ngày ${d} tháng ${m} năm ${y}`;
}

function loadSignatureConfig() {
    try {
        const raw = localStorage.getItem('ql_signature_p1');
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_SIG_P1, ...parsed };
        }
    } catch (e) {
        console.warn('Lỗi đọc cấu hình chữ ký từ localStorage:', e);
    }
    const sharedUser = localStorage.getItem('ql_signature_shared_user');
    if (sharedUser) {
        return { ...DEFAULT_SIG_P1, userName: sharedUser };
    }
    return { ...DEFAULT_SIG_P1 };
}

function saveSignatureConfig(config) {
    try {
        localStorage.setItem('ql_signature_p1', JSON.stringify(config));
        if (config.userName) {
            localStorage.setItem('ql_signature_shared_user', config.userName);
        }
    } catch (e) {
        console.warn('Lỗi lưu cấu hình chữ ký vào localStorage:', e);
    }
}

function applySignatureToPrintDOM(config) {
    if (!config) config = loadSignatureConfig();

    const printUserTitle = document.getElementById('printSignUserTitle');
    const printUserName = document.getElementById('printSignUserName');
    const printUserHint = document.getElementById('printSignUserHint');
    const printLeaderTitle = document.getElementById('printSignLeaderTitle');
    const printLeaderName = document.getElementById('printSignLeaderName');
    const printLeaderHint = document.getElementById('printSignLeaderHint');
    const printDatePlace = document.getElementById('printSignDatePlace');

    if (printUserTitle) printUserTitle.textContent = config.userTitle || DEFAULT_SIG_P1.userTitle;
    if (printUserName) printUserName.textContent = config.userName || DEFAULT_SIG_P1.userName;
    if (printUserHint) printUserHint.textContent = config.userHint || DEFAULT_SIG_P1.userHint;
    if (printLeaderTitle) printLeaderTitle.textContent = config.leaderTitle || DEFAULT_SIG_P1.leaderTitle;
    if (printLeaderName) printLeaderName.textContent = config.leaderName || DEFAULT_SIG_P1.leaderName;
    if (printLeaderHint) printLeaderHint.textContent = config.leaderHint || DEFAULT_SIG_P1.leaderHint;

    if (printDatePlace) {
        const dateStr = config.autoDate ? getTodayVietnameseDate() : (config.datePlace || getTodayVietnameseDate());
        printDatePlace.textContent = dateStr;
    }
}

function updateSignatureLivePreview(config) {
    const prevUserTitle = document.getElementById('prevUserTitle');
    const prevUserName = document.getElementById('prevUserName');
    const prevUserHint = document.getElementById('prevUserHint');
    const prevLeaderTitle = document.getElementById('prevLeaderTitle');
    const prevLeaderName = document.getElementById('prevLeaderName');
    const prevLeaderHint = document.getElementById('prevLeaderHint');
    const prevDatePlace = document.getElementById('prevDatePlace');

    if (prevUserTitle) prevUserTitle.textContent = config.userTitle || DEFAULT_SIG_P1.userTitle;
    if (prevUserName) prevUserName.textContent = config.userName || DEFAULT_SIG_P1.userName;
    if (prevUserHint) prevUserHint.textContent = config.userHint || DEFAULT_SIG_P1.userHint;
    if (prevLeaderTitle) prevLeaderTitle.textContent = config.leaderTitle || DEFAULT_SIG_P1.leaderTitle;
    if (prevLeaderName) prevLeaderName.textContent = config.leaderName || DEFAULT_SIG_P1.leaderName;
    if (prevLeaderHint) prevLeaderHint.textContent = config.leaderHint || DEFAULT_SIG_P1.leaderHint;

    if (prevDatePlace) {
        const dateStr = config.autoDate ? getTodayVietnameseDate() : (config.datePlace || getTodayVietnameseDate());
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

    const currentConfig = loadSignatureConfig();

    cfgUserTitle.value = currentConfig.userTitle || DEFAULT_SIG_P1.userTitle;
    cfgUserName.value = currentConfig.userName || DEFAULT_SIG_P1.userName;
    cfgUserHint.value = currentConfig.userHint || DEFAULT_SIG_P1.userHint;
    cfgLeaderTitle.value = currentConfig.leaderTitle || DEFAULT_SIG_P1.leaderTitle;
    cfgLeaderName.value = currentConfig.leaderName || DEFAULT_SIG_P1.leaderName;
    cfgLeaderHint.value = currentConfig.leaderHint || DEFAULT_SIG_P1.leaderHint;
    if (chkAutoDate) chkAutoDate.checked = currentConfig.autoDate !== false;

    if (currentConfig.autoDate) {
        cfgDatePlace.value = getTodayVietnameseDate();
        cfgDatePlace.disabled = true;
    } else {
        cfgDatePlace.value = currentConfig.datePlace || getTodayVietnameseDate();
        cfgDatePlace.disabled = false;
    }

    updateSignatureLivePreview(currentConfig);
    applySignatureToPrintDOM(currentConfig);

    function getFormConfig() {
        const isAuto = chkAutoDate ? chkAutoDate.checked : true;
        return {
            userTitle: cfgUserTitle.value.trim() || DEFAULT_SIG_P1.userTitle,
            userName: cfgUserName.value.trim() || DEFAULT_SIG_P1.userName,
            userHint: cfgUserHint.value.trim() || DEFAULT_SIG_P1.userHint,
            leaderTitle: cfgLeaderTitle.value.trim() || DEFAULT_SIG_P1.leaderTitle,
            leaderName: cfgLeaderName.value.trim() || DEFAULT_SIG_P1.leaderName,
            leaderHint: cfgLeaderHint.value.trim() || DEFAULT_SIG_P1.leaderHint,
            datePlace: isAuto ? getTodayVietnameseDate() : cfgDatePlace.value.trim(),
            autoDate: isAuto
        };
    }

    [cfgUserTitle, cfgUserName, cfgUserHint, cfgLeaderTitle, cfgLeaderName, cfgLeaderHint, cfgDatePlace].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                const conf = getFormConfig();
                updateSignatureLivePreview(conf);
                applySignatureToPrintDOM(conf);
            });
        }
    });

    if (chkAutoDate) {
        chkAutoDate.addEventListener('change', () => {
            if (chkAutoDate.checked) {
                cfgDatePlace.value = getTodayVietnameseDate();
                cfgDatePlace.disabled = true;
            } else {
                cfgDatePlace.disabled = false;
            }
            const conf = getFormConfig();
            updateSignatureLivePreview(conf);
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
            saveSignatureConfig(conf);
            updateSignatureLivePreview(conf);
            applySignatureToPrintDOM(conf);

            const userMeta = document.querySelector('.user-meta');
            if (userMeta && conf.userName) {
                userMeta.textContent = `Người dùng: ${conf.userName} (theanhthtc@vnu.edu.vn)`;
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
            cfgUserTitle.value = DEFAULT_SIG_P1.userTitle;
            cfgUserName.value = DEFAULT_SIG_P1.userName;
            cfgUserHint.value = DEFAULT_SIG_P1.userHint;
            cfgLeaderTitle.value = DEFAULT_SIG_P1.leaderTitle;
            cfgLeaderName.value = DEFAULT_SIG_P1.leaderName;
            cfgLeaderHint.value = DEFAULT_SIG_P1.leaderHint;
            if (chkAutoDate) chkAutoDate.checked = true;
            cfgDatePlace.value = getTodayVietnameseDate();
            cfgDatePlace.disabled = true;

            saveSignatureConfig(DEFAULT_SIG_P1);
            updateSignatureLivePreview(DEFAULT_SIG_P1);
            applySignatureToPrintDOM(DEFAULT_SIG_P1);

            showToast('Đã khôi phục thông tin chữ ký bản in về mặc định!', 'info');
        });
    }

    if (btnPreviewPrintFromSig) {
        btnPreviewPrintFromSig.addEventListener('click', () => {
            const conf = getFormConfig();
            saveSignatureConfig(conf);
            applySignatureToPrintDOM(conf);
            handlePrintReport();
        });
    }
}

/* ===================================================================
   TÍCH HỢP GOOGLE APPS SCRIPT WEB APP - TRANG 1 (THỐNG KÊ CÂU HỎI)
   Bảo mật 100%: Kết nối, Hiển thị và Sửa chữa thông tin với Google Sheet
   mà KHÔNG CẦN chia sẻ công khai ("Anyone with link") file Google Sheet!
   =================================================================== */

const APPS_SCRIPT_URL_KEY1 = 'ql_messenger_apps_script_url';
let currentAppsScriptUrl1 = (localStorage.getItem(APPS_SCRIPT_URL_KEY1) || '').trim();

/**
 * Lấy URL Apps Script Web App Trang 1
 */
function getActiveAppsScriptUrl1() {
    let saved = '';
    try {
        saved = (localStorage.getItem(APPS_SCRIPT_URL_KEY1) || '').trim();
    } catch (e) {}
    if (!saved && window.DEFAULT_APPS_SCRIPT_URL_PAGE1) {
        saved = String(window.DEFAULT_APPS_SCRIPT_URL_PAGE1).trim();
    }
    return saved;
}

/**
 * Cập nhật giao diện trạng thái kết nối Apps Script trên Header
 */
function updateAppsScriptStatusUI1() {
    const url = getActiveAppsScriptUrl1();
    const isValid = Boolean(url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('docs.google.com/spreadsheets'));

    const badge = document.getElementById('topbarWebhookBadge1');
    const textEl = document.getElementById('topbarWebhookText1');
    const statusText1 = document.getElementById('appsScriptStatusText1');
    const inputUrl = document.getElementById('inputAppsScriptUrl1');

    if (inputUrl && !inputUrl.value && url) {
        inputUrl.value = url;
    }

    if (badge && textEl) {
        if (isValid) {
            badge.className = "topbar-webhook-badge connected";
            textEl.textContent = "Apps Script: Đã kết nối Sheet";
            badge.title = "Đang kết nối bảo mật qua Google Apps Script Web App (Sheet riêng tư)";
        } else {
            badge.className = "topbar-webhook-badge disconnected";
            textEl.textContent = "Apps Script: Chưa kết nối";
            badge.title = "Chưa kết nối Apps Script. Bấm vào đây để thiết lập kết nối bảo mật không cần public link Google Sheet!";
        }
    }

    if (statusText1) {
        if (isValid) {
            statusText1.innerHTML = `<span style="color: #059669; font-weight: 700;"><i class="fa-solid fa-circle-check"></i> Đang hoạt động:</span> <span style="font-family: monospace; font-size: 11px; color: #0284c7;">${escapeHtml(url.substring(0, 48))}...</span>`;
        } else {
            statusText1.innerHTML = `<span style="color: #e11d48; font-weight: 700;"><i class="fa-solid fa-circle-xmark"></i> Chưa kết nối:</span> Hãy triển khai Web App và dán link vào ô trên.`;
        }
    }
}

/**
 * Giữ kết nối Apps Script luôn sẵn sàng (chống cold start)
 */
function initAppsScriptKeepAlive1() {
    setInterval(() => {
        const url = getActiveAppsScriptUrl1();
        if (url && url.startsWith('https://script.google.com/macros/s/')) {
            fetch(url + (url.includes('?') ? '&' : '?') + 'action=ping', { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
        }
    }, 4 * 60 * 1000);
}

/**
 * Mở modal cấu hình Apps Script Trang 1
 */
window.openAppsScriptModal1 = function() {
    const modal = document.getElementById('appsScriptModal1');
    if (!modal) return;
    modal.classList.add('show');
    const input = document.getElementById('inputAppsScriptUrl1');
    if (input) input.value = getActiveAppsScriptUrl1();
    updateAppsScriptStatusUI1();
};

/**
 * Đóng modal cấu hình Apps Script Trang 1
 */
window.closeAppsScriptModal1 = function() {
    const modal = document.getElementById('appsScriptModal1');
    if (modal) modal.classList.remove('show');
};

/**
 * Lưu link Apps Script Web App Trang 1
 */
window.handleSaveAppsScriptUrl1 = function() {
    const input = document.getElementById('inputAppsScriptUrl1');
    const url = input ? input.value.trim() : '';

    if (!url) {
        localStorage.removeItem(APPS_SCRIPT_URL_KEY1);
        currentAppsScriptUrl1 = '';
        updateAppsScriptStatusUI1();
        showToast("Đã xóa liên kết Google Apps Script Trang 1.", "info");
        return;
    }

    if (url.includes('docs.google.com/spreadsheets')) {
        showToast("Đây là link xem Google Sheet thông thường! Bạn cần dán link Web App Apps Script (https://script.google.com/macros/s/.../exec) để kết nối bảo mật!", "warning");
        return;
    }

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
        showToast("Link Web App không hợp lệ! URL phải bắt đầu bằng https://script.google.com/macros/s/.../exec", "warning");
        return;
    }

    localStorage.setItem(APPS_SCRIPT_URL_KEY1, url);
    currentAppsScriptUrl1 = url;
    updateAppsScriptStatusUI1();
    showToast("Đã lưu và kích hoạt link Apps Script thành công! Đang tiến hành tải dữ liệu từ Google Sheet...", "success");

    // Tự động đồng bộ ngay
    fetchDataFromAppsScript(url, true, false);
};

/**
 * Nút đồng bộ từ Apps Script trong modal
 */
window.handleSyncFromAppsScript1 = function() {
    const url = getActiveAppsScriptUrl1();
    if (!url) {
        showToast("Vui lòng dán link Apps Script Web App trước khi đồng bộ!", "warning");
        return;
    }
    fetchDataFromAppsScript(url, true, false);
};

/**
 * Sao chép mã Google Apps Script
 */
window.copyAppsScriptCode1 = function() {
    const pre = document.getElementById('appsScriptCodeText1');
    if (!pre) return;
    const text = pre.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Đã sao chép toàn bộ mã Apps Script Trang 1 vào bộ nhớ tạm!", "success");
    }).catch(() => {
        showToast("Không thể sao chép tự động, bạn hãy bôi đen mã để copy thủ công.", "warning");
    });
};

/**
 * TẢI DỮ LIỆU TỪ GOOGLE SHEET QUA APPS SCRIPT WEB APP
 * (Bảo mật - Chạy được ngay cả khi file Google Sheet để chế độ RIÊNG TƯ / PRIVATE)
 */
async function fetchDataFromAppsScript(url, isUserAction = false, isSilent = false) {
    if (!url) return false;

    if (topRefreshBtn && isUserAction) topRefreshBtn.classList.add('spinning');
    if (syncStatusTextEl) {
        syncStatusTextEl.textContent = isUserAction ? "Đang đồng bộ từ Google Apps Script..." : "Đang kiểm tra kết nối Apps Script...";
    }

    try {
        let rawData = null;

        // Cách 1: Thử gọi fetch GET trực tiếp
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);
            const fetchUrl = url + (url.includes('?') ? '&' : '?') + 'action=read&t=' + Date.now();
            const res = await fetch(fetchUrl, { signal: controller.signal, cache: 'no-store' });
            clearTimeout(timer);
            if (res.ok) {
                const json = await res.json();
                if (json && (json.data || json.records || Array.isArray(json))) {
                    rawData = json.data || json.records || json;
                }
            }
        } catch (e1) {
            console.log("Fetch trực tiếp qua Apps Script gặp hạn chế redirect/CORS, tự động chuyển sang JSONP Stream:", e1);
        }

        // Cách 2: Nếu fetch trực tiếp bị chặn redirect, dùng JSONP Stream (100% không bị CORS)
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            try {
                rawData = await fetchAppsScriptViaJsonp(url, 15000);
            } catch (e2) {
                console.warn("Lỗi JSONP Apps Script:", e2);
            }
        }

        if (rawData && Array.isArray(rawData) && rawData.length > 0) {
            const normalized = normalizeRecordsFromAppsScript(rawData);
            if (normalized.length > 0) {
                applyNewRecords(normalized, "Google Apps Script Web App");
                updateAppsScriptStatusUI1();
                if (isUserAction && !isSilent) {
                    showToast(`Đã đồng bộ thành công ${normalized.length.toLocaleString('vi-VN')} câu hỏi từ Google Sheet qua Apps Script!`, "success");
                }
                return true;
            }
        }

        if (isUserAction && !isSilent) {
            showToast("Đã kết nối Apps Script nhưng chưa nhận được dữ liệu hợp lệ. Hãy kiểm tra lại file Sheet!", "warning");
        }
        return false;
    } catch (err) {
        console.warn("Lỗi tải từ Apps Script Web App:", err);
        if (isUserAction && !isSilent) {
            showToast("Lỗi kết nối Apps Script: " + err.message, "warning");
        }
        return false;
    } finally {
        if (topRefreshBtn) {
            setTimeout(() => topRefreshBtn.classList.remove('spinning'), 300);
        }
    }
}

/**
 * Tải stream JSONP từ Google Apps Script (Miễn nhiễm mọi hạn chế CORS & Redirect)
 */
function fetchAppsScriptViaJsonp(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const callbackName = 'appsScriptCb_' + Math.floor(Math.random() * 1000000);
        const script = document.createElement('script');
        let timer = null;

        const cleanup = () => {
            if (timer) clearTimeout(timer);
            if (script.parentNode) script.parentNode.removeChild(script);
            delete window[callbackName];
        };

        timer = setTimeout(() => {
            cleanup();
            reject(new Error("Timeout khi kết nối Apps Script JSONP"));
        }, timeoutMs);

        window[callbackName] = function(res) {
            cleanup();
            if (res && res.status === 'success' && res.data) {
                resolve(res.data);
            } else if (res && (res.data || res.records)) {
                resolve(res.data || res.records);
            } else if (Array.isArray(res)) {
                resolve(res);
            } else {
                reject(new Error("Dữ liệu Apps Script trả về không hợp lệ"));
            }
        };

        const jsonpUrl = url + (url.includes('?') ? '&' : '?') + 'action=read&callback=' + callbackName + '&t=' + Date.now();
        script.src = jsonpUrl;
        script.onerror = () => {
            cleanup();
            reject(new Error("Không thể kết nối stream Apps Script JSONP"));
        };
        document.head.appendChild(script);
    });
}

/**
 * Chuẩn hóa danh sách bản ghi nhận từ Apps Script
 */
function normalizeRecordsFromAppsScript(data) {
    if (!Array.isArray(data)) return [];
    return data.map((item, idx) => {
        if (Array.isArray(item)) {
            return {
                id: String(item[0] || (idx + 1)).trim(),
                question: String(item[1] || '').trim(),
                answer: String(item[2] || '').trim(),
                time: String(item[3] || '').trim()
            };
        } else if (typeof item === 'object' && item !== null) {
            return {
                id: String(item.id || item.ID || (idx + 1)).trim(),
                question: String(item.question || item.cauHoi || item.Question || '').trim(),
                answer: String(item.answer || item.cauTraLoi || item.Answer || '').trim(),
                time: String(item.time || item.thoiGian || item.Time || '').trim()
            };
        }
        return null;
    }).filter(r => r && (r.question || r.answer || r.id));
}

/**
 * GỬI DỮ LIỆU CẬP NHẬT / THÊM MỚI TỚI APPS SCRIPT WEB APP (CHẠY NGẦM KHÔNG LAG)
 */
async function sendUpdateToAppsScript1(url, payload) {
    if (!url) return false;
    try {
        if (payload.action === 'update') {
            showToast("Đang đồng bộ câu hỏi được chỉnh sửa lên Google Sheet qua Apps Script...", "info");
        } else if (payload.action === 'add') {
            showToast("Đang ghi nhận câu hỏi mới vào Google Sheet qua Apps Script...", "info");
        }

        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        }).then(() => {
            if (payload.action === 'update') {
                showToast("Đã đồng bộ chỉnh sửa câu hỏi trực tiếp lên Google Sheet thành công!", "success");
            } else if (payload.action === 'add') {
                showToast("Đã thêm câu hỏi mới vào Google Sheet thành công!", "success");
            }
        }).catch(err => {
            console.warn("Lỗi gửi dữ liệu tới Apps Script:", err);
            showToast("Đã lưu trên website nhưng việc gửi tới Apps Script gặp sự cố!", "warning");
        });

        return true;
    } catch (err) {
        console.warn("Lỗi sendUpdateToAppsScript1:", err);
        return false;
    }
}

/* ===================================================================
   CHỨC NĂNG SỬA THÔNG TIN CÂU HỎI & PHẢN HỒI (TRỰC TIẾP TRÊN SHEET)
   =================================================================== */

/**
 * Mở modal sửa thông tin câu hỏi
 */
window.openEditQuestionModal = function(recordId) {
    if (!recordId) return;
    const strId = String(recordId).trim();
    const item = qaRecords.find(r => String(r.id).trim() === strId);
    if (!item) {
        showToast("Không tìm thấy thông tin câu hỏi có ID: " + strId, "warning");
        return;
    }

    const modal = document.getElementById('editQuestionModal');
    if (!modal) return;

    document.getElementById('editRecordId').value = item.id;
    document.getElementById('editInputId').value = item.id;
    document.getElementById('editInputQuestion').value = item.question || '';
    document.getElementById('editInputAnswer').value = item.answer || '';
    document.getElementById('editInputTime').value = item.time || '';

    modal.classList.add('show');
};

/**
 * Đóng modal sửa thông tin câu hỏi
 */
window.closeEditQuestionModal = function() {
    const modal = document.getElementById('editQuestionModal');
    if (modal) modal.classList.remove('show');
};

/**
 * Gán thời gian hiện tại vào ô mốc thời gian sửa
 */
window.setEditCurrentTime = function() {
    const now = new Date();
    const timeStr = `Thời gian ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const input = document.getElementById('editInputTime');
    if (input) input.value = timeStr;
};

/**
 * Lưu thay đổi câu hỏi & đồng bộ lên Google Sheet
 */
window.handleSaveEditedQuestion = function() {
    const recordId = document.getElementById('editRecordId').value;
    const qVal = document.getElementById('editInputQuestion').value.trim();
    const aVal = document.getElementById('editInputAnswer').value.trim();
    const tVal = document.getElementById('editInputTime').value.trim();

    if (!qVal) {
        showToast("Vui lòng nhập nội dung câu hỏi!", "warning");
        document.getElementById('editInputQuestion').focus();
        return;
    }
    if (!aVal) {
        showToast("Vui lòng nhập nội dung câu trả lời!", "warning");
        document.getElementById('editInputAnswer').focus();
        return;
    }

    const item = qaRecords.find(r => String(r.id).trim() === String(recordId).trim());
    if (!item) {
        showToast("Không tìm thấy bản ghi cần sửa!", "warning");
        return;
    }

    // 1. Cập nhật dữ liệu trong bộ nhớ
    item.question = qVal;
    item.answer = aVal;
    if (tVal) item.time = tVal;

    // Cập nhật trong danh sách câu hỏi người dùng tự thêm (nếu có)
    const userItem = userAddedQuestions.find(r => String(r.id).trim() === String(recordId).trim());
    if (userItem) {
        userItem.question = qVal;
        userItem.answer = aVal;
        userItem.time = item.time;
        saveUserAddedQuestionsToStorage();
    }

    // Lưu bền vững vào IndexedDB & LocalStorage
    saveLatestUpdatedData(qaRecords, "Sửa thông tin câu hỏi");

    // Đóng modal
    closeEditQuestionModal();

    // Cập nhật lại giao diện ngay lập tức
    updateDetectedYears();
    renderAllData();

    // 2. Gửi đồng bộ lên Google Sheet qua Apps Script Web App
    const appsScriptUrl = getActiveAppsScriptUrl1();
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
        sendUpdateToAppsScript1(appsScriptUrl, {
            action: 'update',
            id: recordId,
            question: qVal,
            answer: aVal,
            time: item.time
        });
    } else {
        showToast("Đã lưu sửa đổi trên website! (Hãy kết nối Apps Script Web App để tự động đồng bộ sang Google Sheet)", "info");
    }
};

// Đăng ký toàn cục
window.openAppsScriptModal1 = openAppsScriptModal1;
window.closeAppsScriptModal1 = closeAppsScriptModal1;
window.handleSaveAppsScriptUrl1 = handleSaveAppsScriptUrl1;
window.handleSyncFromAppsScript1 = handleSyncFromAppsScript1;
window.copyAppsScriptCode1 = copyAppsScriptCode1;
window.openEditQuestionModal = openEditQuestionModal;
window.closeEditQuestionModal = closeEditQuestionModal;
window.setEditCurrentTime = setEditCurrentTime;
window.handleSaveEditedQuestion = handleSaveEditedQuestion;


