import * as vscode from "vscode";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

const fs = require("fs");
const path = require("path");
const ex = require("../extension");
const nn = require("./notion");
const cv = require("./convert");
const csv = require("./csv");
const dic = require("../text/dictional");

export const downloadMarkdown = async (
  pageId: string,
  pagetitle: string,
  filenumber: string,
  selectHo: boolean
) => {
  var filename: string = "";
  if (selectHo) {
    filename = "art-" + filenumber + ".md";
  }
  else {
    filename = "ur-" + filenumber + ".md";
  }

  // ファイルパスの準備
  const filePath = vscode.workspace.workspaceFolders;
  var newfilePath = "";
  if (filePath && filePath.length > 0) {
    newfilePath = path.join(
      filePath[0].uri?.fsPath,
      "article_draft\\" + filename
    );
  }

  // テキストをUint8Arrayに変換
  const script = await nn.getPagetext(pageId, pagetitle, filenumber, selectHo);
  const blob: Uint8Array = Buffer.from(script);

  // ファイルへ書き込む
  await vscode.workspace.fs.writeFile(vscode.Uri.file(newfilePath), blob);
  console.log(newfilePath);
  vscode.window.showInformationMessage("downloaded!");

  return;
};

export const downloadHtml = async (artnumber: string, artdate: string, artbool: boolean) => {
  // ファイルを読み込む
  const editor = vscode.window.activeTextEditor;
  const filePath = vscode.workspace.workspaceFolders;
  var newfilePath = "";
  var imageFolder = "";
  if (filePath && filePath.length > 0) {
    if (artbool) {
      newfilePath = path.join(
        filePath[0].uri?.fsPath,
        "articles\\ho-" + cv.formatNumber(artnumber) + ".html"
      );
      imageFolder = "art-" + artnumber;
    }
    else {
      newfilePath = path.join(
        filePath[0].uri?.fsPath,
        "ur\\ur-" + cv.formatNumber(artnumber) + ".html"
      );
    }
  }

  if (editor) {
    const arttext = editor.document.getText();
    const pages = arttext.split(/\-\-p/);
    const topwindow = pages[0].split(/\-\-\-/);
    console.log(topwindow);
    
    const header = topwindow[0].split("\n\n");

    const headertitle = header[0].substring(2);
    const headersent = header[2];
    const imageurl = header[1].substring(1);

    const archivesent = header[5].substring(6);
    const tag1 = header[3].substring(6);
    const tag2 = header[4].substring(6);

    var multipage = 0;

    for (var i = 0; i < pages.length; i++) {
      const pagenumber = "-" + `${i + 1}`;
      multipage = i;
      const script = await cv.makeDownloadFile(
        pages[i],
        i,
        pages.length,
        artnumber,
        pagenumber,
        headertitle,
        headersent,
        imageurl,
        archivesent,
        pages.length,
        pages[i + 1],
        imageFolder
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

    if (artbool) {
      downloadArchive(artnumber, headertitle, tag1, tag2, imageurl, artdate, multipage);
    }
    else {
      csv.editAdminUr(artnumber,headertitle,imageurl);
    }
  };
};

const downloadArchive = async (
  artnumber: string,
  arttitle: string,
  arttag1: string,
  arttag2: string,
  artheader: string,
  uploaddate: string,
  multipage: number,
) => {
  const filePath = vscode.workspace.workspaceFolders;
  var newArticle = ex.archiveContent.split("sabilog_archiveTitle").join(arttitle);
  newArticle = newArticle.split("sabilog_imageurl").join(artheader);
  newArticle = newArticle.split("sabilog_uploadDate").join(uploaddate);
  newArticle = newArticle.split("sabilog_num").join(artnumber);
  if (multipage === 0) {
    newArticle = newArticle.split("sabilog_multi").join("");
  }
  else{
    newArticle = newArticle.split("sabilog_multi").join("-1");
  }

  let repeatCount = (arttag2 === "none") ? 2 : 3;

  for (var i = 0; i < repeatCount; i++){
    try {
      var archive = "";
      var article = newArticle;

      if (filePath && filePath.length > 0) {
        if (i === 0) {
          archive = ex.readStringFromFile(path.join(filePath[0].uri?.fsPath, "archive.html"));
          article = article
            .split("sabilog_buttonGroup1")
            .join(`<a type="button" class="tagg" href="./` + dic.Archives[arttag1] + `">` + arttag1 + `</a>`);
          if (arttag2 !== "none") {
            article = article
              .split("sabilog_buttonGroup2")
              .join(`<a type="button" class="tagg" href="./` + dic.Archives[arttag2] + `">` + arttag2 + `</a>`);
          }
          else {
            article = article
              .split("sabilog_buttonGroup2")
              .join("");
          }
        } else if (i === 1) {
          archive = ex.readStringFromFile(path.join(filePath[0].uri?.fsPath, dic.Archives[arttag1]));
          article = article
            .split("sabilog_buttonGroup1")
            .join(`<a type="button" class="tagg" href="#">` + arttag1 + `</a>`);
          if (arttag2 !== "none") {
            article = article
              .split("sabilog_buttonGroup2")
              .join(`<a type="button" class="tagg" href="./` + dic.Archives[arttag2] + `">` + arttag2 + `</a>`);
          }
          else {
            article = article
            .split("sabilog_buttonGroup2")
            .join("");
          }
        } else {
          archive = ex.readStringFromFile(path.join(filePath[0].uri?.fsPath, dic.Archives[arttag2]));
          article = article
            .split("sabilog_buttonGroup1")
            .join(`<a type="button" class="tagg" href="./` + dic.Archives[arttag1] + `">` + arttag1 + `</a>`);
          article = article
            .split("sabilog_tagurl2")
            .join(`<a type="button" class="tagg" href="#">` + arttag2 + `</a>`);
        }

        archive = archive.replace(
          "<!--sabilog_newart-->",
          "<!--sabilog_newart-->\n\n" + article
        );
        // テキストをUint8Arrayに変換
        const blob: Uint8Array = Buffer.from(archive);

        var archiveName="";
        if (i === 0) {archiveName = "archive.html";}
        else if (i === 1) {archiveName = dic.Archives[arttag1];}
        else if (i === 2) { archiveName = dic.Archives[arttag2]; }

        console.log(7);
        console.log(filePath[0].uri?.fsPath, archiveName);
        // ファイルへ書き込む
        await vscode.workspace.fs.writeFile(
          vscode.Uri.file(path.join(filePath[0].uri?.fsPath, archiveName)),
          blob
        );
      }
    }
    catch (error:any) {
      console.error("アーカイブの読み込みエラー:", error.message);
    }
  }

  csv.editAdmin(artnumber, arttitle, arttag1, arttag2, artheader);
};

export async function downloadImage(
  imageUrl: string,
  folderName: string
): Promise<string> {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    return new Promise<string>((resolve) => {
      const uploadResult = cloudinary.uploader.upload_stream(
        {
          upload_preset: "ml_default",
          folder: folderName, // 任意のフォルダ名
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinaryアップロードエラー:", error);
          }
          else {
            if (result) {
              resolve(result.secure_url);
            };
          };
        }
      );
      uploadResult.end(Buffer.from(response.data));
    });
  } catch (error) {
    console.error("エラー:", error);
    return "";
  }
};

