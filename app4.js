/**
 * app4.js - Hệ Thống Soạn Thảo Văn Bản Kiểu Word & Ghép Biểu Mẫu Báo Cáo
 * Viện Quản Lý Chất Lượng & Khảo Thí - VNU-IQA
 */

// ===================================================================
// KHỞI TẠO VÀ CẤU TRÚC DỮ LIỆU MẶC ĐỊNH
// ===================================================================
const STORAGE_KEY_REPORT = 'ql_report_index4_data';
const STORAGE_KEY_SHARED_USER = 'ql_signature_shared_user';

// Mẫu nội dung mặc định khi lần đầu mở trang
const DEFAULT_WORD_CONTENT = `
<h1>I. TÌNH HÌNH TRIỂN KHAI CÔNG TÁC TRONG KỲ BÁO CÁO</h1>
<p>Thực hiện kế hoạch nhiệm vụ năm 2026 của Viện Quản lý Chất lượng và Khảo thí, trong kỳ báo cáo vừa qua, bộ phận chuyên môn đã chủ động triển khai toàn diện các giải pháp kỹ thuật, rà soát hệ thống hỗ trợ người học, đảm bảo công tác tiếp nhận và phản hồi thông tin thí sinh diễn ra thông suốt, chính xác và kịp thời.</p>
<p>Công tác kiểm tra, giám sát chất lượng dữ liệu được thực hiện thường xuyên; các chỉ số tin nhắn Messenger, bài viết thông báo và quy trình khảo thí được chuẩn hóa theo đúng quy định hiện hành.</p>

<h1>II. KẾT QUẢ ĐẠT ĐƯỢC (SỐ LIỆU ĐỐI SOÁT CHI TIẾT)</h1>
<p>Dưới đây là bảng tổng hợp các chỉ tiêu trọng tâm đã hoàn thành trong kỳ đối soát thực tế:</p>

<table>
    <thead>
        <tr>
            <th style="width: 10%;">STT</th>
            <th style="width: 45%;">Nhiệm vụ / Chỉ tiêu công tác</th>
            <th style="width: 25%;">Số lượng thực hiện</th>
            <th style="width: 20%;">Tỷ lệ hoàn thành</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="text-align: center;">01</td>
            <td>Tiếp nhận và giải đáp câu hỏi thí sinh qua Messenger</td>
            <td style="text-align: center;"><strong>18.519 câu hỏi</strong></td>
            <td style="text-align: center;"><span style="color: #059669; font-weight: 700;">100%</span></td>
        </tr>
        <tr>
            <td style="text-align: center;">02</td>
            <td>Biên tập và xuất bản bài viết thông báo trên Website CMS</td>
            <td style="text-align: center;"><strong>1.127 bài viết</strong></td>
            <td style="text-align: center;"><span style="color: #059669; font-weight: 700;">100%</span></td>
        </tr>
        <tr>
            <td style="text-align: center;">03</td>
            <td>Đồng bộ cơ sở dữ liệu điểm và phân tích khảo thí</td>
            <td style="text-align: center;"><strong>8 đợt thi</strong></td>
            <td style="text-align: center;"><span style="color: #059669; font-weight: 700;">100%</span></td>
        </tr>
        <tr>
            <td style="text-align: center;">04</td>
            <td>Kiểm tra an toàn thông tin & bảo mật hệ thống máy chủ</td>
            <td style="text-align: center;"><strong>Định kỳ hàng tuần</strong></td>
            <td style="text-align: center;"><span style="color: #059669; font-weight: 700;">Đạt chuẩn</span></td>
        </tr>
    </tbody>
</table>

<h1>III. ĐÁNH GIÁ CHUNG VÀ TỒN TẠI HẠN CHẾ</h1>
<p><strong>1. Ưu điểm:</strong> Đội ngũ cán bộ vận hành có tinh thần trách nhiệm cao; hệ thống tự động hóa phản hồi thông tin thí sinh đạt hiệu quả vượt bậc, không để xảy ra tình trạng tồn đọng thắc mắc quá 24 giờ.</p>
<p><strong>2. Tồn tại, khó khăn:</strong> Vào các khung giờ cao điểm đăng ký dự thi, lưu lượng truy cập cổng thông tin tăng đột biến, đôi lúc phát sinh độ trễ nhẹ trong việc đồng bộ số liệu sang Google Sheet dự phòng.</p>

<h1>IV. PHƯƠNG HƯỚNG VÀ NHIỆM VỤ TRỌNG TÂM THÁNG TIẾP THEO</h1>
<ul>
    <li>Tiếp tục nâng cấp hạ tầng băng thông và tối ưu thuật toán phân luồng câu hỏi hỏi - đáp tự động.</li>
    <li>Hoàn thiện quy chế phân quyền đăng tin bài CMS cho các đơn vị phòng ban trực thuộc.</li>
    <li>Định kỳ trích xuất báo cáo đối soát số liệu gửi Ban Giám đốc Viện phê duyệt trước ngày 25 hàng tháng.</li>
</ul>
<p>Kính trình Ban Giám đốc Viện Quản lý Chất lượng và Khảo thí xem xét, cho ý kiến chỉ đạo thực hiện./.</p>
`;

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initSidebar();
    initMetadataForm();
    initWordEditor();
    initTemplateModals();
    initViewModes();
    initExportAndPrint();
    loadSavedData();
});

// ===================================================================
// ĐỒNG HỒ & GIAO DIỆN CƠ BẢN
// ===================================================================
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

