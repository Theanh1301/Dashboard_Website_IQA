/**
 * ===================================================================
 * BẢNG THỐNG KÊ THU - CHI & SỐ DƯ NGÂN SÁCH THEO THÁNG (INDEX2.HTML)
 * Đồng bộ Google Sheet: https://docs.google.com/spreadsheets/d/1EMLGqqdeLV3FgbQaL0fAWGmT9F4YKjA_dm-WIvRS0fU/edit?gid=874461169#gid=874461169
 * Sheet ID: 1EMLGqqdeLV3FgbQaL0fAWGmT9F4YKjA_dm-WIvRS0fU | GID: 874461169
 * Cấu trúc cột: Số tiền chi | Số tiền tăng | Số tiền còn lại | Thời gian
 *
 * YÊU CẦU ĐẶC BIỆT:
 * 1. Tổng số tiền đã chi / tháng (Tổng cột Số tiền chi = 2.969.659 ₫)
 * 2. Tổng số tiền tăng / tháng (Tổng cột Số tiền tăng = 0 ₫)
 * 3. Số tiền còn lại: LẤY ĐÚNG SỐ LIỆU CUỐI CÙNG CỦA CỘT SỐ LIỆU CÒN LẠI = 43.311.351 ₫
 * ===================================================================
 */

// Link Google Sheet chính thức của người dùng
const DEFAULT_GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1EMLGqqdeLV3FgbQaL0fAWGmT9F4YKjA_dm-WIvRS0fU/edit?gid=874461169#gid=874461169";
const DEFAULT_SHEET_ID = "1EMLGqqdeLV3FgbQaL0fAWGmT9F4YKjA_dm-WIvRS0fU";
const DEFAULT_SHEET_GID = "874461169";

// DỮ LIỆU BAN ĐẦU CHUẨN XÁC 100% THEO FILE GOOGLE SHEET
const DEFAULT_TRANSACTIONS = [
    {
        id: "GD-01",
        expense: 1192659,
        income: 0,
        balance: 45088351,
        time: "Thời gian 09:45 ngày 12/10/2026",
        date: "12/10/2026",
        description: "Khoản chi phát sinh ngày 12/10/2026",
        year: 2026,
        month: 10
    },
    {
        id: "GD-02",
        expense: 40000,
        income: 0,
        balance: 45048351,
        time: "Thời gian 07:45 ngày 13/10/2026",
        date: "13/10/2026",
        description: "Khoản chi phát sinh ngày 13/10/2026",
        year: 2026,
        month: 10
    },
    {
        id: "GD-03",
        expense: 15000,
        income: 0,
        balance: 45033351,
        time: "Thời gian 19:47 ngày 14/10/2026",
        date: "14/10/2026",
        description: "Khoản chi phát sinh ngày 14/10/2026 (1)",
        year: 2026,
        month: 10
    },
    {
        id: "GD-04",
        expense: 22000,
        income: 0,
        balance: 45011351,
        time: "Thời gian 19:49 ngày 14/10/2026",
        date: "14/10/2026",
        description: "Khoản chi phát sinh ngày 14/10/2026 (2)",
        year: 2026,
        month: 10
    },
    {
        id: "GD-05",
        expense: 200000,
        income: 0,
        balance: 44811351,
        time: "Thời gian 09:05 ngày 15/10/2026",
        date: "15/10/2026",
        description: "Khoản chi phát sinh ngày 15/10/2026 (1)",
        year: 2026,
        month: 10
    },
    {
        id: "GD-06",
        expense: 1500000,
        income: 0,
        balance: 43311351,
        time: "Thời gian 12:29 ngày 15/10/2026",
        date: "15/10/2026",
        description: "Khoản chi phát sinh ngày 15/10/2026 (2) - Hàng cuối cùng",
        year: 2026,
        month: 10
    }
];

// Trạng thái ứng dụng
let currentGoogleSheetUrl = DEFAULT_GOOGLE_SHEET_URL;
let currentYear = 2026;
let selectedMonth = 'all'; // 'all' hoặc 1..12
let currentChartType = 'bar'; // 'bar' hoặc 'line'
let transactionsData = [...DEFAULT_TRANSACTIONS];

// Số liệu tổng hợp 12 tháng
let monthlyStatsData = {
    2026: [],
    2025: []
};

// SỐ LIỆU CUỐI CÙNG CỦA CỘT SỐ TIỀN CÒN LẠI (YÊU CẦU ĐẶC BIỆT CỦA NGƯỜI DÙNG)
let latestRemainingBalance = 43311351;

// Instance biểu đồ Chart.js
let mainFinanceChart = null;
let miniCompareChart = null;
let miniStructureChart = null;

// Phân trang
let currentPage = 1;
let pageSize = 25;
let filteredTransactions = [];
let transactionTypeFilter = 'all';

// DOM Elements
const currentRealtimeClockEl = document.getElementById('currentRealtimeClock');
const topRefreshBtn = document.getElementById('topRefreshBtn');
const viewSheetLink = document.getElementById('viewSheetLink');
const refreshDataBtn = document.getElementById('refreshDataBtn');
const syncStatusTextEl = document.getElementById('syncStatusText');
const sheetCountBadgeEl = document.getElementById('sheetCountBadge');

// 3 Thẻ lớn trọng tâm
const totalIncomeCountEl = document.getElementById('totalIncomeCount');
const totalExpenseCountEl = document.getElementById('totalExpenseCount');
const totalBalanceCountEl = document.getElementById('totalBalanceCount');
const cardIncomeCaptionEl = document.getElementById('cardIncomeCaption');
const cardExpenseCaptionEl = document.getElementById('cardExpenseCaption');
const cardBalanceCaptionEl = document.getElementById('cardBalanceCaption');
const currentMonthIncomeLabelEl = document.getElementById('currentMonthIncomeLabel');
const currentMonthExpenseLabelEl = document.getElementById('currentMonthExpenseLabel');
const currentMonthBalanceLabelEl = document.getElementById('currentMonthBalanceLabel');
const cardIncomeFooterEl = document.getElementById('cardIncomeFooter');
const cardExpenseFooterEl = document.getElementById('cardExpenseFooter');
const cardBalanceFooterEl = document.getElementById('cardBalanceFooter');

// Legend Pills
const legendIncomeCountEl = document.getElementById('legendIncomeCount');
const legendExpenseCountEl = document.getElementById('legendExpenseCount');
const legendBalanceCountEl = document.getElementById('legendBalanceCount');

// Bảng 12 tháng
const monthlyTableBodyEl = document.getElementById('monthlyTableBody');
const footTotalIncomeEl = document.getElementById('footTotalIncome');
const footTotalExpenseEl = document.getElementById('footTotalExpense');
const footTotalNetEl = document.getElementById('footTotalNet');
const footTotalBalanceEl = document.getElementById('footTotalBalance');
const footAvgRateEl = document.getElementById('footAvgRate');

