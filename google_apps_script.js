function doGet(e) {
    const action = e.parameter.action;

    if (action === 'getMoldMaster') {
        return getData('MoldMaster');
    } else if (action === 'getCustomerCodes') {
        return getData('CustomerCodes');
    } else if (action === 'getProductNames') {
        return getData('ProductNames');
    } else if (action === 'getMachines') {
        return getData('Machines');
    } else if (action === 'getPartners') {
        return getData('Partners');
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const contents = JSON.parse(e.postData.contents);
        const action = contents.action;
        const data = contents.data;

        if (action === 'addMold') {
            const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('MoldMaster');
            // Columns: ID, 고객사코드, 제품명, 순번, 버전, 금형명, 설비, 등록일
            // We need to calculate '순번' (Sequence) automatically or just leave it blank for now.
            // Let's just append the data we have.

            const newRow = [
                data.id,
                data.customerCode,
                data.productName,
                '', // 순번 (Sequence) - logic to auto-increment could be added here
                data.version,
                data.moldName,
                data.machine,
                new Date() // 등록일 (Timestamp)
            ];

            sheet.appendRow(newRow);

            return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function getData(sheetName) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    // If sheet doesn't exist, return empty list
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function setupSheets() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const sheets = [
        { name: 'MoldMaster', headers: ['ID', '고객사코드', '제품명', '순번', '버전', '금형명', '설비', '등록일'] },
        { name: 'CustomerCodes', headers: ['거래처명', '거래처기호'] },
        { name: 'ProductNames', headers: ['제품명'] },
        { name: 'Machines', headers: ['설비명', '설비위치'] },
        { name: 'Partners', headers: ['협력사명', '담당자', '담당자연락처'] }
    ];

    sheets.forEach(s => {
        let sheet = ss.getSheetByName(s.name);
        if (!sheet) {
            sheet = ss.insertSheet(s.name);
            sheet.appendRow(s.headers);

            // Add some sample data if creating for the first time
            if (s.name === 'MoldMaster') {
                sheet.appendRow(['M-2023-001', 'CUST01', 'PhoneCase', '1', 'v1.0', 'MainBody_Mold', 'Machine-A', new Date()]);
            } else if (s.name === 'CustomerCodes') {
                sheet.appendRow(['Samsung', 'SEC']);
                sheet.appendRow(['LG', 'LGE']);
            } else if (s.name === 'Machines') {
                sheet.appendRow(['Machine-A', 'Zone 1']);
                sheet.appendRow(['Machine-B', 'Zone 2']);
            }
        }
    });
}