function getTodayFormattedVietnamese() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `Hà Nội, ngày ${d} tháng ${m} năm ${y}`;
}

function initSidebar() {
    const mobileToggle = document.getElementById("mobileToggleSidebar");
    const sidebar = document.getElementById("sidebar");
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // Scroll helpers
    const navMeta = document.getElementById("navMetadataLink");
    const navEditor = document.getElementById("navEditorLink");
    const navPrev = document.getElementById("navPreviewLink");

    if (navMeta) {
        navMeta.addEventListener("click", (e) => {
            e.preventDefault();
            switchToEditorMode();
            document.getElementById("metadataSection")?.scrollIntoView({ behavior: "smooth" });
        });
    }
    if (navEditor) {
        navEditor.addEventListener("click", (e) => {
            e.preventDefault();
            switchToEditorMode();
            document.getElementById("editorSectionContainer")?.scrollIntoView({ behavior: "smooth" });
        });
    }
    if (navPrev) {
        navPrev.addEventListener("click", (e) => {
            e.preventDefault();
            switchToPreviewMode();
            document.getElementById("previewSectionContainer")?.scrollIntoView({ behavior: "smooth" });
        });
    }
}

// ===================================================================
// QUẢN LÝ FORM THÔNG TIN BÁO CÁO & NGƯỜI KÝ
// ===================================================================
function initMetadataForm() {
    const toggleHeader = document.getElementById("metaToggleHeader");
    const formBody = document.getElementById("metaFormBody");
    const toggleIcon = document.getElementById("metaToggleIcon");

    if (toggleHeader && formBody) {
        toggleHeader.addEventListener("click", () => {
            const isHidden = formBody.style.display === "none";
            formBody.style.display = isHidden ? "grid" : "none";
            if (toggleIcon) {
                toggleIcon.className = isHidden ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down";
            }
        });
    }

    // Tự động cập nhật ngày hiện tại
    const chkAutoDate = document.getElementById("chkAutoDateNow");
    const inputDocDate = document.getElementById("cfgDocDate");
    if (chkAutoDate && inputDocDate) {
        chkAutoDate.addEventListener("change", () => {
            if (chkAutoDate.checked) {
                inputDocDate.value = getTodayFormattedVietnamese();
                inputDocDate.disabled = true;
            } else {
                inputDocDate.disabled = false;
            }
            updateMergedReportDOM();
            saveDataToLocalStorage();
        });
    }

    // Presets tiêu đề nhanh
    document.querySelectorAll("#metadataSection .preset-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute("data-target");
            const targetVal = btn.getAttribute("data-val");
            const el = document.getElementById(targetId);
            if (el && targetVal) {
                el.value = targetVal;
                updateMergedReportDOM();
                saveDataToLocalStorage();
                showToast(`Đã áp dụng tiêu đề: ${targetVal}`, "info");
            }
        });
    });

    // Lắng nghe thay đổi trên tất cả các input
    const inputs = [
        "cfgOrgParent", "cfgOrgName", "cfgDocDate",
        "cfgReportTitle", "cfgReportSubtitle", "cfgReportRecipient",
        "cfgUserTitle", "cfgUserName", "cfgUserHint",
        "cfgLeaderTitle", "cfgLeaderName", "cfgLeaderHint"
    ];

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                updateMergedReportDOM();
                debounceAutoSave();
            });
        }
    });
}

// ===================================================================
// TRÌNH SOẠN THẢO VĂN BẢN KIỂU MICROSOFT WORD (WYSIWYG)
// ===================================================================
function initWordEditor() {
    const editor = document.getElementById("wordContentEditor");
    const toolbar = document.getElementById("wordToolbar");

    if (!editor || !toolbar) return;

    // Thực thi các nút lệnh thông thường qua document.execCommand
    toolbar.querySelectorAll(".tb-btn[data-cmd]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const cmd = btn.getAttribute("data-cmd");
            document.execCommand(cmd, false, null);
            editor.focus();
            updateWordStats();
            updateToolbarActiveStates();
            debounceAutoSave();
        });
    });

    // Chọn Headings (Paragraph, H1, H2, H3)
    const headingSelect = document.getElementById("tbHeadingSelect");
    if (headingSelect) {
        headingSelect.addEventListener("change", () => {
            const val = headingSelect.value;
            document.execCommand("formatBlock", false, `<${val}>`);
            editor.focus();
            updateToolbarActiveStates();
            debounceAutoSave();
        });
    }

    // Chọn Phông chữ
    const fontSelect = document.getElementById("tbFontFamily");
    if (fontSelect) {
        fontSelect.addEventListener("change", () => {
            document.execCommand("fontName", false, fontSelect.value);
            editor.focus();
            debounceAutoSave();
        });
    }

    // Chọn Cỡ chữ
    const fontSizeSelect = document.getElementById("tbFontSize");
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener("change", () => {
            const size = fontSizeSelect.value;
            applyFontSizeToSelection(size);
            editor.focus();
            debounceAutoSave();
        });
    }

    // Chọn Màu chữ
    const textColorInput = document.getElementById("inputTextColor");
    if (textColorInput) {
        textColorInput.addEventListener("input", () => {
            document.execCommand("foreColor", false, textColorInput.value);
            debounceAutoSave();
        });
    }

    // Chọn Màu đánh dấu (Highlight)
    const bgColorInput = document.getElementById("inputBgColor");
    if (bgColorInput) {
        bgColorInput.addEventListener("input", () => {
            document.execCommand("hiliteColor", false, bgColorInput.value);
            debounceAutoSave();
        });
    }

    // Nút trích dẫn Quote
    const btnQuote = document.getElementById("btnInsertQuote");
    if (btnQuote) {
        btnQuote.addEventListener("click", (e) => {
            e.preventDefault();
            document.execCommand("formatBlock", false, "<blockquote>");
            editor.focus();
            debounceAutoSave();
        });
    }

    // Nút chèn Link
    const btnLink = document.getElementById("btnInsertLink");
    if (btnLink) {
        btnLink.addEventListener("click", (e) => {
            e.preventDefault();
            const url = prompt("Nhập đường dẫn URL website liên kết:", "https://");
            if (url && url.trim()) {
                document.execCommand("createLink", false, url.trim());
                debounceAutoSave();
            }
        });
    }

    // Nút Xóa trắng
    const btnClear = document.getElementById("btnClearEditor");
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ nội dung để soạn thảo lại từ đầu?")) {
                editor.innerHTML = "<p><br></p>";
                updateWordStats();
                updateMergedReportDOM();
                saveDataToLocalStorage();
                showToast("Đã xóa trắng khung soạn thảo!", "info");
                editor.focus();
            }
        });
    }

    // Lắng nghe sự kiện gõ phím trong editor
    editor.addEventListener("input", () => {
        updateWordStats();
        debounceAutoSave();
    });

    editor.addEventListener("keyup", updateToolbarActiveStates);
    editor.addEventListener("mouseup", updateToolbarActiveStates);

    // Xử lý phím Tab trong editor (thụt lề thay vì nhảy ra ngoài)
    editor.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
            e.preventDefault();
            if (e.shiftKey) {
                document.execCommand("outdent", false, null);
            } else {
                document.execCommand("indent", false, null);
            }
        }
    });

    updateWordStats();
}

