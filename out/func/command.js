"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
// コマンドの作成
class Completions {
    provideCompletionItems() {
        const simpleCompletion = new vscode.CompletionItem('Hello World');
        return [simpleCompletion];
    }
}
exports.default = Completions;
//# sourceMappingURL=command.js.map