export async function uploadImageFromPath(
  imagePath: string,
  folderName: string
) {
  try {
    const imageData = fs.readFileSync(imagePath);
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                upload_preset: 'ml_default',
                folder: folderName, // 任意のフォルダ名
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    if (result) {
                        resolve(result.secure_url);
                    }
                }
            }
        );
        uploadStream.end(imageData);
    });
  } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to upload image');
  }
}

export async function uploadAndDeleteImage(imagePath: string, folderName: string, lineNumber: number) {
  try {
    const imageUrl = await uploadImageFromPath(imagePath, folderName);
    console.log(`Image uploaded to Cloudinary: ${imageUrl}`);
    fs.unlinkSync(imagePath); // 画像ファイルを削除
    cv.replaceImage(lineNumber, imageUrl);
    
    return imageUrl;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to upload image');
  }
}

export function moveImage(imageUrl: string, destinationFolder: string, lineNumber: number) {
  return new Promise((resolve, reject) => {
    try {
      const urlArray = imageUrl.split("/");
      const sourcePath = urlArray.slice(-2).join("/").split(".")[0];
      const destinationPath = destinationFolder + "/" + urlArray.slice(-1).join("").split(".")[0];
      console.log(sourcePath, destinationPath);

      // Perform the move
      cloudinary.uploader.rename(sourcePath, destinationPath)
        .then((result) => {
          console.log('Image moved successfully:', result.url);
          const image_url = result.url.replace(/^http:\/\//, 'https://');
          console.log(image_url);
          cv.replaceImage(lineNumber, image_url);
          resolve(image_url); // 成功時はresolveでURLを返す
        })
        .catch((error) => {
          console.error('Error moving image:', error);
          reject(error); // エラーが発生したらrejectでエラーを返す
        });
    } catch (error) {
      console.error('Error during the image move process:', error);
      reject(error); // 例外が発生したらrejectでエラーを返す
    }
  });
}