/**
 * Áp dụng cỡ chữ chính xác qua CSS inline span
 */
function applyFontSizeToSelection(size) {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    document.execCommand("fontSize", false, "7"); // dùng font size 7 làm mốc tạm
    const fontSpans = document.getElementById("wordContentEditor")?.querySelectorAll("font[size='7']");
    if (fontSpans) {
        fontSpans.forEach(font => {
            const span = document.createElement("span");
            span.style.fontSize = size;
            span.innerHTML = font.innerHTML;
            font.parentNode.replaceChild(span, font);
        });
    }
}

/**
 * Cập nhật trạng thái active của các nút trên toolbar
 */
function updateToolbarActiveStates() {
    const commands = ["bold", "italic", "underline", "strikeThrough", "subscript", "superscript", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull"];
    commands.forEach(cmd => {
        const btn = document.querySelector(`.tb-btn[data-cmd='${cmd}']`);
        if (btn) {
            try {
                if (document.queryCommandState(cmd)) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            } catch (e) {}
        }
    });
}

/**
 * Đếm số từ và số ký tự
 */
function updateWordStats() {
    const editor = document.getElementById("wordContentEditor");
    const wordCountEl = document.getElementById("wordCountText");
    const charCountEl = document.getElementById("charCountText");

    if (!editor) return;

    const text = editor.innerText || "";
    const cleanText = text.trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const chars = cleanText.length;

    if (wordCountEl) wordCountEl.textContent = `${words.toLocaleString('vi-VN')} từ`;
    if (charCountEl) charCountEl.textContent = `${chars.toLocaleString('vi-VN')} ký tự`;
}

// ===================================================================
// MODALS: CHÈN BẢNG, CHÈN ẢNH, MẪU BÁO CÁO CHUẨN
// ===================================================================
function initTemplateModals() {
    // 1. MODAL CHÈN BẢNG
    const btnInsertTable = document.getElementById("btnInsertTable");
    const tableModal = document.getElementById("insertTableModal");
    const closeTableBtn = document.getElementById("closeTableModalBtn");
    const cancelTableBtn = document.getElementById("cancelTableModalBtn");
    const confirmTableBtn = document.getElementById("confirmInsertTableBtn");

    if (btnInsertTable && tableModal) {
        btnInsertTable.addEventListener("click", () => {
            tableModal.classList.add("show");
        });
    }

    const closeTable = () => tableModal?.classList.remove("show");
    if (closeTableBtn) closeTableBtn.addEventListener("click", closeTable);
    if (cancelTableBtn) cancelTableBtn.addEventListener("click", closeTable);

    if (confirmTableBtn) {
        confirmTableBtn.addEventListener("click", () => {
            const rows = parseInt(document.getElementById("inputTableRows")?.value || "3", 10);
            const cols = parseInt(document.getElementById("inputTableCols")?.value || "3", 10);
            const hasHeader = document.getElementById("chkTableHeader")?.checked;

            insertTableToEditor(rows, cols, hasHeader);
            closeTable();
            debounceAutoSave();
        });
    }

    // 2. MODAL CHÈN HÌNH ẢNH
    const btnInsertImg = document.getElementById("btnInsertImage");
    const imgModal = document.getElementById("insertImageModal");
    const closeImgBtn = document.getElementById("closeImageModalBtn");
    const cancelImgBtn = document.getElementById("cancelImageModalBtn");
    const confirmImgBtn = document.getElementById("confirmInsertImageBtn");

    if (btnInsertImg && imgModal) {
        btnInsertImg.addEventListener("click", () => {
            imgModal.classList.add("show");
        });
    }

    const closeImg = () => imgModal?.classList.remove("show");
    if (closeImgBtn) closeImgBtn.addEventListener("click", closeImg);
    if (cancelImgBtn) cancelImgBtn.addEventListener("click", closeImg);

    if (confirmImgBtn) {
        confirmImgBtn.addEventListener("click", () => {
            const fileInput = document.getElementById("inputImageFile");
            const urlInput = document.getElementById("inputImageUrl");

            if (fileInput && fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imgSrc = e.target.result;
                    document.execCommand("insertImage", false, imgSrc);
                    closeImg();
                    fileInput.value = "";
                    debounceAutoSave();
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else if (urlInput && urlInput.value.trim()) {
                document.execCommand("insertImage", false, urlInput.value.trim());
                closeImg();
                urlInput.value = "";
                debounceAutoSave();
            } else {
                alert("Vui lòng chọn file ảnh từ máy hoặc dán link ảnh!");
            }
        });
    }

    // 3. MODAL MẪU BÁO CÁO
    const btnOpenTemplates = document.getElementById("btnOpenTemplates");
    const tplModal = document.getElementById("templatesModal");
    const closeTplBtn = document.getElementById("closeTemplatesModalBtn");
    const cancelTplBtn = document.getElementById("cancelTemplatesModalBtn");

    if (btnOpenTemplates && tplModal) {
        btnOpenTemplates.addEventListener("click", () => {
            tplModal.classList.add("show");
        });
    }

    const closeTpl = () => tplModal?.classList.remove("show");
    if (closeTplBtn) closeTplBtn.addEventListener("click", closeTpl);
    if (cancelTplBtn) cancelTplBtn.addEventListener("click", closeTpl);

    // Mẫu 1: Báo cáo tháng
    document.getElementById("tplMonthlyReport")?.addEventListener("click", () => {
        if (confirm("Tải Mẫu Báo Cáo Tháng? Nội dung hiện tại trong editor sẽ được thay thế.")) {
            applySampleTemplate(1);
            closeTpl();
        }
    });

    // Mẫu 2: Báo cáo năm
    document.getElementById("tplYearlyReport")?.addEventListener("click", () => {
        if (confirm("Tải Mẫu Báo Cáo Tổng Kết Năm? Nội dung hiện tại trong editor sẽ được thay thế.")) {
            applySampleTemplate(2);
            closeTpl();
        }
    });

    // Mẫu 3: Báo cáo chuyên đề
    document.getElementById("tplIncidentReport")?.addEventListener("click", () => {
        if (confirm("Tải Mẫu Báo Cáo Chuyên Đề Đột Xuất? Nội dung hiện tại trong editor sẽ được thay thế.")) {
            applySampleTemplate(3);
            closeTpl();
        }
    });
}

/**
 * Chèn bảng biểu HTML vào vị trí con trỏ
 */
function insertTableToEditor(rows, cols, hasHeader) {
    let html = '<table>';
    if (hasHeader) {
        html += '<thead><tr>';
        for (let c = 1; c <= cols; c++) {
            html += `<th>Tiêu đề ${c}</th>`;
        }
        html += '</tr></thead>';
    }
    html += '<tbody>';
    const startRow = hasHeader ? 1 : 0;
    for (let r = startRow; r < rows; r++) {
        html += '<tr>';
        for (let c = 1; c <= cols; c++) {
            html += `<td>Nội dung ô ${r + 1}.${c}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';

    document.getElementById("wordContentEditor")?.focus();
    document.execCommand("insertHTML", false, html);
    updateWordStats();
}

/**
 * Tải mẫu văn bản có sẵn
 */
function applySampleTemplate(type) {
    const editor = document.getElementById("wordContentEditor");
    const titleInput = document.getElementById("cfgReportTitle");
    const subTitleInput = document.getElementById("cfgReportSubtitle");

    if (type === 1) {
        if (titleInput) titleInput.value = "BÁO CÁO KẾT QUẢ CÔNG TÁC THÁNG VÀ KẾ HOẠCH NHIỆM VỤ THÁNG TIẾP THEO";
        if (subTitleInput) subTitleInput.value = "Về việc Đánh giá tiến độ giải đáp câu hỏi và xuất bản bài viết CMS";
        if (editor) editor.innerHTML = DEFAULT_WORD_CONTENT;
    } else if (type === 2) {
        if (titleInput) titleInput.value = "BÁO CÁO TỔNG KẾT HOẠT ĐỘNG VÀ ĐĂNG TẢI NỘI DUNG NĂM 2026";
        if (subTitleInput) subTitleInput.value = "Về việc Tổng kết chỉ tiêu khảo thí, tin nhắn hỗ trợ và điều hành cổng thông tin";
        if (editor) {
            editor.innerHTML = `
                <h1>I. ĐÁNH GIÁ CHỈ TIÊU HOÀN THÀNH CẢ NĂM 2026</h1>
                <p>Năm 2026 đánh dấu bước chuyển mình quan trọng của Viện Quản lý Chất lượng và Khảo thí trong việc chuyển đổi số toàn diện công tác hỗ trợ thí sinh và xuất bản thông tin.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Hạng mục công tác</th>
                            <th>Mục tiêu đầu năm</th>
                            <th>Thực tế đạt được</th>
                            <th>Đánh giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Tổng câu hỏi phản hồi</td>
                            <td>15.000 câu</td>
                            <td><strong>18.519 câu</strong></td>
                            <td style="color: #059669; font-weight: 700;">Đạt 123.4%</td>
                        </tr>
                        <tr>
                            <td>Bài viết xuất bản CMS</td>
                            <td>800 bài</td>
                            <td><strong>1.127 bài</strong></td>
                            <td style="color: #059669; font-weight: 700;">Đạt 140.8%</td>
                        </tr>
                    </tbody>
                </table>
                <h1>II. PHƯƠNG HƯỚNG NHIỆM VỤ NĂM 2027</h1>
                <p>Tiếp tục duy trì tính ổn định của hệ thống, nâng cao trải nghiệm thí sinh và chuẩn hóa quy trình báo cáo số liệu nội bộ.</p>
            `;
        }
    } else if (type === 3) {
        if (titleInput) titleInput.value = "BÁO CÁO CHUYÊN ĐỀ VỀ TÌNH HÌNH DỮ LIỆU KHẢO THÍ ĐỢT THI HSA";
        if (subTitleInput) subTitleInput.value = "V/v Báo cáo nhanh công tác chuẩn bị hạ tầng tiếp nhận thông tin";
        if (editor) {
            editor.innerHTML = `
                <h1>1. MỤC ĐÍCH YÊU CẦU</h1>
                <p>Báo cáo nhanh tình hình chuẩn bị dữ liệu kỳ thi Đánh giá năng lực học sinh trung học phổ thông (HSA) theo chỉ đạo của Ban Giám đốc.</p>
                <h1>2. TÌNH HÌNH THỰC TẾ</h1>
                <p>Đã hoàn tất rà soát 22.944 bản ghi hỏi đáp từ Google Sheet, tối ưu hóa các kịch bản trả lời mẫu cho các tình huống thường gặp của thí sinh về địa điểm thi, số báo danh và quy chế thi.</p>
                <h1>3. KIẾN NGHỊ ĐỀ XUẤT</h1>
                <p>Đề nghị bố trí thêm 02 cán bộ trực phản hồi trong khung giờ từ 08h00 đến 21h00 các ngày diễn ra đợt thi.</p>
            `;
        }
    }

    updateWordStats();
    updateMergedReportDOM();
    saveDataToLocalStorage();
    showToast("Đã tải mẫu văn bản thành công!", "success");
}

// ===================================================================
// CHUYỂN ĐỔI CHẾ ĐỘ XEM TRƯỚC VÀ SOẠN THẢO
// ===================================================================
function initViewModes() {
    const tabEditor = document.getElementById("tabEditorMode");
    const tabPreview = document.getElementById("tabPreviewMode");

    if (tabEditor) {
        tabEditor.addEventListener("click", () => {
            switchToEditorMode();
        });
    }

    if (tabPreview) {
        tabPreview.addEventListener("click", () => {
            switchToPreviewMode();
        });
    }
}

function switchToEditorMode() {
    document.getElementById("tabEditorMode")?.classList.add("active");
    document.getElementById("tabPreviewMode")?.classList.remove("active");
    const editorSec = document.getElementById("editorSectionContainer");
    const previewSec = document.getElementById("previewSectionContainer");
    if (editorSec) editorSec.style.display = "block";
    if (previewSec) previewSec.style.display = "none";
}

function switchToPreviewMode() {
    updateMergedReportDOM();
    document.getElementById("tabPreviewMode")?.classList.add("active");
    document.getElementById("tabEditorMode")?.classList.remove("active");
    const editorSec = document.getElementById("editorSectionContainer");
    const previewSec = document.getElementById("previewSectionContainer");
    if (editorSec) editorSec.style.display = "none";
    if (previewSec) previewSec.style.display = "block";
}

// ===================================================================
// GHÉP NỘI DUNG VÀO BIỂU MẪU BÁO CÁO HÀNH CHÍNH (MERGE ENGINE)
// ===================================================================
function updateMergedReportDOM() {
    // 1. Lấy dữ liệu từ các trường cấu hình
    const orgParent = document.getElementById("cfgOrgParent")?.value || "ĐẠI HỌC QUỐC GIA HÀ NỘI";
    const orgName = document.getElementById("cfgOrgName")?.value || "VIỆN QUẢN LÝ CHẤT LƯỢNG VÀ KHẢO THÍ";
    
    const isAutoDate = document.getElementById("chkAutoDateNow")?.checked;
    const docDate = isAutoDate ? getTodayFormattedVietnamese() : (document.getElementById("cfgDocDate")?.value || getTodayFormattedVietnamese());

    const reportTitle = document.getElementById("cfgReportTitle")?.value || "BÁO CÁO KẾT QUẢ CÔNG TÁC";
    const reportSubtitle = document.getElementById("cfgReportSubtitle")?.value || "";
    const reportRecipient = document.getElementById("cfgReportRecipient")?.value || "";

    const userTitle = document.getElementById("cfgUserTitle")?.value || "NGƯỜI LẬP BÁO CÁO";
    const userName = document.getElementById("cfgUserName")?.value || "Nguyễn Thế Anh";
    const userHint = document.getElementById("cfgUserHint")?.value || "(Ký và ghi rõ họ tên)";

    const leaderTitle = document.getElementById("cfgLeaderTitle")?.value || "PHỤ TRÁCH PHÒNG";
    const leaderName = document.getElementById("cfgLeaderName")?.value || "....................................................";
    const leaderHint = document.getElementById("cfgLeaderHint")?.value || "(Ký, ghi rõ họ tên)";

    // 2. Lấy nội dung phong phú từ Word Editor
    const editor = document.getElementById("wordContentEditor");
    const bodyContentHtml = editor ? editor.innerHTML : "<p>Chưa có nội dung báo cáo.</p>";

    // 3. Đưa vào Biểu mẫu hành chính hiển thị (#officialDocument)
    const docOrgParentEl = document.getElementById("docOrgParent");
    const docOrgNameEl = document.getElementById("docOrgName");
    const docDatePlaceEl = document.getElementById("docDatePlace");
    const docReportTitleEl = document.getElementById("docReportTitle");
    const docReportSubtitleEl = document.getElementById("docReportSubtitle");
    const docRecipientEl = document.getElementById("docRecipient");
    const docMergedBodyEl = document.getElementById("docMergedBody");

    const docSignUserTitleEl = document.getElementById("docSignUserTitle");
    const docSignUserNameEl = document.getElementById("docSignUserName");
    const docSignUserHintEl = document.getElementById("docSignUserHint");

    const docSignLeaderTitleEl = document.getElementById("docSignLeaderTitle");
    const docSignLeaderNameEl = document.getElementById("docSignLeaderName");
    const docSignLeaderHintEl = document.getElementById("docSignLeaderHint");

    if (docOrgParentEl) docOrgParentEl.textContent = orgParent;
    if (docOrgNameEl) docOrgNameEl.textContent = orgName;
    if (docDatePlaceEl) docDatePlaceEl.textContent = docDate;
    if (docReportTitleEl) docReportTitleEl.textContent = reportTitle.toUpperCase();

    if (docReportSubtitleEl) {
        docReportSubtitleEl.textContent = reportSubtitle;
        docReportSubtitleEl.style.display = reportSubtitle.trim() ? "block" : "none";
    }

    if (docRecipientEl) {
        docRecipientEl.textContent = reportRecipient;
        docRecipientEl.style.display = reportRecipient.trim() ? "block" : "none";
    }

    if (docMergedBodyEl) docMergedBodyEl.innerHTML = bodyContentHtml;

    if (docSignUserTitleEl) docSignUserTitleEl.textContent = userTitle.toUpperCase();
    if (docSignUserNameEl) docSignUserNameEl.textContent = userName;
    if (docSignUserHintEl) docSignUserHintEl.textContent = userHint;

    if (docSignLeaderTitleEl) docSignLeaderTitleEl.textContent = leaderTitle.toUpperCase();
    if (docSignLeaderNameEl) docSignLeaderNameEl.textContent = leaderName;
    if (docSignLeaderHintEl) docSignLeaderHintEl.textContent = leaderHint;

    // Cập nhật tên người dùng lên topbar & sidebar
    const topUserMeta = document.getElementById("topbarUserMeta");
    if (topUserMeta && userName) {
        topUserMeta.textContent = `Người dùng: ${userName}`;
    }
    const sideUserFull = document.getElementById("sidebarUserFullName");
    if (sideUserFull && userName) {
        sideUserFull.textContent = userName;
    }
}

// ===================================================================
// IN ẤN & XUẤT FILE MICROSOFT WORD (.DOC)
// ===================================================================
function initExportAndPrint() {
    // 1. NÚT IN BÁO CÁO
    const printBtns = ["btnTriggerPrint", "topBtnPrint", "btnPrintFromPreview"];
    printBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener("click", () => {
                executePrintOfficialReport();
            });
        }
    });

    // 2. NÚT XUẤT FILE WORD (.DOC)
    const wordBtns = ["btnExportWordFile", "topBtnSaveDraft"];
    const btnWordExport = document.getElementById("btnExportWordFile");
    if (btnWordExport) {
        btnWordExport.addEventListener("click", () => {
            exportReportToWordFile();
        });
    }

    const btnSaveDraft = document.getElementById("topBtnSaveDraft");
    if (btnSaveDraft) {
        btnSaveDraft.addEventListener("click", () => {
            saveDataToLocalStorage();
            showToast("Đã lưu toàn bộ bản nháp báo cáo vào bộ nhớ thành công!", "success");
        });
    }
}

/**
 * Thực thi lệnh In báo cáo A4
 */
function executePrintOfficialReport() {
    updateMergedReportDOM();

    // Hiển thị phần preview để bản in có DOM trọn vẹn
    const previewSec = document.getElementById("previewSectionContainer");
    if (previewSec) previewSec.style.display = "block";

    window.addEventListener("beforeprint", () => {
        updateMergedReportDOM();
    });

    setTimeout(() => {
        window.print();
    }, 150);
}

/**
 * Xuất file Word (.doc) tương thích 100% với Microsoft Word
 */
function exportReportToWordFile() {
    updateMergedReportDOM();

    const orgParent = document.getElementById("cfgOrgParent")?.value || "ĐẠI HỌC QUỐC GIA HÀ NỘI";
    const orgName = document.getElementById("cfgOrgName")?.value || "VIỆN QUẢN LÝ CHẤT LƯỢNG VÀ KHẢO THÍ";
    const isAutoDate = document.getElementById("chkAutoDateNow")?.checked;
    const docDate = isAutoDate ? getTodayFormattedVietnamese() : (document.getElementById("cfgDocDate")?.value || getTodayFormattedVietnamese());
    const reportTitle = document.getElementById("cfgReportTitle")?.value || "BÁO CÁO KẾT QUẢ CÔNG TÁC";
    const reportSubtitle = document.getElementById("cfgReportSubtitle")?.value || "";
    const reportRecipient = document.getElementById("cfgReportRecipient")?.value || "";
    const userTitle = document.getElementById("cfgUserTitle")?.value || "NGƯỜI LẬP BÁO CÁO";
    const userName = document.getElementById("cfgUserName")?.value || "Nguyễn Thế Anh";
    const userHint = document.getElementById("cfgUserHint")?.value || "(Ký và ghi rõ họ tên)";
    const leaderTitle = document.getElementById("cfgLeaderTitle")?.value || "PHỤ TRÁCH PHÒNG";
    const leaderName = document.getElementById("cfgLeaderName")?.value || "....................................................";
    const leaderHint = document.getElementById("cfgLeaderHint")?.value || "(Ký, ghi rõ họ tên)";

    const editor = document.getElementById("wordContentEditor");
    const bodyContentHtml = editor ? editor.innerHTML : "<p>Chưa có nội dung báo cáo.</p>";

    const sanitizedTitle = reportTitle.replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, "_").substring(0, 50);

    // Tạo mã HTML chuyên biệt cho Microsoft Word với định dạng A4 và phông Times New Roman chuẩn
    const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>${reportTitle}</title>
        <!--[if gte mso 9]>
        <xml>
            <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>100</w:Zoom>
                <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
            @page Section1 {
                size: 595.3pt 841.9pt; /* A4 */
                margin: 56.7pt 42.5pt 56.7pt 70.85pt; /* Top 20mm, Right 15mm, Bottom 20mm, Left 25mm */
                mso-header-margin: 35.4pt;
                mso-footer-margin: 35.4pt;
                mso-paper-source: 0;
            }
            div.Section1 {
                page: Section1;
            }
            body {
                font-family: 'Times New Roman', serif;
                font-size: 13pt;
                line-height: 1.45;
                color: #000000;
            }
            p {
                margin: 0 0 6pt 0;
                text-align: justify;
                text-indent: 28pt;
            }
            table.data-table {
                width: 100%;
                border-collapse: collapse;
                margin: 10pt 0;
                font-family: 'Times New Roman', serif;
                font-size: 12pt;
            }
            table.data-table th, table.data-table td {
                border: 1pt solid black;
                padding: 5pt 7pt;
            }
            table.data-table th {
                background-color: #f2f2f2;
                font-weight: bold;
                text-align: center;
            }
            h1, h2, h3 {
                font-family: 'Times New Roman', serif;
                font-weight: bold;
                margin-top: 12pt;
                margin-bottom: 4pt;
                text-indent: 0;
            }
            h1 { font-size: 13.5pt; }
            h2 { font-size: 13pt; }
            h3 { font-size: 13pt; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="Section1">
            <!-- Header 2 cột chuẩn Word -->
            <table style="width: 100%; border: none; margin-bottom: 18pt;">
                <tr>
                    <td style="width: 48%; text-align: center; vertical-align: top; border: none; padding: 0;">
                        <div style="font-size: 11pt;">${orgParent}</div>
                        <div style="font-size: 11.5pt; font-weight: bold;">${orgName}</div>
                        <div style="width: 100pt; border-top: 1pt solid black; margin: 3pt auto 6pt auto;"></div>
                    </td>
                    <td style="width: 52%; text-align: center; vertical-align: top; border: none; padding: 0;">
                        <div style="font-size: 11pt; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                        <div style="font-size: 11.5pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
                        <div style="width: 130pt; border-top: 1pt solid black; margin: 3pt auto 6pt auto;"></div>
                        <div style="font-size: 11pt; font-style: italic;">${docDate}</div>
                    </td>
                </tr>
            </table>

            <!-- Tiêu đề Báo Cáo -->
            <div style="text-align: center; margin: 20pt 0 16pt 0;">
                <div style="font-size: 13.5pt; font-weight: bold; text-transform: uppercase;">${reportTitle}</div>
                ${reportSubtitle ? `<div style="font-size: 12pt; font-style: italic; margin-top: 4pt;">${reportSubtitle}</div>` : ''}
                ${reportRecipient ? `<div style="font-size: 12pt; font-style: italic; margin-top: 10pt;">${reportRecipient}</div>` : ''}
            </div>

            <!-- Thân nội dung -->
            <div style="text-align: justify; font-size: 13pt; line-height: 1.45;">
                ${bodyContentHtml}
            </div>

            <!-- Chân trang: 2 cột Chữ ký chuẩn Word cân đối -->
            <table style="width: 100%; border: none; margin-top: 25pt;">
                <tr>
                    <td style="width: 50%; text-align: center; vertical-align: top; border: none; padding: 0 15pt;">
                        <div style="font-weight: bold; font-size: 11.5pt; text-transform: uppercase;">${userTitle}</div>
                        <div style="font-style: italic; font-size: 9.5pt;">${userHint}</div>
                        <div style="height: 55pt;"></div>
                        <div style="font-weight: bold; font-size: 11.5pt;">${userName}</div>
                    </td>
                    <td style="width: 50%; text-align: center; vertical-align: top; border: none; padding: 0 15pt;">
                        <div style="font-weight: bold; font-size: 11.5pt; text-transform: uppercase;">${leaderTitle}</div>
                        <div style="font-style: italic; font-size: 9.5pt;">${leaderHint}</div>
                        <div style="height: 55pt;"></div>
                        <div style="font-weight: bold; font-size: 11.5pt;">${leaderName}</div>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>
    `;

    // Tạo file Blob định dạng application/msword
    const blob = new Blob(['\ufeff', wordHtml], {
        type: 'application/msword;charset=utf-8'
    });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);

    showToast("Đã xuất file Word (.doc) thành công! Bạn có thể mở trực tiếp trong Microsoft Word.", "success");
}

// ===================================================================
// LƯU TRỮ VÀ TỰ ĐỘNG KHÔI PHỤC (LOCALSTORAGE)
// ===================================================================
let autoSaveTimer = null;
function debounceAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveDataToLocalStorage();
    }, 1500);
}

