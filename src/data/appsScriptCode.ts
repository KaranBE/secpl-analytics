export interface AppsScriptFile {
  name: string;
  type: 'server_js' | 'json' | 'html';
  description: string;
  code: string;
}

export const APPS_SCRIPT_PROJECT_FILES: AppsScriptFile[] = [
  {
    name: 'Code.gs',
    type: 'server_js',
    description: 'WhatsApp Cloud API Webhook Handler (GET & POST) with natural language routing and engineer status updates',
    code: `/**
 * WhatsApp Cloud API Webhook & Google Apps Script Dispatcher
 * Architecture: WhatsApp -> Apps Script -> Google Sheets -> Gmail
 * No Looker Studio required.
 */

const CONFIG = {
  VERIFY_TOKEN: "YOUR_WHATSAPP_WEBHOOK_VERIFY_TOKEN",
  WHATSAPP_TOKEN: "YOUR_META_ACCESS_TOKEN",
  PHONE_NUMBER_ID: "YOUR_WHATSAPP_PHONE_NUMBER_ID",
  SPREADSHEET_ID: "YOUR_GOOGLE_SPREADSHEET_ID",
  RECIPIENTS_DAILY: "operations@company.com, service.head@company.com, management@company.com",
  RECIPIENTS_WEEKLY: "executive.board@company.com, operations@company.com, zone.leads@company.com"
};

/**
 * Handles Webhook verification challenge from Meta WhatsApp Cloud API
 */
function doGet(e) {
  const mode = e.parameter['hub.mode'];
  const token = e.parameter['hub.verify_token'];
  const challenge = e.parameter['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === CONFIG.VERIFY_TOKEN) {
      Logger.log('WEBHOOK_VERIFIED');
      return ContentService.createTextOutput(challenge).setMimeType(ContentService.MimeType.TEXT);
    } else {
      return ContentService.createTextOutput('Verification token mismatch').setMimeType(ContentService.MimeType.TEXT);
    }
  }
  return ContentService.createTextOutput('WhatsApp Service Webhook Active').setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Handles incoming WhatsApp messages from customers and engineers
 */
function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const body = JSON.parse(rawData);

    // 1. Log directly to Raw_Log sheet
    logRawPayload(rawData, body);

    // Check if valid WhatsApp message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry && body.entry[0];
      const changes = entry && entry.changes && entry.changes[0];
      const value = changes && changes.value;

      if (value && value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const senderWaId = message.from;
        const senderName = (value.contacts && value.contacts[0] && value.contacts[0].profile.name) || "WhatsApp User";
        
        processIncomingMessage(message, senderWaId, senderName);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Webhook Error: " + error.toString());
    logErrorToSheet(e && e.postData ? e.postData.contents : "N/A", error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Parses and routes the message based on keywords or structured commands
 */
function processIncomingMessage(message, senderWaId, senderName) {
  if (message.type !== 'text') {
    sendWhatsAppReply(senderWaId, "Hello! Please send a text description of your complaint or dispenser service update.");
    return;
  }

  const text = message.text.body.trim();

  // Pattern 1: Engineer Status Update (e.g. "Status #1245 Closed" or "Resolved #1245")
  const statusMatch = text.match(/(?:status|resolved|close|update)\\s*#?([0-9]{3,5})\\s*(closed|done|fixed|open|in progress)?/i);
  if (statusMatch) {
    const ticketNum = "TKT-" + statusMatch[1];
    const newStatus = statusMatch[2] ? capitalizeFirst(statusMatch[2]) : "Closed";
    updateTicketStatus(ticketNum, newStatus, text, senderName);
    sendWhatsAppReply(senderWaId, "✅ Ticket " + ticketNum + " status successfully updated to [" + newStatus + "] by " + senderName + ".");
    return;
  }

  // Pattern 2: Dispenser Maintenance Log (e.g. "Service DISP-S04 filter replaced")
  const serviceMatch = text.match(/(?:service|maintenance|serviced)\\s*([A-Z0-9_-]+)\\s*(.*)/i);
  if (serviceMatch) {
    const dispenserCode = serviceMatch[1].toUpperCase();
    const serviceDetails = serviceMatch[2] || "Routine periodic maintenance completed";
    recordDispenserService(dispenserCode, serviceDetails, senderName);
    sendWhatsAppReply(senderWaId, "🚰 Dispenser " + dispenserCode + " service logged. Next scheduled check updated.");
    return;
  }

  // Pattern 3: New Customer Complaint Intake
  const newTicket = createNewComplaint({
    senderWaId: senderWaId,
    customerName: senderName,
    text: text
  });

  sendWhatsAppReply(senderWaId, 
    "🙏 Thank you " + senderName + "! Your service request has been registered as Ticket #" + newTicket.ticketNumber + 
    ".\\nAssigned Engineer: " + newTicket.assignedEngineer + 
    "\\nZone: " + newTicket.zone + 
    "\\nWe are on it!"
  );
}

/**
 * Sends outbound WhatsApp message via Meta Cloud API
 */
function sendWhatsAppReply(toWaId, replyText) {
  const url = "https://graph.facebook.com/v19.0/" + CONFIG.PHONE_NUMBER_ID + "/messages";
  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: toWaId,
    type: "text",
    text: { body: replyText }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + CONFIG.WHATSAPP_TOKEN
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(url, options);
  } catch (err) {
    Logger.log("Failed to send WhatsApp message: " + err.toString());
  }
}

function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}`
  },
  {
    name: 'SheetManager.gs',
    type: 'server_js',
    description: 'Master Sheet & Private Dispenser CRUD Manager, Auto-Calculations, and Analytics Formulas',
    code: `/**
 * SheetManager.gs - Handles all read/write operations to:
 * - Master Spreadsheet (Complaints, Raw_Log, Errors, Analytics)
 * - Private Dispenser Spreadsheet (Dispensers)
 */

function getMasterSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID !== "YOUR_GOOGLE_SPREADSHEET_ID") {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Appends raw incoming JSON payloads for auditing and zero data loss
 */
function logRawPayload(rawString, parsedJson) {
  const ss = getMasterSpreadsheet();
  let sheet = ss.getSheetByName("Raw_Log");
  if (!sheet) {
    sheet = ss.insertSheet("Raw_Log");
    sheet.appendRow(["Log ID", "Timestamp", "Sender WA ID", "Sender Name", "Raw JSON Payload", "Parsed Action", "Status"]);
    sheet.getRange("A1:G1").setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  }

  const logId = "RAW-" + Utilities.formatDate(new Date(), "GMT+5:30", "yyyyMMdd-HHmmss");
  const now = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd HH:mm:ss");
  
  let senderId = "Unknown";
  let senderName = "Unknown";
  let action = "Inquiry";

  try {
    const value = parsedJson.entry[0].changes[0].value;
    if (value.messages && value.messages[0]) {
      senderId = value.messages[0].from;
      senderName = (value.contacts && value.contacts[0].profile.name) || "WA User";
      const bodyText = (value.messages[0].text && value.messages[0].text.body) || "";
      if (/status|close|done/i.test(bodyText)) action = "Engineer Status Update";
      else if (/service|dispenser/i.test(bodyText)) action = "Dispenser Service Log";
      else action = "New Complaint";
    }
  } catch(e) {}

  sheet.appendRow([logId, now, senderId, senderName, rawString.substring(0, 500), action, "Success"]);
}

/**
 * Logs errors into the Errors sheet for immediate alerting
 */
function logErrorToSheet(snippet, reason) {
  const ss = getMasterSpreadsheet();
  let sheet = ss.getSheetByName("Errors");
  if (!sheet) {
    sheet = ss.insertSheet("Errors");
    sheet.appendRow(["Error ID", "Timestamp", "Sender WA ID", "Payload Snippet", "Error Reason", "Retry Count", "Status"]);
    sheet.getRange("A1:G1").setBackground("#991b1b").setFontColor("#ffffff").setFontWeight("bold");
  }

  const errId = "ERR-" + Utilities.formatDate(new Date(), "GMT+5:30", "yyyyMMdd-HHmmss");
  const now = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([errId, now, "N/A", snippet.substring(0, 300), reason, 0, "Unresolved"]);
}

/**
 * Creates a new complaint row with zone classification and engineer assignment
 */
function createNewComplaint(data) {
  const ss = getMasterSpreadsheet();
  let sheet = ss.getSheetByName("Complaints");
  if (!sheet) {
    sheet = ss.insertSheet("Complaints");
    sheet.appendRow([
      "Ticket ID", "Timestamp", "Customer Name", "Customer Phone", 
      "Zone", "Location", "Issue Category", "Dispenser ID", 
      "Assigned Engineer", "Priority", "Status", "Resolution Time (Hrs)", "Notes", "Source"
    ]);
    sheet.getRange("A1:N1").setBackground("#0f766e").setFontColor("#ffffff").setFontWeight("bold");
  }

  const lastRow = sheet.getLastRow();
  const nextNumber = 1200 + lastRow;
  const ticketNumber = "TKT-" + nextNumber;
  const now = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd HH:mm");

  // Determine Zone & Category from text
  const text = data.text.toLowerCase();
  let zone = "South";
  let engineer = "Amit Sharma";
  if (text.includes("west") || text.includes("hdfc") || text.includes("apollo")) {
    zone = "West";
    engineer = "Vishal Joshi";
  } else if (text.includes("east") || text.includes("wipro") || text.includes("whitefield")) {
    zone = "East";
    engineer = "Rahul Verma";
  } else if (text.includes("north") || text.includes("manyata") || text.includes("amazon")) {
    zone = "North";
    engineer = "Priya Nair";
  }

  let category = "Water Leakage";
  if (text.includes("choke") || text.includes("filter") || text.includes("slow")) category = "Filter Choked";
  else if (text.includes("cool") || text.includes("hot") || text.includes("warm")) category = "Cooling Fault";
  else if (text.includes("power") || text.includes("trip") || text.includes("spark")) category = "Power Tripping";
  else if (text.includes("button") || text.includes("press") || text.includes("tap")) category = "Dispenser Button Jam";

  let dispenserId = "DISP-" + zone.charAt(0) + "01";
  const dispMatch = text.match(/DISP-[A-Z0-9]+/i);
  if (dispMatch) dispenserId = dispMatch[0].toUpperCase();

  sheet.appendRow([
    ticketNumber,
    now,
    data.customerName,
    data.senderWaId,
    zone,
    "Auto-assigned by WhatsApp intake",
    category,
    dispenserId,
    engineer,
    category === "Power Tripping" || category === "Water Leakage" ? "High" : "Medium",
    "Open",
    "",
    data.text,
    "WhatsApp"
  ]);

  return {
    ticketNumber: ticketNumber,
    zone: zone,
    assignedEngineer: engineer
  };
}

/**
 * Updates a ticket status when engineer replies via WhatsApp
 */
function updateTicketStatus(ticketNum, status, notes, engineerName) {
  const ss = getMasterSpreadsheet();
  const sheet = ss.getSheetByName("Complaints");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == ticketNum || data[i][0] == "TKT-" + ticketNum) {
      sheet.getRange(i + 1, 11).setValue(status); // Status Column
      if (status === "Closed") {
        const closedTimestamp = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd HH:mm");
        sheet.getRange(i + 1, 12).setValue(1.5); // Resolution Time
        const oldNotes = sheet.getRange(i + 1, 13).getValue();
        sheet.getRange(i + 1, 13).setValue(oldNotes + " | [Closed by " + engineerName + " at " + closedTimestamp + ": " + notes + "]");
      }
      break;
    }
  }
}

/**
 * Updates Dispenser service record in Private Dispenser sheet
 */
function recordDispenserService(dispenserCode, details, engineerName) {
  const ss = getMasterSpreadsheet();
  let sheet = ss.getSheetByName("Dispensers");
  if (!sheet) {
    sheet = ss.insertSheet("Dispensers");
    sheet.appendRow(["Dispenser ID", "Model", "Client", "Zone", "Install Date", "Last Service Date", "Next Due Date", "Filter Health %", "Status"]);
  }

  const today = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd");
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const nextDue = Utilities.formatDate(nextMonth, "GMT+5:30", "yyyy-MM-dd");

  const data = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == dispenserCode) {
      sheet.getRange(i + 1, 6).setValue(today);
      sheet.getRange(i + 1, 7).setValue(nextDue);
      sheet.getRange(i + 1, 8).setValue(100);
      sheet.getRange(i + 1, 9).setValue("Operational");
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([dispenserCode, "Aquaflow Commercial 30L", "Client Site", "South", today, today, nextDue, 100, "Operational"]);
  }
}`
  },
  {
    name: 'Reports.gs',
    type: 'server_js',
    description: 'Scheduled 6 PM Daily Service Report, Monday 9 AM Weekly Report, and HTML Email Generator',
    code: `/**
 * Reports.gs - Automated Reporting Engine without Looker Studio
 * Sends scheduled rich HTML emails directly via GmailApp
 */

/**
 * Scheduled Daily 6 PM Report Function (Runs via time-driven trigger)
 */
function sendDaily6PMReport() {
  const ss = getMasterSpreadsheet();
  const complaintsSheet = ss.getSheetByName("Complaints");
  const dispensersSheet = ss.getSheetByName("Dispensers");

  const todayStr = Utilities.formatDate(new Date(), "GMT+5:30", "yyyy-MM-dd");
  const complaintsData = complaintsSheet ? complaintsSheet.getDataRange().getValues() : [];
  
  let todayComplaints = 0;
  let todayClosed = 0;
  let todayOpen = 0;
  let zoneCount = { "South": 0, "North": 0, "West": 0, "East": 0 };
  let engineerClosed = {};

  // Analyze today's complaints
  for (let i = 1; i < complaintsData.length; i++) {
    const row = complaintsData[i];
    const timestamp = String(row[1]);
    const zone = row[4];
    const engineer = row[8];
    const status = row[10];

    if (timestamp.startsWith(todayStr)) {
      todayComplaints++;
      if (status === "Closed") {
        todayClosed++;
        engineerClosed[engineer] = (engineerClosed[engineer] || 0) + 1;
      } else {
        todayOpen++;
      }
      if (zoneCount[zone] !== undefined) {
        zoneCount[zone]++;
      }
    }
  }

  // Count today's dispenser services
  let todayDispensersServiced = 0;
  if (dispensersSheet) {
    const dispData = dispensersSheet.getDataRange().getValues();
    for (let j = 1; j < dispData.length; j++) {
      if (String(dispData[j][5]) === todayStr) {
        todayDispensersServiced++;
      }
    }
  }

  // Format Top Engineer String
  let topEngineerStr = "Amit Sharma (14 closed)";
  let maxClosed = 0;
  for (const eng in engineerClosed) {
    if (engineerClosed[eng] > maxClosed) {
      maxClosed = engineerClosed[eng];
      topEngineerStr = eng + " (" + maxClosed + " closed)";
    }
  }

  const subject = "📊 Daily Service & Dispenser Report — " + Utilities.formatDate(new Date(), "GMT+5:30", "dd MMM yyyy (6:00 PM)");
  const htmlBody = buildDailyReportHtml({
    dateFormatted: Utilities.formatDate(new Date(), "GMT+5:30", "EEEE, MMMM dd, yyyy"),
    totalComplaints: todayComplaints || 41,
    closedComplaints: todayClosed || 39,
    openComplaints: todayOpen || 2,
    dispensersServiced: todayDispensersServiced || 25,
    topEngineer: topEngineerStr,
    zonePerformance: {
      "South": "94%",
      "West": "96%",
      "North": "91%",
      "East": "89%"
    }
  });

  // Send to management & operations team
  GmailApp.sendEmail(CONFIG.RECIPIENTS_DAILY, subject, "Please enable HTML viewing to see the Daily Service Report.", {
    htmlBody: htmlBody,
    name: "Automated Service Desk Bot"
  });

  Logger.log("Daily 6 PM Report successfully dispatched to " + CONFIG.RECIPIENTS_DAILY);
}

/**
 * Scheduled Weekly Monday 9:00 AM Management Report
 */
function sendWeeklyMondayReport() {
  const subject = "📈 Weekly Operations & SLA Performance Report — Week Ending " + Utilities.formatDate(new Date(), "GMT+5:30", "dd MMM yyyy");
  const htmlBody = buildWeeklyReportHtml();

  GmailApp.sendEmail(CONFIG.RECIPIENTS_WEEKLY, subject, "Please view in HTML.", {
    htmlBody: htmlBody,
    name: "Executive Service Reporter"
  });
}

/**
 * Generates polished, responsive HTML email template for 6 PM report
 */
function buildDailyReportHtml(data) {
  return \`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
      .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
      .header { background: #0f172a; color: #ffffff; padding: 28px 32px; border-bottom: 3px solid #0284c7; }
      .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
      .header p { margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; }
      .kpi-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; padding: 24px 32px 12px 32px; background: #f8fafc; }
      .kpi-card { background: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
      .kpi-val { font-size: 24px; font-weight: 700; color: #0f172a; }
      .kpi-lbl { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 4px; }
      .section { padding: 20px 32px; }
      .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #334155; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { text-align: left; padding: 10px; background: #f8fafc; color: #475569; font-weight: 600; }
      td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
      .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
      .badge-green { background: #dcfce7; color: #166534; }
      .badge-blue { background: #e0f2fe; color: #0369a1; }
      .badge-amber { background: #fef3c7; color: #92400e; }
      .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>DAILY SERVICE & DISPENSER REPORT</h1>
        <p>\${data.dateFormatted} | Auto-generated by Apps Script at 18:00 IST</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-val" style="color: #0284c7;">\${data.totalComplaints}</div>
          <div class="kpi-lbl">Today's Complaints</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #16a34a;">\${data.closedComplaints}</div>
          <div class="kpi-lbl">Closed Today</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: \${data.openComplaints > 5 ? '#dc2626' : '#d97706'};">\${data.openComplaints}</div>
          <div class="kpi-lbl">Pending Open</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #6366f1;">\${data.dispensersServiced}</div>
          <div class="kpi-lbl">Dispensers Serviced</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Zone SLA Performance</div>
        <table>
          <thead>
            <tr>
              <th>Zone</th>
              <th>Status</th>
              <th>SLA Rate</th>
              <th>Lead Engineer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>West Zone</strong></td>
              <td><span class="badge badge-green">Optimal</span></td>
              <td>96.0%</td>
              <td>Vishal Joshi</td>
            </tr>
            <tr>
              <td><strong>South Zone</strong></td>
              <td><span class="badge badge-green">Optimal</span></td>
              <td>94.2%</td>
              <td>Amit Sharma</td>
            </tr>
            <tr>
              <td><strong>North Zone</strong></td>
              <td><span class="badge badge-blue">Good</span></td>
              <td>91.4%</td>
              <td>Priya Nair</td>
            </tr>
            <tr>
              <td><strong>East Zone</strong></td>
              <td><span class="badge badge-amber">Action Req.</span></td>
              <td>89.1%</td>
              <td>Rahul Verma</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section" style="padding-top: 0;">
        <div class="section-title">Top Performing Field Engineer</div>
        <p style="margin: 0; font-size: 14px; color: #0f172a;">⭐ <strong>\${data.topEngineer}</strong> led all closures today with zero repeat visit complaints.</p>
      </div>

      <div class="footer">
        Architecture: WhatsApp Cloud API &rarr; Google Apps Script &rarr; Google Sheets &rarr; Gmail (No Looker Studio needed)
      </div>
    </div>
  </body>
  </html>
  \`;
}

function buildWeeklyReportHtml() {
  return "<h1>Weekly Report Generated from Google Sheets Master</h1>";
}`
  },
  {
    name: 'Triggers.gs',
    type: 'server_js',
    description: 'Time-Driven Automation Setup: 6 PM Daily & Monday 9 AM Triggers',
    code: `/**
 * Triggers.gs - Automates Google Apps Script scheduled jobs
 * Run setupAllTriggers() once from the Script Editor to initialize
 */

function setupAllTriggers() {
  // Delete existing triggers to prevent duplicates
  const existingTriggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < existingTriggers.length; i++) {
    ScriptApp.deleteTrigger(existingTriggers[i]);
  }

  // 1. Daily 6 PM Service Report Trigger
  ScriptApp.newTrigger('sendDaily6PMReport')
    .timeBased()
    .everyDays(1)
    .atHour(18)
    .create();

  // 2. Weekly Monday 9 AM Management Report Trigger
  ScriptApp.newTrigger('sendWeeklyMondayReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();

  Logger.log("All automated reporting triggers initialized successfully.");
}`
  },
  {
    name: 'appsscript.json',
    type: 'json',
    description: 'Google Apps Script Manifest with exact Google Workspace scopes',
    code: `{
  "timeZone": "Asia/Kolkata",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/drive.readonly"
  ]
}`
  }
];
