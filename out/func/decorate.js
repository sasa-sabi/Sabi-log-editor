"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerUpdateDecorations = exports.updateDecorations = exports.pageSeparateDecorationType = exports.windowSeparateDecorationType = exports.decomemoDecorationType = exports.decomemo2DecorationType = exports.decomemo1DecorationType = exports.labelDecorationType = void 0;
const vscode = require("vscode");
// スクロールバーの表示
let timeout = undefined;
// 色の定義
exports.labelDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#569cd6",
    fontWeight: 'bold',
});
exports.decomemo1DecorationType = vscode.window.createTextEditorDecorationType({
    color: "orange"
});
exports.decomemo2DecorationType = vscode.window.createTextEditorDecorationType({
    color: "blue",
    fontWeight: 'bold',
});
exports.decomemoDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#569cd6",
    fontWeight: 'bold',
});
exports.windowSeparateDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#69dfff",
    textDecoration: 'line-through',
    isWholeLine: true,
});
exports.pageSeparateDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#69dfff"
});
function updateDecorations(activeEditor) {
    if (!activeEditor) {
        return;
    }
    const text = activeEditor.document.getText();
    // 正規表現、デコレーションの定義
    const label = /^\-\p.+/gm;
    const decomemo = /^-mc([^\r\n]*?)「([\s\S]*?)」/gm;
    const memo = /^-m([^\r\n]*?)「([\s\S]*?)」/gm;
    const baloon = /^-t([^\r\n]*?)「([\s\S]*?)」/gm;
    const pageSeparate = /^---.*$/gm;
    const windowSeparate = /--p.*$/gm;
    const labelDecoration = [];
    const decomemoDecoration = [];
    const decomemo1Decoration = [];
    const decomemo2Decoration = [];
    const memoDecoration = [];
    const memo1Decoration = [];
    const memo2Decoration = [];
    const baloonDecoration = [];
    const baloon1Decoration = [];
    const baloon2Decoration = [];
    const separateDecoration = [];
    let match;
    // ラベル(-p)の色
    while (match = label.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const decoration = {
            range: new vscode.Range(startPos, endPos),
            hoverMessage: "" + match[0] + "**",
        };
        labelDecoration.push(decoration);
    }
    // 波線メモ(-mc「」)の色
    while (match = decomemo.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const decoration = {
            range: new vscode.Range(startPos, endPos),
            hoverMessage: "" + match[0] + "**",
        };
        decomemoDecoration.push(decoration);
        const matchText1 = match[1];
        const startPos1 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText1));
        const endPos1 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText1) + matchText1.length);
        const decoration1 = {
            range: new vscode.Range(startPos1, endPos1),
            hoverMessage: "Number **" + match[0] + "**",
        };
        decomemo1Decoration.push(decoration1);
        const matchText2 = match[2];
        const startPos2 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText2));
        const endPos2 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText2) + matchText2.length);
        const decoration2 = {
            range: new vscode.Range(startPos2, endPos2),
            hoverMessage: "Number **" + match[0] + "**",
        };
        decomemo2Decoration.push(decoration2);
    }
    // メモ(-m「」)の色
    while (match = memo.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const decoration = {
            range: new vscode.Range(startPos, endPos),
            hoverMessage: "" + match[0] + "**",
        };
        memoDecoration.push(decoration);
        const matchText1 = match[1];
        const startPos1 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText1));
        const endPos1 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText1) + matchText1.length);
        const decoration1 = {
            range: new vscode.Range(startPos1, endPos1),
            hoverMessage: "Number **" + match[0] + "**",
        };
        memo1Decoration.push(decoration1);
        const matchText2 = match[2];
        const startPos2 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText2));
        const endPos2 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText2) + matchText2.length);
        const decoration2 = {
            range: new vscode.Range(startPos2, endPos2),
            hoverMessage: "Number **" + match[0] + "**",
        };
        memo2Decoration.push(decoration2);
    }
    // 吹き出し(-t「」)の色
    while (match = baloon.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const decoration = {
            range: new vscode.Range(startPos, endPos),
            hoverMessage: "" + match[0] + "**",
        };
        baloonDecoration.push(decoration);
        const matchText1 = match[1];
        const startPos1 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText1));
        const endPos1 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText1) + matchText1.length);
        const decoration1 = {
            range: new vscode.Range(startPos1, endPos1),
            hoverMessage: "Number **" + match[0] + "**",
        };
        baloon1Decoration.push(decoration1);
        const matchText2 = match[2];
        const startPos2 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText2));
        const endPos2 = activeEditor.document.positionAt(match.index + match[0].indexOf(matchText2) + matchText2.length);
        const decoration2 = {
            range: new vscode.Range(startPos2, endPos2),
            hoverMessage: "Number **" + match[0] + "**",
        };
        baloon2Decoration.push(decoration2);
    }
    // ウィンドウ区切り(---)の色
    while (match = pageSeparate.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const decoration = { range: new vscode.Range(startPos, endPos) };
        separateDecoration.push(decoration);
    }
    // ページ区切り(--p)の色
    while (match = windowSeparate.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const decoration = { range: new vscode.Range(startPos, endPos) };
        separateDecoration.push(decoration);
    }
    activeEditor.setDecorations(exports.labelDecorationType, labelDecoration);
    activeEditor.setDecorations(exports.decomemoDecorationType, decomemoDecoration);
    activeEditor.setDecorations(exports.decomemo1DecorationType, decomemo1Decoration);
    activeEditor.setDecorations(exports.decomemo2DecorationType, decomemo2Decoration);
    activeEditor.setDecorations(exports.decomemoDecorationType, memoDecoration);
    activeEditor.setDecorations(exports.decomemo1DecorationType, memo1Decoration);
    activeEditor.setDecorations(exports.decomemo2DecorationType, memo2Decoration);
    activeEditor.setDecorations(exports.decomemoDecorationType, baloonDecoration);
    activeEditor.setDecorations(exports.decomemo1DecorationType, baloon1Decoration);
    activeEditor.setDecorations(exports.decomemo2DecorationType, baloon2Decoration);
    activeEditor.setDecorations(exports.windowSeparateDecorationType, separateDecoration);
}
exports.updateDecorations = updateDecorations;
function triggerUpdateDecorations(throttle, editor) {
    if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
    }
    if (throttle) {
        setTimeout(() => {
            updateDecorations(editor);
        }, 500);
    }
    else {
        updateDecorations(editor);
    }
}
exports.triggerUpdateDecorations = triggerUpdateDecorations;
//# sourceMappingURL=decorate.js.map