function saveDataToLocalStorage() {
    const editor = document.getElementById("wordContentEditor");
    const data = {
        orgParent: document.getElementById("cfgOrgParent")?.value,
        orgName: document.getElementById("cfgOrgName")?.value,
        docDate: document.getElementById("cfgDocDate")?.value,
        autoDate: document.getElementById("chkAutoDateNow")?.checked,
        reportTitle: document.getElementById("cfgReportTitle")?.value,
        reportSubtitle: document.getElementById("cfgReportSubtitle")?.value,
        reportRecipient: document.getElementById("cfgReportRecipient")?.value,
        userTitle: document.getElementById("cfgUserTitle")?.value,
        userName: document.getElementById("cfgUserName")?.value,
        userHint: document.getElementById("cfgUserHint")?.value,
        leaderTitle: document.getElementById("cfgLeaderTitle")?.value,
        leaderName: document.getElementById("cfgLeaderName")?.value,
        leaderHint: document.getElementById("cfgLeaderHint")?.value,
        editorHtml: editor ? editor.innerHTML : ""
    };

    try {
        localStorage.setItem(STORAGE_KEY_REPORT, JSON.stringify(data));
        // Đồng bộ tên người lập sang shared storage
        if (data.userName) {
            localStorage.setItem(STORAGE_KEY_SHARED_USER, data.userName);
        }
        const statusEl = document.getElementById("autoSaveStatusText");
        if (statusEl) {
            const timeStr = new Date().toLocaleTimeString('vi-VN');
            statusEl.innerHTML = `<i class="fa-solid fa-cloud-check text-emerald"></i> Đã tự động lưu nháp lúc ${timeStr}`;
        }
    } catch (e) {
        console.warn("Lỗi lưu localStorage:", e);
    }
}

