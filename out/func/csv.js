"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdmin = exports.findNumberByTitle = exports.editAdminUr = exports.editAdmin = exports.getAdminUr = exports.getAdmin = void 0;
const ex = require("../extension");
const fs = require("fs");
function getAdmin() {
    console.log(ex.textpath + "admin.csv");
    const adminContent = ex.readStringFromFile(ex.textpath + "admin.csv");
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
exports.getAdmin = getAdmin;
function getAdminUr() {
    const adminContent = ex.readStringFromFile(ex.textpath + "admin_ur.csv");
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
exports.getAdminUr = getAdminUr;
function editAdmin(archivenum, arttitle, arttag1, arttag2, artheader) {
    const csvContent = getAdmin();
    const addData = [["", archivenum, arttitle, arttag1, arttag2, artheader]];
    const addContent = addData.map((row) => row.join(",")).join("\n");
    const csvdata = csvContent.map((row) => row.split(","));
    csvdata[1][0] = archivenum;
    const newContent = csvdata.map((row) => row.join(",")).join("\n");
    const newcsvContent = newContent + "\n" + addContent;
    fs.writeFileSync(ex.textpath + "admin.csv", newcsvContent, "utf-8");
}
exports.editAdmin = editAdmin;
function editAdminUr(archivenum, arttitle, artheader) {
    const csvContent = getAdminUr();
    const addData = [["", archivenum, arttitle, "", "", artheader]];
    const addContent = addData.map((row) => row.join(",")).join("\n");
    const csvdata = csvContent.map((row) => row.split(","));
    csvdata[1][0] = archivenum;
    const newContent = csvdata.map((row) => row.join(",")).join("\n");
    const newcsvContent = newContent + "\n" + addContent;
    fs.writeFileSync(ex.textpath + "admin_ur.csv", newcsvContent, "utf-8");
}
exports.editAdminUr = editAdminUr;
function findNumberByTitle(title) {
    const Admin = getAdmin();
    for (let i = 1; i < Admin.length; i++) {
        const [, Number, Title, , ,] = Admin[i].split(",");
        if (Title === title) {
            console.log(Number);
            return Number;
        }
    }
    return null;
}
exports.findNumberByTitle = findNumberByTitle;
function updateAdmin(number, title, tag1, tag2, header) {
    const Admin = getAdmin();
    if (Admin.length > parseInt(number)) {
        const [, Number, , , ,] = Admin[parseInt(number)].split(",");
        if (Number === number) {
            Admin[parseInt(number)] = ["", number, title, tag1, tag2, header].join(",");
        }
    }
    const updatedcsvContent = Admin.join("\n");
    fs.writeFileSync(ex.textpath + "admin.csv", updatedcsvContent, "utf-8");
}
exports.updateAdmin = updateAdmin;
//# sourceMappingURL=csv.js.map