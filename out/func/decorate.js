"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerUpdateDecorations = exports.updateDecorations = exports.pageSeparateDecorationType = exports.windowSeparateDecorationType = exports.sabilogDecorationType = exports.labelDecorationType = void 0;
const vscode = require("vscode");
// スクロールバーの表示
let timeout = undefined;
// create a decorator type that we use to decorate large numbers
exports.labelDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#569cd6"
});
exports.sabilogDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#69dfff"
});
exports.windowSeparateDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#69dfff"
});
exports.pageSeparateDecorationType = vscode.window.createTextEditorDecorationType({
    color: "#69dfff"
});
function updateDecorations(activeEditor) {
    if (!activeEditor) {
        return;
    }
    const label = /\-\p\s\S*/g;
    const decomemo = /\-mc\S+「\S*」/g;
    const memo = /\-m\S+「\S*」/g;
    const baloon = /\-t\S+「\S*」/g;
    const pageSeparate = /\-\-\-/g;
    const windowSeparate = /\-\-p/g;
    const text = activeEditor.document.getText();
    const largeNumbers = [];
    let match;
    while (match = label.exec(text)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const decoration = {
            range: new vscode.Range(startPos, endPos),
            hoverMessage: "Number **" + match[0] + "**",
        };
        largeNumbers.push(decoration);
    }
    activeEditor.setDecorations(exports.labelDecorationType, largeNumbers);
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