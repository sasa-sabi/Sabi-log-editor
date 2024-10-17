"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.notion = exports.synchronousScroll = exports.updateTickTime = exports.webviewUpdateOverTime = exports.cloudSecretKey = exports.cloudApiKey = exports.cloudName = exports.notionDatabaseID = exports.notionToken = exports.downnextContent = exports.topnextContent = exports.funcContent = exports.archiveContent = exports.footerContent = exports.topIconContent = exports.headerContent = exports.cssContent = exports.readStringFromFile = exports.textpath = void 0;
const vscode = require("vscode");
const client_1 = require("@notionhq/client");
const cloudinary_1 = require("cloudinary");
const dotenv_1 = require("dotenv");
const fs = require("fs");
const path = require("path");
const nn = require("./func/notion");
const dl = require("./func/download");
const cv = require("./func/convert");
const csv = require("./func/csv");
const deco = require("./func/decorate");
exports.textpath = path.join(__dirname.replace("out", "src"), "text\\");
// 外部テキストの読み取り
function readStringFromFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return data;
    }
    catch (error) {
        console.error("ファイルの読み込みエラー:", error.message);
        return null;
    }
}
exports.readStringFromFile = readStringFromFile;
// envファイルの読み取り
const envPath = path.join(__dirname, '../.env');
(0, dotenv_1.config)({ path: envPath });
// 外部テキスト、envファイルの設定
exports.cssContent = '<style type="text/css">' + readStringFromFile(exports.textpath + "style.css") + "</style>";
exports.headerContent = readStringFromFile(exports.textpath + "header.html");
exports.topIconContent = readStringFromFile(exports.textpath + "topIcons.html");
exports.footerContent = readStringFromFile(exports.textpath + "footer.html");
exports.archiveContent = readStringFromFile(exports.textpath + "archive.html");
exports.funcContent = readStringFromFile(exports.textpath + "func.html");
exports.topnextContent = readStringFromFile(exports.textpath + "top_next.html");
exports.downnextContent = readStringFromFile(exports.textpath + "down_next.html");
exports.notionToken = process.env.notion_token;
exports.notionDatabaseID = process.env.notion_database_ID;
exports.cloudName = process.env.cloud_name;
exports.cloudApiKey = process.env.cloud_api_key;
exports.cloudSecretKey = process.env.cloud_secret_key;
exports.webviewUpdateOverTime = process.env.webview_update_overtime;
exports.updateTickTime = Number(process.env.update_tick_time);
exports.synchronousScroll = process.env.synchronous_scroll;
// トークン読み込み
exports.notion = new client_1.Client({ auth: exports.notionToken, });
cloudinary_1.v2.config({
    cloud_name: exports.cloudName,
    api_key: exports.cloudApiKey,
    api_secret: exports.cloudSecretKey,
});
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
        ${exports.funcContent}
			</html>`;
}
// markdownの行番号取得
function getTopVisibleLine(editor) {
    const firstVisiblePosition = editor.visibleRanges[0].start;
    const lineNumber = firstVisiblePosition.line;
    const line = editor.document.lineAt(lineNumber);
    const progress = firstVisiblePosition.character / (line.text.length + 2);
    return lineNumber + progress;
}
function getBottomVisibleLine(editor) {
    const firstVisiblePosition = editor["visibleRanges"][0].end;
    const lineNumber = firstVisiblePosition.line;
    let text = "";
    if (lineNumber < editor.document.lineCount) {
        text = editor.document.lineAt(lineNumber).text;
    }
    const progress = firstVisiblePosition.character / (text.length + 2);
    return lineNumber + progress;
}
class TreeItem extends vscode.TreeItem {
    constructor(data) {
        super(data.title, data.children === undefined
            ? vscode.TreeItemCollapsibleState.None
            : vscode.TreeItemCollapsibleState.Expanded);
        this.label = data.title;
        this.command = {
            title: data.title,
            command: data.command,
        };
        this.iconPath = data.icon;
        this.children = data.children;
    }
}
class sabilog_sidebar {
    data() {
        return [
            {
                title: "markdownエディタ",
                children: [
                    {
                        title: "あいうえお",
                        command: "vsclauncherView.insertTxs",
                    },
                    {
                        title: "かきくけこ",
                        command: "vsclauncherView.insertIms",
                    },
                ],
            },
            {
                title: "親",
                children: [
                    {
                        title: "子",
                        children: [
                            {
                                title: "孫",
                                command: "vsclauncherView.showMessage",
                            },
                        ],
                    },
                ],
            },
        ];
    }
    constructor() {
        //初期値などを定義
    }
    generateTree(data) {
        let self = this;
        let tree = data;
        Object.keys(tree).forEach(function (i) {
            tree[i] = new TreeItem(tree[i]);
            if (tree[i].children !== undefined) {
                self.generateTree(tree[i].children);
            }
        });
        return tree;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element === undefined) {
            return this.generateTree(this.data());
        }
        return element.children;
    }
}
function activate(context) {
    // 設定
    let active_editor = vscode.window.activeTextEditor;
    // サイドバーを追加
    const sabil = new sabilog_sidebar();
    vscode.window.registerTreeDataProvider("sabilog_webview", sabil);
    // セレクトボタンを追加
    const selectButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, -10);
    selectButton.text = "$(list-selection)Notion";
    selectButton.tooltip = "Download as markdown from Notion";
    selectButton.command = "sabilog.savemd";
    context.subscriptions.push(selectButton);
    selectButton.show();
    // 文字色の変更
    if (active_editor) {
        deco.updateDecorations(active_editor);
    }
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        active_editor = editor;
        if (editor) {
            deco.triggerUpdateDecorations(false, active_editor);
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (active_editor && event.document === active_editor.document) {
            deco.triggerUpdateDecorations(true, active_editor);
        }
    }, null, context.subscriptions);
    // Markdownの保存
    context.subscriptions.push(vscode.commands.registerCommand("sabilog.savemd", async () => {
        var selectedho = false;
        const selectedUra = await vscode.window.showQuickPick(["article", "inside"], { placeHolder: "Choose an option.", });
        if (selectedUra) {
            if (selectedUra === "article") {
                selectedho = true;
            }
        }
        const [selectTitle, selectTag] = await nn.getPageTitle(exports.notionDatabaseID);
        const selectedOption = await vscode.window.showQuickPick(selectTitle, {
            placeHolder: "Choose an option.",
        });
        if (selectedOption) {
            const selecttitle = selectedOption;
            const selecttag = selectTag[selectTitle.indexOf(selectedOption)];
            const selectpageId = nn.pageIdDictionary[selecttitle];
            try {
                // ファイルパスの準備
                const filePath = vscode.workspace.workspaceFolders;
                var newfilePath = "";
                if (filePath && filePath.length > 0) {
                    newfilePath = path.join(filePath[0].uri?.fsPath, "article_draft\\");
                }
                // フォルダ内のファイルを取得
                const files = fs.readdirSync(newfilePath);
                let maxArtNumber = 1;
                if (selecttag !== "none") {
                    if (selectedho) {
                        var match = /art\-([\s\S]*?)\.md/.exec(selecttag);
                        if (match) {
                            maxArtNumber = Number(match[1]);
                        }
                    }
                    else {
                        var match = /ho\-([\s\S]*?)\.md/.exec(selecttag);
                        if (match) {
                            maxArtNumber = Number(match[1]);
                        }
                    }
                }
                else {
                    if (selectedho) {
                        files.forEach((file) => {
                            const match = /^art-(\d+)\.md$/.exec(file);
                            if (match) {
                                const artNumber = parseInt(match[1]);
                                if (artNumber > maxArtNumber) {
                                    maxArtNumber = artNumber;
                                }
                            }
                        });
                        maxArtNumber += 1;
                    }
                    else {
                        files.forEach((file) => {
                            const match = /^ur-(\d+)\.md$/.exec(file);
                            if (match) {
                                const artNumber = parseInt(match[1]);
                                if (artNumber > maxArtNumber) {
                                    maxArtNumber = artNumber;
                                }
                            }
                        });
                        maxArtNumber += 1;
                    }
                }
                console.log(selectpageId, selecttitle, maxArtNumber, selectedho);
                dl.downloadMarkdown(selectpageId, selecttitle, maxArtNumber, selectedho);
            }
            catch (error) {
                dl.downloadMarkdown(selectpageId, selecttitle, 1);
            }
        }
    }));
    // Markdownの変換、表示
    context.subscriptions.push(vscode.commands.registerCommand("sabilog.viewmd", () => {
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (columnToShowIn) {
            // ファイルパスの準備
            const filePath = vscode.workspace.workspaceFolders;
            var newfilePath = "";
            if (filePath && filePath.length > 0) {
                newfilePath = path.join(filePath[0].uri?.fsPath, "article_draft\\");
            }
            const panel = vscode.window.createWebviewPanel("markdown editor", "MARKS EDITOR", columnToShowIn + 1, {
                enableScripts: true
            });
            const updateWebview = async () => {
                if (active_editor !== undefined) {
                    panel.webview.html = getWebviewContent(await cv.makeDisplay(active_editor, newfilePath, 1));
                }
            };
            const updateWebviewAndImage = async () => {
                if (active_editor !== undefined) {
                    panel.webview.html = getWebviewContent(await cv.makeDisplay(active_editor, newfilePath, 2));
                }
            };
            if (exports.webviewUpdateOverTime === "true" || exports.webviewUpdateOverTime === "True") {
                // updateTickTimeごとに表示切り替え
                setInterval(updateWebview, exports.updateTickTime);
            }
            else {
                //テキストの変更
                vscode.workspace.onDidChangeTextDocument(event => {
                    if (active_editor && event.document === active_editor.document) {
                        updateWebview();
                    }
                });
                // セーブ
                vscode.workspace.onDidSaveTextDocument(event => {
                    if (active_editor && event === active_editor.document) {
                        updateWebviewAndImage();
                    }
                });
                // タブの変更
                vscode.window.onDidChangeActiveTextEditor(event => {
                    if (active_editor && event?.document === active_editor.document) {
                        updateWebview();
                    }
                });
                // テキストのスクロールを同期
                if (exports.synchronousScroll === "true" || exports.synchronousScroll === "True") {
                    vscode.window.onDidChangeTextEditorSelection(event => {
                        if (event.textEditor.document.languageId === "markdown") {
                            const firstVisibleScreenRow = getTopVisibleLine(event.textEditor);
                            const lastVisibleScreenRow = getBottomVisibleLine(event.textEditor);
                            console.log(firstVisibleScreenRow, lastVisibleScreenRow);
                            if (firstVisibleScreenRow !== undefined && lastVisibleScreenRow !== undefined) {
                                if (active_editor !== undefined) {
                                    const fileLength = active_editor.document.lineCount;
                                    const topRatio = (event.selections[0].active.line - firstVisibleScreenRow) /
                                        (lastVisibleScreenRow - firstVisibleScreenRow);
                                    const ratio = event.selections[0].active.line / fileLength;
                                    console.log(topRatio);
                                    panel.webview.postMessage({
                                        command: 'scroll',
                                        scrollYPercentage: ratio
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }
    }));
    // HTMLのダウンロード
    context.subscriptions.push(vscode.commands.registerCommand("sabilog.downhtml", async () => {
        var pattern_art = /^art\-([\s\S]*?)/;
        // ファイル名の取得
        const file_name_ar = active_editor?.document.fileName.split("\\");
        if (file_name_ar) {
            const file_name_num = file_name_ar.length - 1;
            const file_name = file_name_ar[file_name_num];
            // artかurかの判別
            var file_bool;
            if (pattern_art.test(file_name)) {
                file_bool = true;
            }
            else {
                file_bool = false;
            }
            // 現在の日付を取得
            const currentDate = new Date();
            // 一週間後の日付を計算
            const oneWeekLater = new Date();
            oneWeekLater.setDate(currentDate.getDate() + 7);
            // 日付の選択肢を生成
            const dateOptions = [];
            let currentDatePointer = currentDate;
            while (currentDatePointer <= oneWeekLater) {
                dateOptions.push({
                    label: currentDatePointer.toLocaleDateString(),
                    description: currentDatePointer.toDateString(),
                });
                currentDatePointer.setDate(currentDatePointer.getDate() + 1);
            }
            const selectedDate = await vscode.window.showQuickPick(dateOptions, {
                placeHolder: "Choose a date.",
            });
            if (selectedDate) {
                var uploadDate = "YYYY-MM-DD";
                uploadDate = selectedDate.label.split("/").join("-");
                try {
                    if (file_bool) {
                        const csvContent = csv.getAdmin();
                        // 2行1列目のセルを抽出
                        const artlength = csvContent[1].split(",")[0];
                        const archivenum = (parseInt(artlength) + 1).toString();
                        dl.downloadHtml(archivenum, uploadDate, file_bool);
                    }
                    else {
                        const csvContent = csv.getAdminUr();
                        // 2行1列目のセルを抽出
                        const artlength = csvContent[1].split(",")[0];
                        const archivenum = (parseInt(artlength) + 1).toString();
                        dl.downloadHtml(archivenum, uploadDate, file_bool);
                    }
                }
                catch (error) {
                    if (file_bool) {
                        const csvdata = [
                            ["Length", "Number", "Title", "Tag1", "Tag2", "Header"],
                            ["1", "", "", "", "", ""],
                        ];
                        const csvContent = csvdata.map((row) => row.join(",")).join("\n");
                        fs.writeFileSync(exports.textpath + "admin.csv", csvContent, "utf-8");
                        dl.downloadHtml("1", uploadDate, file_bool);
                    }
                    else {
                        const csvdata = [
                            ["Length", "Number", "Title", "Tag1", "Tag2", "Header"],
                            ["1", "", "", "", "", ""],
                        ];
                        const csvContent = csvdata.map((row) => row.join(",")).join("\n");
                        fs.writeFileSync(exports.textpath + "admin_ur.csv", csvContent, "utf-8");
                        dl.downloadHtml("1", uploadDate, file_bool);
                    }
                }
            }
        }
    }));
    // Markdownのアップデート
    context.subscriptions.push(vscode.commands.registerCommand("sabilog.updatemd", async () => {
        // ファイルパスの準備
        const filePath = vscode.workspace.workspaceFolders;
        var newfilePath = "";
        if (filePath && filePath.length > 0) {
            newfilePath = path.join(filePath[0].uri?.fsPath, "article_draft\\");
        }
        const file_name_ar = active_editor?.document.fileName.split("\\");
        if (file_name_ar) {
            const file_name_num = file_name_ar.length - 1;
            const file_name = file_name_ar[file_name_num];
            var pattern_art = /^art\-([\s\S]*?)/;
            var file_ho;
            if (pattern_art.test(file_name)) {
                file_ho = true;
            }
            else {
                file_ho = false;
            }
            var pattern_title = /^#\s+([\s\S]*?)$/;
            if (active_editor) {
                const pagetitle = active_editor.document.getText().split("\n")[0];
                var match = pattern_title.exec(pagetitle);
                if (match) {
                    nn.createNotionPage(match[1], cv.makeUpdateFile(active_editor, newfilePath), file_name, file_ho);
                }
            }
        }
    }));
    // デバッグ用
    context.subscriptions.push(vscode.commands.registerCommand("sabilog.debug", async () => {
        /*
        csv.findNumberByTitle("素晴らしきボドゲ回");
        csv.updateAdmin("10", "aaa", "a", "bbb", "b");
        dl.moveImage(
          "https://res.cloudinary.com/dtifkcohv/image/upload/v1718080339/art-draft/file_x2vko2.jpg",
          "art-9"
        );
        // */
        const line_serch = vscode.window.activeTextEditor?.document.getText().split("\n");
        var lineNumber = 1;
        var pattern_image = /^\!https\:\/\/res\.cloudinary\.com([\s\S]*?)$/;
        if (line_serch) {
            for (var i = 0; i < line_serch?.length; i++) {
                var match = pattern_image.exec(line_serch[i]);
                if (match) {
                    console.log("get");
                    console.log(match);
                    if (line_serch[i].includes(`https://res.cloudinary.com/dtifkcohv/image/upload/v1718080419/art-draft/file_fuzky8.jpg`)) {
                        lineNumber += i;
                        console.log(lineNumber + "update");
                    }
                }
            }
        }
    }));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map