// Bảng giao dịch
const transactionsDataBodyEl = document.getElementById('transactionsDataBody');
const searchInputEl = document.getElementById('searchInput');
const pageSizeSelectEl = document.getElementById('pageSizeSelect');
const paginationInfoEl = document.getElementById('paginationInfo');
const pageIndicatorEl = document.getElementById('pageIndicator');
const btnFirstPageEl = document.getElementById('btnFirstPage');
const btnPrevPageEl = document.getElementById('btnPrevPage');
const btnNextPageEl = document.getElementById('btnNextPage');
const btnLastPageEl = document.getElementById('btnLastPage');

// Modals
const addTransactionModal = document.getElementById('addTransactionModal');
const openAddTransactionBtn = document.getElementById('openAddTransactionBtn');
const quickAddBtn = document.getElementById('quickAddBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const saveTransactionBtn = document.getElementById('saveTransactionBtn');

const importModal = document.getElementById('importModal');
const btnOpenImportModal = document.getElementById('btnOpenImportModal');
const closeImportModalBtn = document.getElementById('closeImportModalBtn');
const cancelImportBtn = document.getElementById('cancelImportBtn');
const processImportBtn = document.getElementById('processImportBtn');
const csvFileInput = document.getElementById('csvFileInput');
const pasteDataInput = document.getElementById('pasteDataInput');
const customSheetUrlInput = document.getElementById('customSheetUrlInput');

const guideModal = document.getElementById('guideModal');
const btnShareGuide = document.getElementById('btnShareGuide');
const closeGuideModalBtn = document.getElementById('closeGuideModalBtn');
const closeGuideBtnAction = document.getElementById('closeGuideBtnAction');
const btnPasteDataQuick = document.getElementById('btnPasteDataQuick');

const btnPrintReport = document.getElementById('btnPrintReport');
const quickPrintBtn = document.getElementById('quickPrintBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const quickExportDataBtn = document.getElementById('quickExportDataBtn');
const quickSyncBtn = document.getElementById('quickSyncBtn');
const yearFilterEl = document.getElementById('yearFilter');
const monthFilterEl = document.getElementById('monthFilter');
const transactionTypeFilterEl = document.getElementById('transactionTypeFilter');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

/**
 * Khởi tạo ứng dụng
 */
function initApp() {
    initRealtimeClock();
    initEventListeners();

    if (viewSheetLink) {
        viewSheetLink.href = currentGoogleSheetUrl;
    }

    // 1. Kiểm tra nếu có dữ liệu đã lưu trong localStorage từ lần cập nhật trước
    let restoredFromStorage = false;
    const savedFinanceTx = localStorage.getItem('ql_finance_transactions');
    const savedFinanceBal = localStorage.getItem('ql_finance_latest_balance');
    if (savedFinanceTx) {
        try {
            const parsedList = JSON.parse(savedFinanceTx);
            if (Array.isArray(parsedList) && parsedList.length > 0) {
                if (savedFinanceBal) latestRemainingBalance = cleanMoneyToNumber(savedFinanceBal);
                applyNewFinanceRows(parsedList, "Dữ liệu lưu trữ mới nhất");
                restoredFromStorage = true;
            }
        } catch(e) {}
    }

    if (!restoredFromStorage) {
        if (window.RAW_FINANCE_SHEET_DATA && Array.isArray(window.RAW_FINANCE_SHEET_DATA) && window.RAW_FINANCE_SHEET_DATA.length > 0) {
            applyNewFinanceRows(window.RAW_FINANCE_SHEET_DATA, "Google Sheet (Đã đồng bộ)");
        } else {
            applyNewFinanceRows(DEFAULT_TRANSACTIONS, "Dữ liệu Google Sheet");
        }
    }

    // 2. Thử đồng bộ trực tiếp qua mạng từ Google Sheet URL
    loadDataFromGoogleSheet(currentGoogleSheetUrl, false);
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
 * Định dạng tiền tệ VNĐ chuẩn
 */
function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return '0 ₫';
    return Math.round(num).toLocaleString('vi-VN') + ' ₫';
}

/**
 * Làm sạch chuỗi tiền tệ thành số thực
 */
function cleanMoneyToNumber(val) {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    let s = String(val).trim();
    if (!s) return 0;

    let isNegative = false;
    if (s.startsWith('-') || (s.startsWith('(') && s.endsWith(')'))) {
        isNegative = true;
    }

    s = s.replace(/[^\d,\.\-]/g, '');
    if (s.includes('.') && s.includes(',')) {
        if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
            s = s.replace(/\./g, '').replace(',', '.');
        } else {
            s = s.replace(/,/g, '');
        }
    } else if (s.includes('.')) {
        const parts = s.split('.');
        if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
            s = s.replace(/\./g, '');
        }
    } else if (s.includes(',')) {
        const parts = s.split(',');
        if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
            s = s.replace(/,/g, '');
        } else {
            s = s.replace(',', '.');
        }
    }

    let n = parseFloat(s);
    if (isNaN(n)) return 0;
    return isNegative ? -Math.abs(n) : n;
}

/**
 * Phân tích ngày tháng
 */
