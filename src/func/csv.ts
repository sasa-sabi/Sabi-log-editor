const ex = require("../extension");
const fs = require("fs");

export function getAdmin() {
  const adminContent = ex.readStringFromFile(ex.textpath+"admin.csv");

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

export function getAdminUr() {
  const adminContent = ex.readStringFromFile(ex.textpath+"admin_ur.csv");

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

export function editAdmin(
  archivenum: string,
  arttitle: string,
  arttag1: string,
  arttag2: string,
  artheader: string
) {
  const csvContent = getAdmin();
  const addData = [["", archivenum, arttitle, arttag1, arttag2, artheader]];
  const addContent = addData.map((row) => row.join(",")).join("\n");

  const csvdata = csvContent.map((row) => row.split(","));
  csvdata[1][0] = archivenum;
  const newContent = csvdata.map((row) => row.join(",")).join("\n");

  const newcsvContent = newContent + "\n" + addContent;
  fs.writeFileSync(ex.textpath + "admin.csv", newcsvContent, "utf-8");
}

export function editAdminUr(
  archivenum: string,
  arttitle: string,
  artheader: string
) {
  const csvContent = getAdminUr();
  const addData = [["", archivenum, arttitle, "", "", artheader]];
  const addContent = addData.map((row) => row.join(",")).join("\n");

  const csvdata = csvContent.map((row) => row.split(","));
  csvdata[1][0] = archivenum;
  const newContent = csvdata.map((row) => row.join(",")).join("\n");

  const newcsvContent = newContent + "\n" + addContent;
  fs.writeFileSync(ex.textpath + "admin_ur.csv", newcsvContent, "utf-8");
}
