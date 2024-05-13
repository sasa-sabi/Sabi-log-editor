import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

// スクロールバーの表示
let timeout: NodeJS.Timer | undefined = undefined;

// create a decorator type that we use to decorate large numbers
export const labelDecorationType = vscode.window.createTextEditorDecorationType({
  color: "#569cd6"
});

export const sabilogDecorationType = vscode.window.createTextEditorDecorationType({
  color: "#69dfff"
});

export const windowSeparateDecorationType = vscode.window.createTextEditorDecorationType({
  color: "#69dfff"
});

export const pageSeparateDecorationType = vscode.window.createTextEditorDecorationType({
  color: "#69dfff"
});

export function updateDecorations(activeEditor: vscode.TextEditor){
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
  const largeNumbers: vscode.DecorationOptions[] = [];

  let match;
  while (match = label.exec(text)) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Number **" + match[0] + "**",
    };
    largeNumbers.push(decoration);
  }

  activeEditor.setDecorations(labelDecorationType, largeNumbers);
}

export function triggerUpdateDecorations(throttle : boolean, editor: vscode.TextEditor) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
  if (throttle) {
    setTimeout(() => {
        updateDecorations(editor);
    }, 500);
  } else {
    updateDecorations(editor);
  }
}