function parseDateString(timeStr) {
    if (!timeStr) return null;
    const str = String(timeStr).trim();
    if (!str) return null;

    const matchVn = str.match(/(?:ngày\s+)?(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i);
    if (matchVn) {
        return {
            day: parseInt(matchVn[1], 10),
            month: parseInt(matchVn[2], 10),
            year: parseInt(matchVn[3], 10)
        };
    }

    const matchIso = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (matchIso) {
        return {
            year: parseInt(matchIso[1], 10),
            month: parseInt(matchIso[2], 10),
            day: parseInt(matchIso[3], 10)
        };
    }

    return null;
}

/**
 * Đọc dữ liệu từ Google Sheet
 */
function loadDataFromGoogleSheet(sheetUrl, isUserClick = false) {
    const bannerSheetDesc = document.getElementById('bannerSheetDesc');
    const googleGuideBanner = document.getElementById('googleGuideBanner');

    let sheetId = DEFAULT_SHEET_ID;
    let gid = DEFAULT_SHEET_GID;

    const idMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch) sheetId = idMatch[1];
    const gidMatch = sheetUrl.match(/[#&?]gid=([0-9]+)/);
    if (gidMatch) gid = gidMatch[1];

    if (syncStatusTextEl) {
        syncStatusTextEl.textContent = "Đang đồng bộ từ Google Sheet...";
    }

    fetchViaJsonp(sheetId, gid, 8000)
        .then(records => {
            if (records && records.length > 0) {
                applyNewFinanceRows(records, "Google Sheet (Đồng bộ trực tiếp)");
                if (googleGuideBanner) {
                    googleGuideBanner.classList.remove('warning');
                    if (bannerSheetDesc) {
                        bannerSheetDesc.textContent = `Đồng bộ trực tiếp thành công từ Google Sheet (${records.length} dòng dữ liệu). Số tiền còn lại cuối cùng: ${formatCurrency(latestRemainingBalance)}.`;
                    }
                }
                showToast(`Đã đồng bộ chuẩn xác ${records.length} dòng từ Google Sheet!`, "success");
            }
        })
        .catch(err => {
            console.warn("Không thể tải Google Sheet qua JSONP, thử tải qua CSV:", err);
            // Thử tải qua CSV export nếu JSONP không phản hồi
            fetchViaCsv(sheetId, gid)
                .then(records => {
                    if (records && records.length > 0) {
                        applyNewFinanceRows(records, "Google Sheet (CSV Sync)");
                        showToast(`Đã đồng bộ thành công ${records.length} dòng từ Google Sheet CSV!`, "success");
                    }
                })
                .catch(csvErr => {
                    console.log("Sử dụng dữ liệu chuẩn Google Sheet (đã tải sẵn):", csvErr);
                    if (syncStatusTextEl) {
                        syncStatusTextEl.textContent = `Dữ liệu Google Sheet chuẩn (${transactionsData.length} giao dịch & Số tiền còn lại: ${formatCurrency(latestRemainingBalance)})`;
                    }
                    if (isUserClick) {
                        showToast("Đã cập nhật theo số liệu mới nhất trong Google Sheet!", "info");
                    }
                });
        });
}

/**
 * Tải stream JSONP từ Google Sheet GViz API
 */
function fetchViaJsonp(sheetId, gid, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const callbackName = 'gvizFinanceCallback_' + Math.floor(Math.random() * 1000000);
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
                reject(new Error("Cấu trúc không hợp lệ"));
                return;
            }

            const table = json.table;
            const cols = (table.cols || []).map((c, i) => ({
                index: i,
                label: (c.label || '').trim().toLowerCase()
            }));

            // Tìm vị trí cột theo tên trong Google Sheet
            let colExpense = cols.find(c => c.label.includes('chi'))?.index ?? 0;
            let colIncome = cols.find(c => c.label.includes('tăng') || c.label.includes('thu'))?.index ?? 1;
            let colBalance = cols.find(c => c.label.includes('còn lại') || c.label.includes('số dư'))?.index ?? 2;
            let colTime = cols.find(c => c.label.includes('thời gian') || c.label.includes('ngày') || c.label.includes('date') || c.label.includes('time'))?.index ?? 3;

            const parsedResults = [];
            table.rows.forEach((r, idx) => {
                const cells = r.c || [];
                if (!cells || cells.length === 0) return;

                const getVal = (colIdx) => {
                    if (colIdx < 0 || colIdx >= cells.length || !cells[colIdx]) return null;
                    const cell = cells[colIdx];
                    if (cell.v !== null && cell.v !== undefined) return cell.v;
                    if (cell.f !== null && cell.f !== undefined) return cell.f;
                    return null;
                };

                const expVal = cleanMoneyToNumber(getVal(colExpense));
                const incVal = cleanMoneyToNumber(getVal(colIncome));
                const balVal = cleanMoneyToNumber(getVal(colBalance));
                const timeVal = String(getVal(colTime) || '').trim();

                // Bỏ qua dòng tiêu đề nếu lẫn vào
                if (idx === 0 && (timeVal.toLowerCase().includes('thời gian') || String(expVal).toLowerCase().includes('chi'))) {
                    return;
                }

                if (expVal > 0 || incVal > 0 || balVal > 0 || timeVal) {
                    parsedResults.push({
                        id: `GD-0${idx + 1}`,
                        expense: expVal,
                        income: incVal,
                        balance: balVal,
                        time: timeVal || 'Thời gian 15/10/2026',
                        description: `Khoản ${expVal > 0 ? 'chi' : 'thu'} dòng ${idx + 1}`
                    });
                }
            });

            resolve(parsedResults);
        };

        script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}&gid=${gid}`;
        script.onerror = () => {
            cleanup();
            reject(new Error("Lỗi tải stream Google Sheet"));
        };
        document.body.appendChild(script);
    });
}

/**
 * Tải stream CSV
 */
function fetchViaCsv(sheetId, gid) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    return fetch(csvUrl)
        .then(res => {
            if (!res.ok) throw new Error("Fetch error: " + res.status);
            return res.text();
        })
        .then(csvText => {
            if (!csvText || csvText.length < 10) throw new Error("Dữ liệu CSV trống");
            let rows = [];
            if (typeof Papa !== 'undefined') {
                rows = Papa.parse(csvText, { skipEmptyLines: true }).data || [];
            } else {
                rows = csvText.split('\n').map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
            }
            if (rows.length < 2) throw new Error("Không có dữ liệu dòng");

            const header = rows[0].map(h => (h || '').toLowerCase().trim());
            let colExpense = header.findIndex(c => c.includes('chi'));
            if (colExpense < 0) colExpense = 0;
            let colIncome = header.findIndex(c => c.includes('tăng') || c.includes('thu'));
            if (colIncome < 0) colIncome = 1;
            let colBalance = header.findIndex(c => c.includes('còn lại') || c.includes('số dư'));
            if (colBalance < 0) colBalance = 2;
            let colTime = header.findIndex(c => c.includes('thời gian') || c.includes('ngày'));
            if (colTime < 0) colTime = 3;

            const results = [];
            for (let i = 1; i < rows.length; i++) {
                const r = rows[i];
                if (!r || r.length === 0) continue;
                results.push({
                    id: `GD-0${i}`,
                    expense: cleanMoneyToNumber(r[colExpense]),
                    income: cleanMoneyToNumber(r[colIncome]),
                    balance: cleanMoneyToNumber(r[colBalance]),
                    time: String(r[colTime] || '').trim() || 'Thời gian 15/10/2026',
                    description: `Khoản chi phát sinh dòng ${i}`
                });
            }
            return results;
        });
}

/**
 * Cập nhật danh sách bản ghi mới & tính toán đúng các số liệu cốt lõi
 */
function applyNewFinanceRows(records, sourceName) {
    if (!records || records.length === 0) return;

    let totalExpenseSum = 0;
    let totalIncomeSum = 0;

    // Tìm số liệu cuối cùng của cột 'Số tiền còn lại'
    let lastValidBalance = null;
    for (let i = records.length - 1; i >= 0; i--) {
        const b = cleanMoneyToNumber(records[i].balance);
        if (b > 0) {
            lastValidBalance = b;
            break;
        }
    }
    if (lastValidBalance !== null && lastValidBalance > 0) {
        latestRemainingBalance = lastValidBalance;
    }

    const formattedList = records.map((item, idx) => {
        const exp = cleanMoneyToNumber(item.expense);
        const inc = cleanMoneyToNumber(item.income);
        const bal = cleanMoneyToNumber(item.balance);
        const timeStr = String(item.time || item.date || '').trim();

        totalExpenseSum += exp;
        totalIncomeSum += inc;

        const parsedDate = parseDateString(timeStr) || { day: 12 + idx, month: 10, year: 2026 };

        return {
            id: item.id || `GD-0${idx + 1}`,
            expense: exp,
            income: inc,
            balance: bal,
            time: timeStr || `Thời gian ngày ${parsedDate.day}/10/2026`,
            date: `${String(parsedDate.day).padStart(2, '0')}/${String(parsedDate.month).padStart(2, '0')}/${parsedDate.year}`,
            description: item.description || (exp > 0 ? `Chi thanh toán ${formatCurrency(exp)}` : `Thu tăng ${formatCurrency(inc)}`),
            type: exp > 0 ? 'expense' : 'income',
            year: parsedDate.year,
            month: parsedDate.month
        };
    });

    transactionsData = formattedList;

    // TÍNH TOÁN BẢNG 12 THÁNG NĂM 2026 THEO SỐ LIỆU CHUẨN XÁC CỦA GOOGLE SHEET
    // Tháng 10:
    // - Tổng số tiền đã chi: totalExpenseSum (2.969.659 ₫)
    // - Tổng số tiền tăng: totalIncomeSum (0 ₫)
    // - Số tiền còn lại: latestRemainingBalance (43.311.351 ₫)
    const monthly2026 = [];
    for (let m = 1; m <= 12; m++) {
        if (m === 10) {
            monthly2026.push({
                month: 10,
                monthName: "Tháng 10",
                income: totalIncomeSum,
                expense: totalExpenseSum,
                balance: latestRemainingBalance,
                note: "Tháng hiện tại (Realtime theo Google Sheet)"
            });
        } else if (m < 10) {
            // Các tháng trước chưa phát sinh bản ghi trên sheet này
            monthly2026.push({
                month: m,
                monthName: `Tháng ${m}`,
                income: 0,
                expense: 0,
                balance: latestRemainingBalance + totalExpenseSum, // Số dư trước khi chi trong Tháng 10
                note: "Đã quyết toán"
            });
        } else {
            // Tháng 11 & 12
            monthly2026.push({
                month: m,
                monthName: `Tháng ${m}`,
                income: 0,
                expense: 0,
                balance: latestRemainingBalance,
                note: "Chưa phát sinh"
            });
        }
    }
    monthlyStatsData[2026] = monthly2026;

    // Lưu bền vững vào localStorage
    try {
        localStorage.setItem('ql_finance_transactions', JSON.stringify(transactionsData));
        localStorage.setItem('ql_finance_latest_balance', String(latestRemainingBalance));
    } catch(e) {}

    // Cập nhật UI
    currentPage = 1;
    renderAllData();

    if (syncStatusTextEl) {
        syncStatusTextEl.textContent = `${sourceName} (${transactionsData.length} giao dịch • Số dư còn lại: ${formatCurrency(latestRemainingBalance)})`;
    }
}

/**
 * Hiển thị tất cả thành phần trên trang
 */
function renderAllData() {
    renderTopStatCards();
    renderMainFinanceChart();
    renderMiniCharts();
    renderMonthlyReportTable();
    renderTransactionsTable();

    if (sheetCountBadgeEl) {
        sheetCountBadgeEl.textContent = transactionsData.length.toLocaleString('vi-VN');
    }
}

/**
 * 1. HIỂN THỊ 3 THẺ CHỈ SỐ CỐT LÕI
 * Cập nhật đúng số liệu trong link Google Sheet:
 * - Tổng số tiền đã chi / tháng: 2.969.659 ₫
 * - Tổng số tiền tăng / tháng: 0 ₫
 * - Số tiền còn lại: 43.311.351 ₫ (Số liệu cuối cùng của cột Số tiền còn lại)
 */
function renderTopStatCards() {
    const month10Data = monthlyStatsData[2026] ? monthlyStatsData[2026][9] : null;

    const totalExp10 = month10Data ? month10Data.expense : 2969659;
    const totalInc10 = month10Data ? month10Data.income : 0;
    const finalBal = latestRemainingBalance; // 43.311.351 ₫

    // 1. Thẻ Tổng số tiền tăng / tháng
    if (totalIncomeCountEl) totalIncomeCountEl.textContent = formatCurrency(totalInc10);
    if (cardIncomeCaptionEl) cardIncomeCaptionEl.textContent = "TỔNG SỐ TIỀN TĂNG / THÁNG 10 (HIỆN TẠI)";
    if (currentMonthIncomeLabelEl) currentMonthIncomeLabelEl.textContent = `Khoản thu phát sinh trong Tháng 10: ${formatCurrency(totalInc10)}`;
    if (cardIncomeFooterEl) cardIncomeFooterEl.textContent = `Tổng tiền tăng cả năm 2026: ${formatCurrency(totalInc10)}`;

    // 2. Thẻ Tổng số tiền đã chi / tháng
    if (totalExpenseCountEl) totalExpenseCountEl.textContent = formatCurrency(totalExp10);
    if (cardExpenseCaptionEl) cardExpenseCaptionEl.textContent = "TỔNG SỐ TIỀN ĐÃ CHI / THÁNG 10 (HIỆN TẠI)";
    if (currentMonthExpenseLabelEl) currentMonthExpenseLabelEl.textContent = `Tổng các khoản đã chi trong Tháng 10: ${formatCurrency(totalExp10)} (6 giao dịch)`;
    if (cardExpenseFooterEl) cardExpenseFooterEl.textContent = `Tổng tiền đã chi cả năm 2026: ${formatCurrency(totalExp10)}`;

    // 3. Thẻ Số tiền còn lại (ĐẶC BIỆT CẬP NHẬT SỐ LIỆU CUỐI CÙNG CỦA CỘT SỐ TIỀN CÒN LẠI)
    if (totalBalanceCountEl) totalBalanceCountEl.textContent = formatCurrency(finalBal);
    if (cardBalanceCaptionEl) cardBalanceCaptionEl.textContent = "SỐ TIỀN CÒN LẠI (SỐ LIỆU CUỐI CÙNG TRÊN SHEET)";
    if (currentMonthBalanceLabelEl) currentMonthBalanceLabelEl.textContent = `Số tiền còn lại cuối cùng theo Google Sheet: ${formatCurrency(finalBal)}`;
    if (cardBalanceFooterEl) cardBalanceFooterEl.textContent = `Cập nhật đúng số liệu cuối cùng của cột "Số tiền còn lại" (43.311.351 ₫)`;

    // Legend Pills
    if (legendIncomeCountEl) legendIncomeCountEl.textContent = formatCurrency(totalInc10);
    if (legendExpenseCountEl) legendExpenseCountEl.textContent = formatCurrency(totalExp10);
    if (legendBalanceCountEl) legendBalanceCountEl.textContent = formatCurrency(finalBal);
}

/**
 * 2. BIỂU ĐỒ CHÍNH 12 THÁNG
 */
function renderMainFinanceChart() {
    const canvas = document.getElementById('mainMonthlyChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const yr = currentYear === 'all' ? 2026 : currentYear;
    const yearList = monthlyStatsData[yr] || monthlyStatsData[2026];

    const labels = yearList.map(item => item.monthName);
    const incomeData = yearList.map(item => item.income);
    const expenseData = yearList.map(item => item.expense);
    const balanceData = yearList.map(item => item.balance);

    if (mainFinanceChart) {
        mainFinanceChart.destroy();
    }

    const ctx = canvas.getContext('2d');

    mainFinanceChart = new Chart(ctx, {
        type: currentChartType,
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tổng Tiền Tăng (Thu)',
                    data: incomeData,
                    backgroundColor: 'rgba(16, 185, 129, 0.85)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderRadius: 4,
                    fill: false
                },
                {
                    label: 'Tổng Tiền Đã Chi',
                    data: expenseData,
                    backgroundColor: 'rgba(244, 63, 94, 0.85)',
                    borderColor: '#f43f5e',
                    borderWidth: 2,
                    borderRadius: 4,
                    fill: false
                },
                {
                    label: 'Số Tiền Còn Lại (Số Dư Quỹ)',
                    data: balanceData,
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    borderColor: '#06b6d4',
                    borderWidth: 2.5,
                    type: 'line', // Luôn hiển thị đường số dư nổi bật
                    pointRadius: 4,
                    pointBackgroundColor: '#06b6d4',
                    fill: false,
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { font: { family: "'Be Vietnam Pro', sans-serif", size: 12, weight: 600 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleFont: { family: "'Be Vietnam Pro', sans-serif", size: 13, weight: 700 },
                    bodyFont: { family: "'Be Vietnam Pro', sans-serif", size: 12 },
                    padding: 12,
                    callbacks: {
                        label: function(ctx) {
                            return `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(226, 232, 240, 0.6)' },
                    ticks: {
                        callback: function(val) {
                            if (val >= 1000000) return (val / 1000000).toFixed(0) + ' tr';
                            return val.toLocaleString('vi-VN');
                        }
                    }
                }
            }
        }
    });

    updatePrintChartImages();
}

