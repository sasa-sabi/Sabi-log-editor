"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.editAdmin = exports.notion = exports.notionDatabaseID = exports.notionToken = exports.footerContent = exports.topIconContent = exports.headerContent = exports.cssContent = exports.readAPIpass = exports.readStringFromFile = void 0;
const vscode = require("vscode");
const client_1 = require("@notionhq/client");
const fs = require("fs");
const path = require("path");
const nn = require("./func/notion");
const dl = require("./func/download");
const cv = require("./func/convert");
const textpath = path.join(__dirname, "text\\");
// 外部テキストの読み取り
function readStringFromFile(filePath) {
    try {
        const data = fs.readFileSync(textpath + filePath, "utf8");
        return data;
    }
    catch (error) {
        console.error("ファイルの読み込みエラー:", error.message);
        return null;
    }
}
exports.readStringFromFile = readStringFromFile;
function readAPIpass(key) {
    try {
        const data = fs.readFileSync(textpath + "notionAPI.txt", "utf8");
        if (key === 0) {
            const notionTokenMatch = data.match(/notionToken\s*:\s*"([^"]+)"/);
            console.log(notionTokenMatch[1]);
            return notionTokenMatch[1];
        }
        else {
            const notionDatabaseIDMatch = data.match(/notionDatabaseID\s*:\s*"([^"]+)"/);
            console.log(notionDatabaseIDMatch[1]);
            return notionDatabaseIDMatch[1];
        }
    }
    catch (error) {
        console.error("ファイルの読み込みエラー:", error.message);
        return null;
    }
}
exports.readAPIpass = readAPIpass;
exports.cssContent = '<style type="text/css">' + readStringFromFile("style.css") + "</style>";
exports.headerContent = readStringFromFile("header.html");
exports.topIconContent = readStringFromFile("topIcons.html");
exports.footerContent = readStringFromFile("footer.html");
exports.notionToken = readAPIpass(0);
exports.notionDatabaseID = readAPIpass(1);
// トークン読み込み
exports.notion = new client_1.Client({ auth: exports.notionToken, });
// markdownのビュー
function getWebviewContent(marks) {
    return `<!DOCTYPE html>
			<html lang="ja">
				<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${exports.cssContent}
				</head>
				<body>
			  ${marks}
				</body>
			</html>`;
}
function getAdmin() {
    const adminContent = readStringFromFile("admin.csv");
    // バイナリデータを文字列に変換
    const csvText = Buffer.from(adminContent).toString("utf-8");
    // 改行で分割
    const lines = csvText.split("\n");
    // CSVファイルが2行未満または1列目が存在しない場合
    if (lines.length < 2 || lines[1].split(",")[0] === "") {
        throw new Error();
    }
    return lines;
}
function editAdmin(archivenum, arttitle, arttag1, arttag2, artheader) {
    const csvContent = getAdmin();
    const addData = [["", archivenum, arttitle, arttag1, arttag2, artheader]];
    const addContent = addData.map((row) => row.join(",")).join("\n");
    const csvdata = csvContent.map((row) => row.split(","));
    csvdata[1][0] = archivenum;
    const newContent = csvdata.map((row) => row.join(",")).join("\n");
    const newcsvContent = newContent + "\n" + addContent;
    fs.writeFileSync(textpath + "admin.csv", newcsvContent, "utf-8");
}
exports.editAdmin = editAdmin;
;
function activate(context) {
    // セレクトボタンを追加
    const selectButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, -10);
    selectButton.text = "$(list-selection)Notion";
    selectButton.tooltip = "Download as markdown from Notion";
    selectButton.command = "sabilog.savemd";
    selectButton.show();
    context.subscriptions.push(vscode.commands.registerCommand("sabilog.savemd", async () => {
        var selectTitle = nn.getPageTitle(exports.notionDatabaseID);
        const selectedOption = await vscode.window.showQuickPick(selectTitle, {
            placeHolder: "Choose an option.",
        });
        if (selectedOption) {
            const selecttitle = selectedOption;
            const selectpageId = nn.pageIdDictionary[selectedOption];
            try {
                const csvContent = getAdmin();
                // 2行1列目のセルを抽出
                const artlength = csvContent[1].split(",")[0];
                const archivenum = (parseInt(artlength) + 1).toString();
                dl.downloadMarkdown(selectpageId, selecttitle, archivenum);
            }
            catch (error) {
                const csvdata = [
                    ["Length", "Number", "Title", "Tag1", "Tag2", "Header"],
                    ["1", "", "", "", "", ""]
                ];
                const csvContent = csvdata.map((row) => row.join(",")).join("\n");
                fs.writeFileSync(textpath + "admin.csv", csvContent, "utf-8");
                dl.downloadMarkdown(selectpageId, selecttitle, "1");
            }
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand("sabilog.viewmd", () => {
        const panel = vscode.window.createWebviewPanel("markdown editor", "MARKS EDITOR", vscode.ViewColumn.One, {});
        const updateWebview = () => {
            const editor = vscode.window.activeTextEditor;
            if (editor !== undefined) {
                panel.webview.html = getWebviewContent(cv.makeDisplay(vscode.window.activeTextEditor));
            }
        };
        setInterval(updateWebview, 1000); // 1000msごとに表示切り替え
    }));
    context.subscriptions.push(vscode.commands.registerCommand("sabilog.downhtml", () => {
        try {
            const csvContent = getAdmin();
            // 2行1列目のセルを抽出
            const artlength = csvContent[1].split(",")[0];
            const archivenum = (parseInt(artlength) + 1).toString();
            dl.downloadHtml(archivenum);
        }
        catch (error) {
            const csvdata = [
                ["Length", "Number", "Title", "Tag1", "Tag2", "Header"],
                ["1", "", "", "", "", ""],
            ];
            const csvContent = csvdata.map((row) => row.join(",")).join("\n");
            fs.writeFileSync(textpath + "admin.csv", csvContent, "utf-8");
            dl.downloadHtml("1");
        }
    }));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map