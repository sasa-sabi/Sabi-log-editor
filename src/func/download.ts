import * as vscode from "vscode";

const path = require("path");
const ex = require("../extension");
const nn = require("./notion");
const cv = require("./convert");

export const downloadMarkdown = async (
  pageId: string,
  pagetitle: string,
  filenumber: string
) => {
  const filename = "art-" + filenumber + ".md";

  // ファイルパスの準備
  const editor = vscode.window.activeTextEditor;
  const filePath = editor?.document?.fileName || "";
  const directoryPath = path.dirname(filePath);
  const newfilePath = path.join(directoryPath, filename);

  // テキストをUint8Arrayに変換
  const script = await nn.getPagetext(pageId, pagetitle);
  const blob: Uint8Array = Buffer.from(script);

  // ファイルへ書き込む
  await vscode.workspace.fs.writeFile(vscode.Uri.file(newfilePath), blob);
  console.log(newfilePath);
  vscode.window.showInformationMessage("downloaded!");

  return;
};

export const downloadHtml = async (artnumber:string) => {
  // ファイルを読み込む
  const editor = vscode.window.activeTextEditor;
  const filePath = editor?.document?.fileName || "";
  const directoryPath = path.dirname(filePath);
  const newfilePath = path.join(directoryPath, "ho-"+artnumber+".html");

  if (editor !== undefined) {
    const arttext = editor.document.getText();
    const pages = arttext.split("—p");
    const topwindow = pages[0].split("---");
    const header = topwindow[0].split("\n\n");

    const headertitle = header[0].substring(2);
    const headersent = header[2];
    const imageurl = header[1].substring(1);

    const archivesent = header[6].substring(6);
    const tag1 = header[4].substring(6);
    const tag2 = header[5].substring(6);

    for (var i = 0; i < pages.length; i++) {
      const pagenumber = "-" + `${i + 1}`;
      const script = cv.makeDownloadFile(
        pages[i],
        i,
        pages.length,
        artnumber,
        pagenumber,
        headertitle,
        headersent,
        imageurl,
        archivesent
      );
      var newfilepath = "";
      if (pages.length > 1) {
        newfilepath = newfilePath.replace(/\.html$/, pagenumber + ".html");
      }
      else {
        newfilepath = newfilePath;
      }

      // テキストをUint8Arrayに変換
      const blob: Uint8Array = Buffer.from(script);

      // ファイルへ書き込む
      await vscode.workspace.fs.writeFile(vscode.Uri.file(newfilepath), blob);
      console.log(newfilepath);
      vscode.window.showInformationMessage("downloaded!");
    }
  };
};

const downloadArchive = async (
  artnumber: string,
  arttitle: string,
  arttag1: string,
  arttag2: string,
  artheader: string
) => {
  var mainArchive = "";
  for (var i = 0; i < parseInt(artnumber); i++){
    console.log("停止機能");
  }
  ex.editAdmin(artnumber, arttitle, arttag1, arttag2, artheader);
};