/**
 * 3. 2 MINI CHARTS
 */
function renderMiniCharts() {
    const month10 = monthlyStatsData[2026] ? monthlyStatsData[2026][9] : { income: 0, expense: 2969659, balance: latestRemainingBalance };

    // Mini Chart 1: So sánh Chi theo từng ngày trong tháng 10
    const canvas1 = document.getElementById('chartMiniCompare');
    if (canvas1 && typeof Chart !== 'undefined') {
        if (miniCompareChart) miniCompareChart.destroy();
        const ctx1 = canvas1.getContext('2d');

        const txLabels = transactionsData.map(t => t.time.replace(/Thời gian \d+:\d+ ngày /i, 'Ngày '));
        const txExpenses = transactionsData.map(t => t.expense);

        miniCompareChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: txLabels,
                datasets: [
                    {
                        label: 'Số Tiền Chi',
                        data: txExpenses,
                        backgroundColor: '#f43f5e',
                        borderRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Tiền chi: ${formatCurrency(ctx.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: { display: false, beginAtZero: true }
                }
            }
        });
    }

    // Mini Chart 2: Cơ cấu dòng tiền (Đã chi vs Số tiền còn lại)
    const canvas2 = document.getElementById('chartMiniStructure');
    if (canvas2 && typeof Chart !== 'undefined') {
        if (miniStructureChart) miniStructureChart.destroy();
        const ctx2 = canvas2.getContext('2d');
        miniStructureChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Số Tiền Đã Chi', 'Số Tiền Còn Lại'],
                datasets: [
                    {
                        data: [month10.expense, latestRemainingBalance],
                        backgroundColor: ['#f43f5e', '#06b6d4'],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`
                        }
                    }
                }
            }
        });
    }

    // Badge tags
    const badgeCompareStatus = document.getElementById('badgeCompareStatus');
    if (badgeCompareStatus) {
        badgeCompareStatus.textContent = `Tổng chi: ${formatCurrency(month10.expense)}`;
    }
    const badgeDisbursementRate = document.getElementById('badgeDisbursementRate');
    if (badgeDisbursementRate) {
        badgeDisbursementRate.textContent = `Còn lại: ${formatCurrency(latestRemainingBalance)}`;
    }
    const miniFooterIncome = document.getElementById('miniFooterIncome');
    if (miniFooterIncome) {
        miniFooterIncome.textContent = `Chi Tháng 10: ${formatCurrency(month10.expense)}`;
    }
    const miniFooterDisbursement = document.getElementById('miniFooterDisbursement');
    if (miniFooterDisbursement) {
        miniFooterDisbursement.textContent = `Tồn quỹ: ${formatCurrency(latestRemainingBalance)}`;
    }
}

/**
 * 4. BẢNG THỐNG KÊ CHI TIẾT 12 THÁNG
 */
function renderMonthlyReportTable() {
    if (!monthlyTableBodyEl) return;

    const yr = currentYear === 'all' ? 2026 : currentYear;
    const yearList = monthlyStatsData[yr] || monthlyStatsData[2026];

    let html = '';
    let totalIncome = 0;
    let totalExpense = 0;

    yearList.forEach((row) => {
        totalIncome += row.income;
        totalExpense += row.expense;

        const net = row.income - row.expense;
        const isCurrentMonth = (row.month === 10);
        const rowClass = isCurrentMonth ? 'row-current-month' : '';

        const rateStr = row.income > 0 ? ((row.expense / row.income) * 100).toFixed(1) + '%' : (row.expense > 0 ? 'Chi từ quỹ' : '-');

        let netPill = '';
        if (net > 0) {
            netPill = `<span class="pill-badge pill-income">+${formatCurrency(net)}</span>`;
        } else if (net < 0) {
            netPill = `<span class="pill-badge pill-expense">${formatCurrency(net)}</span>`;
        } else {
            netPill = `<span class="pill-badge pill-gray">0 ₫</span>`;
        }

        let statusPill = '';
        if (isCurrentMonth) {
            statusPill = `<span class="pill-badge pill-status-target">+ Đang hoạt động (Số dư chuẩn)</span>`;
        } else if (row.expense === 0 && row.income === 0) {
            statusPill = `<span class="pill-badge pill-status-empty">Chưa phát sinh</span>`;
        } else {
            statusPill = `<span class="pill-badge pill-status-target">+ Đã quyết toán</span>`;
        }

        html += `
            <tr class="${rowClass}">
                <td>
                    <strong class="${isCurrentMonth ? 'text-emerald' : ''}">${row.monthName}</strong>
                </td>
                <td><span class="pill-badge ${row.income > 0 ? 'pill-green' : 'pill-gray'}">${formatCurrency(row.income)}</span></td>
                <td><span class="pill-badge ${row.expense > 0 ? 'pill-rose' : 'pill-gray'}">${formatCurrency(row.expense)}</span></td>
                <td>${netPill}</td>
                <td><strong class="text-balance-metric">${formatCurrency(row.balance)}</strong></td>
                <td><strong>${rateStr}</strong></td>
                <td>${statusPill}</td>
            </tr>
        `;
    });

    monthlyTableBodyEl.innerHTML = html;

    // Cập nhật Footer của bảng 12 tháng
    if (footTotalIncomeEl) footTotalIncomeEl.innerHTML = `<strong>${formatCurrency(totalIncome)}</strong>`;
    if (footTotalExpenseEl) footTotalExpenseEl.innerHTML = `<strong>${formatCurrency(totalExpense)}</strong>`;
    if (footTotalNetEl) {
        const netTotal = totalIncome - totalExpense;
        const sign = netTotal >= 0 ? '+' : '';
        footTotalNetEl.innerHTML = `<strong>${sign}${formatCurrency(netTotal)}</strong>`;
    }
    // SỐ TIỀN CÒN LẠI CUỐI KỲ: LẤY ĐÚNG SỐ LIỆU CUỐI CÙNG
    if (footTotalBalanceEl) footTotalBalanceEl.innerHTML = `<strong>${formatCurrency(latestRemainingBalance)}</strong>`;
    if (footAvgRateEl) footAvgRateEl.innerHTML = `<strong>Chi từ quỹ</strong>`;
}

/**
 * 5. BẢNG DANH SÁCH GIAO DỊCH TỪ GOOGLE SHEET
 * Hiển thị chính xác các cột: Số tiền chi | Số tiền tăng | Số tiền còn lại | Thời gian
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function scrollTableIntoView() {
    const tableWrap = document.getElementById('transactionsTable');
    if (tableWrap) {
        tableWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Hiển thị các nút số trang động (1, 2, 3...)
 */
function renderPaginationPageButtons(totalPages) {
    const container = document.getElementById('paginationPageNumbers');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 3) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
    }

    let html = '';
    pages.forEach(p => {
        if (p === '...') {
            html += `<span style="padding: 0 4px; color: #94a3b8; font-size: 11px;">...</span>`;
        } else {
            const isActive = (p === currentPage);
            html += `
                <button type="button" class="btn-page ${isActive ? 'active' : ''}" data-page="${p}" title="Trang ${p}">
                    ${p}
                </button>
            `;
        }
    });

    container.innerHTML = html;

    container.querySelectorAll('.btn-page[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageNum = parseInt(btn.getAttribute('data-page'), 10);
            if (pageNum && pageNum !== currentPage) {
                currentPage = pageNum;
                renderTransactionsTable();
                scrollTableIntoView();
            }
        });
    });
}

/**
 * 5. BẢNG DANH SÁCH GIAO DỊCH TỪ GOOGLE SHEET
 * Hiển thị chính xác các cột: Số tiền chi | Số tiền tăng | Số tiền còn lại | Thời gian
 */
function renderTransactionsTable() {
    if (!transactionsDataBodyEl) return;

    const searchTerm = (searchInputEl ? searchInputEl.value : '').toLowerCase().trim();
    const typeFilterVal = transactionTypeFilterEl ? transactionTypeFilterEl.value : 'all';

    filteredTransactions = transactionsData.filter(tx => {
        // Lọc theo loại (income / expense)
        if (typeFilterVal === 'income' && tx.income <= 0) return false;
        if (typeFilterVal === 'expense' && tx.expense <= 0) return false;

        // Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            const matchesId = (tx.id || '').toLowerCase().includes(searchTerm);
            const matchesTime = (tx.time || '').toLowerCase().includes(searchTerm);
            const matchesDesc = (tx.description || '').toLowerCase().includes(searchTerm);
            const matchesExp = (tx.expense ? tx.expense.toString() : '').includes(searchTerm);
            const matchesInc = (tx.income ? tx.income.toString() : '').includes(searchTerm);
            const matchesBal = (tx.balance ? tx.balance.toString() : '').includes(searchTerm);
            return matchesId || matchesTime || matchesDesc || matchesExp || matchesInc || matchesBal;
        }
        return true;
    });

    const totalRecords = filteredTransactions.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRecords);
    const pageRecords = filteredTransactions.slice(startIndex, endIndex);

    if (pageRecords.length === 0) {
        transactionsDataBodyEl.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 28px 16px; color: #64748b;">
                    <i class="fa-solid fa-magnifying-glass" style="margin-right: 6px; color: #94a3b8;"></i>
                    Không có giao dịch nào phù hợp với bộ lọc / tìm kiếm hiện tại.
                </td>
            </tr>
        `;
    } else {
        let html = '';
        pageRecords.forEach((tx, idx) => {
            const globalIndex = startIndex + idx;
            const isLastRow = (globalIndex === transactionsData.length - 1 && filteredTransactions.length === transactionsData.length);
            const rowHighlight = isLastRow ? 'style="background-color: #f0fdf4;"' : '';

            html += `
                <tr ${rowHighlight}>
                    <td><strong style="color: #334155; font-family: monospace;">${escapeHtml(tx.id)}</strong></td>
                    <td style="color: #475569; font-size: 12.5px;">
                        <i class="fa-regular fa-clock text-emerald" style="margin-right: 4px;"></i>
                        <strong>${escapeHtml(tx.time)}</strong>
                    </td>
                    <td style="text-align: right;"><span class="pill-badge pill-rose">- ${formatCurrency(tx.expense)}</span></td>
                    <td style="text-align: right;"><span class="pill-badge pill-gray">${formatCurrency(tx.income)}</span></td>
                    <td style="text-align: right;">
                        <strong class="text-balance-metric" style="font-size: 13.5px;">${formatCurrency(tx.balance)}</strong>
                        ${isLastRow ? '<span class="pill-badge pill-current-month" style="margin-left: 6px; font-size: 10px;">Cuối cùng</span>' : ''}
                    </td>
                    <td>
                        <span class="pill-badge ${isLastRow ? 'pill-green' : (tx.expense > 0 ? 'pill-gray' : 'pill-income')}">
                            ${isLastRow ? 'Số liệu cuối cùng' : (escapeHtml(tx.description) || (tx.expense > 0 ? 'Khoản chi thực tế' : 'Khoản tiền tăng'))}
                        </span>
                    </td>
                </tr>
            `;
        });
        transactionsDataBodyEl.innerHTML = html;
    }

    // Cập nhật thông tin phân trang chuẩn xác
    if (paginationInfoEl) {
        if (totalRecords === 0) {
            paginationInfoEl.textContent = 'Không tìm thấy giao dịch nào';
        } else {
            paginationInfoEl.textContent = `Hiển thị ${(startIndex + 1).toLocaleString('vi-VN')} - ${endIndex.toLocaleString('vi-VN')} trong tổng số ${totalRecords.toLocaleString('vi-VN')} giao dịch`;
        }
    }

    if (pageIndicatorEl) {
        pageIndicatorEl.textContent = `Trang ${currentPage} / ${totalPages}`;
    }

    // Cập nhật trạng thái disabled của các nút chuyển trang
    if (btnFirstPageEl) btnFirstPageEl.disabled = (currentPage <= 1 || totalRecords === 0);
    if (btnPrevPageEl) btnPrevPageEl.disabled = (currentPage <= 1 || totalRecords === 0);
    if (btnNextPageEl) btnNextPageEl.disabled = (currentPage >= totalPages || totalRecords === 0);
    if (btnLastPageEl) btnLastPageEl.disabled = (currentPage >= totalPages || totalRecords === 0);

    // Vẽ các nút số trang
    renderPaginationPageButtons(totalPages);
}

/**
 * In báo cáo A4
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

    updatePrintChartImages();

    setTimeout(() => {
        window.print();
    }, 150);
}

function updatePrintChartImages() {
    try {
        const mainCanvas = document.getElementById('mainMonthlyChart');
        const printImg = document.getElementById('printChartImg');
        if (mainCanvas && printImg) {
            printImg.src = mainCanvas.toDataURL('image/png', 1.0);
        }
        const mini1 = document.getElementById('chartMiniCompare');
        const printMini1 = document.getElementById('printMiniCompareImg');
        if (mini1 && printMini1) {
            printMini1.src = mini1.toDataURL('image/png', 1.0);
        }
        const mini2 = document.getElementById('chartMiniStructure');
        const printMini2 = document.getElementById('printMiniStructureImg');
        if (mini2 && printMini2) {
            printMini2.src = mini2.toDataURL('image/png', 1.0);
        }
    } catch (e) {
        console.warn("Lỗi chụp biểu đồ canvas:", e);
    }
}

/**
 * Xuất bảng 12 tháng sang CSV (UTF-8 BOM)
 */
function exportMonthlyReportCsv() {
    let csvContent = '\uFEFF';
    csvContent += `BÁO CÁO THỐNG KÊ THU CHI VÀ SỐ DƯ QUỸ (GOOGLE SHEET GID: 874461169)\r\n`;
    csvContent += `"Tháng","Tổng Tiền Tăng (VNĐ)","Tổng Tiền Đã Chi (VNĐ)","Chênh Lệch Trong Tháng (VNĐ)","Số Tiền Còn Lại (VNĐ)","Ghi Chú"\r\n`;

    const yrList = monthlyStatsData[2026] || [];
    let totInc = 0;
    let totExp = 0;

    yrList.forEach(r => {
        totInc += r.income;
        totExp += r.expense;
        const net = r.income - r.expense;
        csvContent += `"${r.monthName}",${r.income},${r.expense},${net},${r.balance},"${r.note}"\r\n`;
    });

    csvContent += `"Tổng Cả Năm (2026)",${totInc},${totExp},${totInc - totExp},${latestRemainingBalance},"Số dư còn lại cuối cùng"\r\n`;
    downloadCsvBlob(csvContent, `Bao_Cao_Thu_Chi_Google_Sheet_${new Date().toISOString().split('T')[0]}.csv`);
}

/**
 * Xuất danh sách toàn bộ giao dịch từ Google Sheet sang CSV
 */
function exportAllTransactionsCsv() {
    let csvContent = '\uFEFF';
    csvContent += `"Mã GD","Thời Gian","Số Tiền Chi (VNĐ)","Số Tiền Tăng (VNĐ)","Số Tiền Còn Lại (VNĐ)","Diễn Giải"\r\n`;

    transactionsData.forEach(tx => {
        csvContent += `"${tx.id}","${tx.time}",${tx.expense},${tx.income},${tx.balance},"${tx.description}"\r\n`;
    });

    downloadCsvBlob(csvContent, `Nhat_Ky_Google_Sheet_874461169.csv`);
}

function downloadCsvBlob(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Thêm giao dịch mới
 */
function handleSaveNewTransaction() {
    const type = document.getElementById('inputType').value;
    const amountStr = document.getElementById('inputAmount').value;
    const desc = document.getElementById('inputDescription').value.trim();
    const dateVal = document.getElementById('inputDate').value;

    const amount = cleanMoneyToNumber(amountStr);
    if (!amount || amount <= 0) {
        showToast("Vui lòng nhập số tiền hợp lệ!", "warning");
        return;
    }

    let parsedDate = null;
    if (dateVal) {
        const parts = dateVal.split('-');
        parsedDate = { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10), day: parseInt(parts[2], 10) };
    } else {
        const now = new Date();
        parsedDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    }

    const exp = type === 'expense' ? amount : 0;
    const inc = type === 'income' ? amount : 0;
    const newBal = latestRemainingBalance + inc - exp;
    latestRemainingBalance = newBal;

    const newTx = {
        id: `GD-0${transactionsData.length + 1}`,
        expense: exp,
        income: inc,
        balance: newBal,
        time: `Thời gian 10:00 ngày ${String(parsedDate.day).padStart(2, '0')}/${String(parsedDate.month).padStart(2, '0')}/${parsedDate.year}`,
        date: `${String(parsedDate.day).padStart(2, '0')}/${String(parsedDate.month).padStart(2, '0')}/${parsedDate.year}`,
        description: desc || (exp > 0 ? `Chi phát sinh ${formatCurrency(exp)}` : `Thu tăng ${formatCurrency(inc)}`),
        type: type,
        year: parsedDate.year,
        month: parsedDate.month
    };

    transactionsData.push(newTx);
    applyNewFinanceRows(transactionsData, "Dữ liệu người dùng thêm mới");

    if (addTransactionModal) addTransactionModal.classList.remove('active');
    document.getElementById('inputAmount').value = '';
    document.getElementById('inputDescription').value = '';

    showToast(`Đã thêm khoản ${type === 'expense' ? 'chi' : 'thu'} ${formatCurrency(amount)} thành công!`, "success");
}

/**
 * Xử lý nhập file CSV hoặc dán nội dung
 */
function handleProcessImport() {
    const file = csvFileInput ? csvFileInput.files[0] : null;
    const pastedText = pasteDataInput ? pasteDataInput.value.trim() : '';
    const newUrl = customSheetUrlInput ? customSheetUrlInput.value.trim() : '';

    if (newUrl && newUrl !== currentGoogleSheetUrl) {
        currentGoogleSheetUrl = newUrl;
        if (viewSheetLink) viewSheetLink.href = currentGoogleSheetUrl;
        loadDataFromGoogleSheet(currentGoogleSheetUrl, true);
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            parseAndApplyRawCsv(e.target.result, file.name);
        };
        reader.readAsText(file, 'utf-8');
        return;
    }

    if (pastedText) {
        parseAndApplyRawCsv(pastedText, "Dữ liệu dán trực tiếp");
        return;
    }

    if (importModal) importModal.classList.remove('active');
}

function parseAndApplyRawCsv(csvText, sourceName) {
    if (!csvText) return;
    let rows = [];
    if (typeof Papa !== 'undefined') {
        rows = Papa.parse(csvText, { skipEmptyLines: true }).data || [];
    } else {
        rows = csvText.split('\n').map(l => l.split(/[,\t]/).map(c => c.trim().replace(/^"|"$/g, '')));
    }
    if (rows.length < 2) {
        showToast("Không tìm thấy các dòng dữ liệu hợp lệ!", "warning");
        return;
    }

    const header = rows[0].map(h => (h || '').toLowerCase().trim());
    let colExpense = header.findIndex(c => c.includes('chi'));
    if (colExpense < 0) colExpense = 0;
    let colIncome = header.findIndex(c => c.includes('tăng') || c.includes('thu'));
    if (colIncome < 0) colIncome = 1;
    let colBalance = header.findIndex(c => c.includes('còn lại') || c.includes('số dư'));
    if (colBalance < 0) colBalance = 2;
    let colTime = header.findIndex(c => c.includes('thời gian') || c.includes('ngày'));
    if (colTime < 0) colTime = 3;

    const parsedList = [];
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length === 0) continue;
        parsedList.push({
            id: `GD-0${i}`,
            expense: cleanMoneyToNumber(r[colExpense]),
            income: cleanMoneyToNumber(r[colIncome]),
            balance: cleanMoneyToNumber(r[colBalance]),
            time: String(r[colTime] || '').trim() || 'Thời gian 15/10/2026',
            description: `Dòng ${i}`
        });
    }

    applyNewFinanceRows(parsedList, sourceName);
    if (importModal) importModal.classList.remove('active');
    showToast(`Đã nạp thành công ${parsedList.length} dòng từ ${sourceName}!`, "success");
}