function loadSavedData() {
    const editor = document.getElementById("wordContentEditor");

    // Ưu tiên đọc tên người dùng dùng chung nếu chưa có bản nháp
    const sharedUser = localStorage.getItem(STORAGE_KEY_SHARED_USER);
    if (sharedUser) {
        const inputUserName = document.getElementById("cfgUserName");
        if (inputUserName) inputUserName.value = sharedUser;
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY_REPORT);
        if (raw) {
            const data = JSON.parse(raw);
            if (data.orgParent) document.getElementById("cfgOrgParent").value = data.orgParent;
            if (data.orgName) document.getElementById("cfgOrgName").value = data.orgName;
            if (data.docDate) document.getElementById("cfgDocDate").value = data.docDate;
            if (data.autoDate !== undefined) {
                const chk = document.getElementById("chkAutoDateNow");
                if (chk) {
                    chk.checked = data.autoDate;
                    document.getElementById("cfgDocDate").disabled = data.autoDate;
                }
            }
            if (data.reportTitle) document.getElementById("cfgReportTitle").value = data.reportTitle;
            if (data.reportSubtitle) document.getElementById("cfgReportSubtitle").value = data.reportSubtitle;
            if (data.reportRecipient) document.getElementById("cfgReportRecipient").value = data.reportRecipient;
            if (data.userTitle) document.getElementById("cfgUserTitle").value = data.userTitle;
            if (data.userName) document.getElementById("cfgUserName").value = data.userName;
            if (data.userHint) document.getElementById("cfgUserHint").value = data.userHint;
            if (data.leaderTitle) document.getElementById("cfgLeaderTitle").value = data.leaderTitle;
            if (data.leaderName) document.getElementById("cfgLeaderName").value = data.leaderName;
            if (data.leaderHint) document.getElementById("cfgLeaderHint").value = data.leaderHint;

            if (data.editorHtml && editor) {
                editor.innerHTML = data.editorHtml;
            } else if (editor) {
                editor.innerHTML = DEFAULT_WORD_CONTENT;
            }
        } else if (editor) {
            editor.innerHTML = DEFAULT_WORD_CONTENT;
        }
    } catch (e) {
        console.warn("Lỗi phục hồi dữ liệu từ localStorage:", e);
        if (editor) editor.innerHTML = DEFAULT_WORD_CONTENT;
    }

    updateWordStats();
    updateMergedReportDOM();
}

// ===================================================================
// HỆ THỐNG TOAST NOTIFICATION
// ===================================================================
function showToast(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";

    let icon = '<i class="fa-solid fa-circle-info text-cyan"></i>';
    if (type === "success") icon = '<i class="fa-solid fa-circle-check text-emerald"></i>';
    if (type === "warning") icon = '<i class="fa-solid fa-triangle-exclamation text-amber"></i>';
    if (type === "error") icon = '<i class="fa-solid fa-circle-xmark text-rose"></i>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