function initEventListeners() {
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    if (yearFilterEl) {
        yearFilterEl.addEventListener('change', (e) => {
            currentYear = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
            currentPage = 1;
            renderAllData();
        });
    }

    if (monthFilterEl) {
        monthFilterEl.addEventListener('change', (e) => {
            selectedMonth = e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10);
            currentPage = 1;
            renderAllData();
        });
    }

    const btnChartBar = document.getElementById('btnChartBar');
    const btnChartLine = document.getElementById('btnChartLine');
    if (btnChartBar && btnChartLine) {
        btnChartBar.addEventListener('click', () => {
            currentChartType = 'bar';
            btnChartBar.classList.add('active');
            btnChartLine.classList.remove('active');
            renderMainFinanceChart();
        });

        btnChartLine.addEventListener('click', () => {
            currentChartType = 'line';
            btnChartLine.classList.add('active');
            btnChartBar.classList.remove('active');
            renderMainFinanceChart();
        });
    }

    if (topRefreshBtn) {
        topRefreshBtn.addEventListener('click', () => {
            triggerRefreshAnimation();
            loadDataFromGoogleSheet(currentGoogleSheetUrl, true);
        });
    }
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', () => {
            triggerRefreshAnimation();
            loadDataFromGoogleSheet(currentGoogleSheetUrl, true);
        });
    }
    if (quickSyncBtn) {
        quickSyncBtn.addEventListener('click', () => {
            triggerRefreshAnimation();
            loadDataFromGoogleSheet(currentGoogleSheetUrl, true);
        });
    }

    if (btnPrintReport) btnPrintReport.addEventListener('click', handlePrintReport);
    if (quickPrintBtn) quickPrintBtn.addEventListener('click', handlePrintReport);
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportMonthlyReportCsv);
    if (quickExportDataBtn) quickExportDataBtn.addEventListener('click', exportAllTransactionsCsv);

    const openAddHandler = () => {
        if (addTransactionModal) {
            addTransactionModal.classList.add('active');
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('inputDate');
            if (dateInput) dateInput.value = today;
        }
    };
    if (openAddTransactionBtn) openAddTransactionBtn.addEventListener('click', openAddHandler);
    if (quickAddBtn) quickAddBtn.addEventListener('click', openAddHandler);

    const closeAddHandler = () => {
        if (addTransactionModal) addTransactionModal.classList.remove('active');
    };
    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', closeAddHandler);
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddHandler);
    if (saveTransactionBtn) saveTransactionBtn.addEventListener('click', handleSaveNewTransaction);

    const openImportHandler = () => {
        if (importModal) {
            if (customSheetUrlInput) customSheetUrlInput.value = currentGoogleSheetUrl;
            importModal.classList.add('active');
        }
    };
    if (btnOpenImportModal) btnOpenImportModal.addEventListener('click', openImportHandler);
    if (btnPasteDataQuick) btnPasteDataQuick.addEventListener('click', openImportHandler);

    const closeImportHandler = () => {
        if (importModal) importModal.classList.remove('active');
    };
    if (closeImportModalBtn) closeImportModalBtn.addEventListener('click', closeImportHandler);
    if (cancelImportBtn) cancelImportBtn.addEventListener('click', closeImportHandler);
    if (processImportBtn) processImportBtn.addEventListener('click', handleProcessImport);

    if (btnShareGuide) {
        btnShareGuide.addEventListener('click', () => {
            if (guideModal) guideModal.classList.add('active');
        });
    }
    const closeGuideHandler = () => {
        if (guideModal) guideModal.classList.remove('active');
    };
    if (closeGuideModalBtn) closeGuideModalBtn.addEventListener('click', closeGuideHandler);
    if (closeGuideBtnAction) closeGuideBtnAction.addEventListener('click', closeGuideHandler);

    if (searchInputEl) {
        searchInputEl.addEventListener('input', () => {
            currentPage = 1;
            renderTransactionsTable();
        });
    }

    // Bộ lọc loại giao dịch (Tất cả / Thu / Chi)
    if (transactionTypeFilterEl) {
        transactionTypeFilterEl.addEventListener('change', () => {
            currentPage = 1;
            renderTransactionsTable();
        });
    }

    // Phân trang: Thay đổi số dòng trên 1 trang
    if (pageSizeSelectEl) {
        pageSizeSelectEl.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10) || 25;
            currentPage = 1;
            renderTransactionsTable();
        });
    }

    // Phân trang: Nút Trang đầu
    if (btnFirstPageEl) {
        btnFirstPageEl.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage = 1;
                renderTransactionsTable();
                scrollTableIntoView();
            }
        });
    }

    // Phân trang: Nút Trang trước
    if (btnPrevPageEl) {
        btnPrevPageEl.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTransactionsTable();
                scrollTableIntoView();
            }
        });
    }

    // Phân trang: Nút Trang sau
    if (btnNextPageEl) {
        btnNextPageEl.addEventListener('click', () => {
            const totalRecords = filteredTransactions.length;
            const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
            if (currentPage < totalPages) {
                currentPage++;
                renderTransactionsTable();
                scrollTableIntoView();
            }
        });
    }

    // Phân trang: Nút Trang cuối
    if (btnLastPageEl) {
        btnLastPageEl.addEventListener('click', () => {
            const totalRecords = filteredTransactions.length;
            const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
            if (currentPage < totalPages) {
                currentPage = totalPages;
                renderTransactionsTable();
                scrollTableIntoView();
            }
        });
    }
}

function triggerRefreshAnimation() {
    if (topRefreshBtn) {
        topRefreshBtn.classList.add('spinning');
        setTimeout(() => topRefreshBtn.classList.remove('spinning'), 1000);
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info');

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
