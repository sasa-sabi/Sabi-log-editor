import * as vscode from "vscode";

const ex = require("../extension");

var dictional = {
  笹錆: "https://res.cloudinary.com/dtifkcohv/image/upload/v1687189206/system%20images/member/member_sabi_512_lzx62f.png",
  H君: "https://res.cloudinary.com/dtifkcohv/image/upload/v1687189206/system%20images/member/member_H_512_b7njv5.png",
  R君: "https://res.cloudinary.com/dtifkcohv/image/upload/v1687189207/system%20images/member/member_R_512_nlsmma.png",
  S君: "https://res.cloudinary.com/dtifkcohv/image/upload/v1687189207/system%20images/member/member_S_512_b04npb.png",
  T君: "https://res.cloudinary.com/dtifkcohv/image/upload/v1687189206/system%20images/member/member_T_512_sj8rhk.png",
  おじ: "https://res.cloudinary.com/dtifkcohv/image/upload/v1689706845/system%20images/member/member_O_512_xpyspz.png",
  J君: "https://res.cloudinary.com/dtifkcohv/image/upload/v1693490100/system%20images/member/member_J_512_tw7gat.png",
};

// Markdownのコンバート
export function convertMd(code: string, dictionary: Record<string, string>) {
  // コード（```コード```）の変換
  code = code.replace(/```([\s\S]*?)```/gm, (match, content) => {
    const lines = content.split("\n");
    const title = `${lines[0]}`;
    var program = `${lines.slice(1).join("\n")}`;

    program = program.replace(/\&/gm, "&amp;");
    program = program.replace(/\</gm, "&lt;");
    program = program.replace(/\>/gm, "&gt;");
    program = program.replace(/\"/gm, "&quot;");
    program = program.replace(/\'/gm, "&apos;");
    program = program.replace(/\*/gm, "&asta");
    program = program.replace(/\(/gm, "&lm");
    program = program.replace(/\)/gm, "&rm");
    program = program.replace(/\[/gm, "&lb");
    program = program.replace(/\]/gm, "&rb");
    program = program.replace(/\\\`/gm, "&cdpnt");
    program = program.replace(/\\\-/gm, "-");
    program = program.replace(/\n\n/gm, "<br>");

    program = program.replace(
      /\-m(.*?)「(.*?)」/g,
      "%sabilog.true.memo%$1%$2%"
    );
    program = program.replace(/\-p\s+(.*?)/g, "%sabilog.true.marker%$1%");
    program = program.replace(
      /\-(.*?)「(.*?)」/g,
      "%sabilog.true.balloon%$1%$2%"
    );

    return (
      '\n\t\t</p>\n\t\t<pre class="code ' +
      title +
      '"><code>' +
      program +
      "</code></pre>\n\t\t<p>"
    );
  });

  // ヘッダー（#）の変換
  code = code.replace(/^##\s+(.*)$/gm, "\n\t\t</p>\n\t\t<h2>$1</h2>\n\t\t<p>");

  code = code.replace(/^#\s+(.*)$/gm, "\n\t\t</p>\n\t\t<h1>$1</h1>\n\t\t<p>");

  // 強調（**テキスト**）の変換
  code = code.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 斜体（*テキスト*）の変換
  code = code.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // リンク（[テキスト](URL)）の変換
  code = code.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // メモ（-mタイトル「コンテンツ」）の変換
  code = code.replace(
    /\-m(.*?)「(.*?)」/g,
    '\n\t\t</p>\n\t\t<div class="art-memo">\n\t\t\t<h2>$1</h2>\n\t\t\t<p class="memo-text">$2</p>\n\t\t</div>\n\t\t<p>'
  );

  // 吹き出し（-名前「コンテンツ」）の変換
  code = code.replace(/\-t(.*?)「(.*?)」/g, (match, title, content) => {
    let replacement =
      '\n\t\t</p>\n\t\t<div class="balloon-set-box">\n\t\t\t<div class="icon-box">\n\t\t\t<img src="';
    if (dictionary.hasOwnProperty(title.trim())) {
      replacement += `${dictionary[title.trim()]}`;
    }
    replacement += `" class="icon">\n\t\t\t<p>${title.trim()}</p>\n\t\t\t</div>\n\t\t<div class="balloon">\n\t\t\t<p>${content.trim()}</p>\n\t\t\t</div>\n\t\t</div>\n\t\t<p>`;
    return replacement;
  });

  // 付箋見出し（-p 見出し）の変換
  code = code.replace(
    /\-p\s+(.*?)$/gm,
    '\n\t\t</p>\n\t\t<p><strong class="p-str">$1</strong></p>\n\t\t<p>'
  );

  // 項目（- コンテンツ）の変換
  code = code.replace(
    /\n\s\s\s\s-\s+(.*?)$/gm,
    "\n\t\t</p>\n\t\t\t<ul >\n\t\t\t\t<li>$1</li>\n\t\t\t</ul >\n\t\t<p>"
  );
  code = code.replace(
    /\n\s\s-\s+(.*?)$/gm,
    "\n\t\t</p>\n\t\t\t<ul >\n\t\t\t\t<li>$1</li>\n\t\t\t</ul >\n\t\t<p>"
  );
  code = code.replace(
    /\n\-\s+(.*?)$/gm,
    "\n\t\t</p>\n\t\t<ul>\n\t\t\t<li>$1</li>\n\t\t</ul>\n\t\t<p>"
  );

  // 画像の変換
  code = code.replace(
    /\!https\:\/\/res\.cloudinary\.com(.*?)$/gm,
    `\n\t\t</p>\n\t\t<img src="https://res.cloudinary.com$1" class="art-image" />\n\t\t<p>`
  );

  // 改行の変換
  code = code.replace(/\n\n/g, "\n\t\t<br>");
  code = code + "\n\t\t</p>";
  code = code.replace(/<p>\n\t\t<br>/g, "<p>");
  code = code.replace(/<br>\n\t\t<\/p>/g, "</p>");
  code = code.replace(/<p>\n\t\t<\/p>/g, "");

  code = code.replace(/<\/ul>\n\t\t\n\t\t\t<ul\s>/g, "\t<ul >");
  code = code.replace(
    /<\/ul\s>\n\t\t\n\t\t<ul>/g,
    "</ul>\n\t\t</ul>\n\t\t<ul>"
  );
  code = code.replace(/<\/ul\s>\n\t\t\n\t\t<ul\s>/g, "");

  code = code.replace(/%sabilog\.balloon%/g, "-(人名)「(内容)」");
  code = code.replace(/%sabilog\.memo%/g, "-m(タイトル)「(内容)」");
  code = code.replace(/%sabilog\.marker%/g, "-p (タイトル)");
  code = code.replace(/%sabilog\.window%/g, "---");
  code = code.replace(/%sabilog\.page%/g, "--p");
  code = code.replace(/%sabilog\.code%/g, "```コード```");

  code = code.replace(/%sabilog.true.memo%(.*?)%(.*?)%/g, "-m$1「$2」");
  code = code.replace(/%sabilog.true.marker%(.*?)%/g, "-p $1");
  code = code.replace(/%sabilog.true.balloon%(.*?)%(.*?)%/g, "-$1「$2」");
  code = code.replace(/&asta/g, "*");
  code = code.replace(/&lm/g, "(");
  code = code.replace(/&rm/g, ")");
  code = code.replace(/&lb/g, "[");
  code = code.replace(/&rb/g, "]");
  code = code.replace(/&cdpnt/g, "`");

    
  code = code.replace(/\t\t\/p>/g, "`");
  return code;
}

export function makeDisplay(mark: vscode.TextEditor) {
  var convertedHtml = "";
  var markdown = mark.document.getText();
  const pages = markdown.split("—p");
  const titleWindow = pages[0].split("---")[0];

    for (var k = 0; k < pages.length; k++) {
        const window = pages[k].split("---"); // 「---」で文章を区切る
        if (k === 0)    {
            for (var i = 0; i < window.length; i++) {
                if (i === 0) {
                  const header = titleWindow.split("\n\n");

                    convertedHtml +=
                      '\n\t<div class="toppage">\n\t\t<div class="art-header">\n\t\t' +
                      '<div class="toppageImage" style="background-image: url(' +
                      header[1].substring(1) +
                      ');"></div>\n\t\t<h1>' +
                      header[0].substring(2) +
                      "</h1>\n\t\t<p>" +
                      header[2] +
                      "</p>\n\t\t</div>\n\t</div>";
                } else if (i === 1) {
                    if (i === window.length - 1) {
                        convertedHtml +=
                          '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' +
                          convertMd(window[1], dictional) +
                          "\n\t\t</div>";
                    } else {
                        convertedHtml +=
                          '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' +
                          convertMd(window[1], dictional) +
                          "\n\t\t</div>";
                    }
                } else if (i === window.length - 1) {
                    convertedHtml +=
                        '\n\t\t<div class="window window-end">\n\t\t' +
                        convertMd(window[i], dictional) +
                        "\n\t\t</div>";
                } else {
                convertedHtml +=
                    '\n\t\t<div class="window">\n\t\t' + convertMd(window[i], dictional) + "\n\t\t</div>";
                }
            }
        } else {
            for (var i = 0; i < window.length; i++) {
                if (i === 0) {
                    if (i === window.length - 1) {
                      convertedHtml +=
                        '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' +
                        convertMd(window[0], dictional) +
                        "\n\t\t</div>";
                    } else {
                      convertedHtml +=
                        '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' +
                        convertMd(window[0], dictional) +
                        "\n\t\t</div>";
                    }
                } else if (i === window.length - 1) {
                    convertedHtml +=
                    '\n\t\t<div class="window window-end">\n\t\t' +
                    convertMd(window[i], dictional) +
                    "\n\t\t</div>";
                } else {
                    convertedHtml +=
                    '\n\t\t<div class="window">\n\t\t' +
                    convertMd(window[i], dictional) +
                    "\n\t\t</div>";
                }
            }
        }

    convertedHtml += "\n\t</div>";
    }
  return convertedHtml;
}

export function makeDownloadFile(
  pages: string,
  k: number,
  pageKey: number,
  artnum: number,
  pagenum: string,
  headertitle: string,
  headersent: string,
  imageurl: string,
  archivesent:string
) {
  var convertedHtml = "";

  var header = ex.headerContent.replace(/sabilog_title/g, headertitle);
  header = header.replace(/sabilog_sent/g, archivesent);
  header = header.replace(/sabilog_imgurl/g, imageurl);

  var icons = ex.headerContent.replace(/sabilog_sent/g, archivesent);
  icons = icons.replace(/sabilog_artnum/g, artnum);

  const window = pages.split("---"); // 「---」で文章を区切る
    if (pageKey === 1) {
      
  icons = icons.replace(/sabilog_pagenum/g, "");
    for (var i = 0; i < window.length; i++) {
      if (i === 0) {
        convertedHtml +=
          '\n\t<div class="toppage">\n\t\t<div class="art-header">\n\t\t' +
          '<div class="toppageImage" style="background-image: url(' +
          imageurl +
          ');"></div>\n\t\t<h1>' +
          headertitle +
          "</h1>\n\t\t<p>" +
          headersent +
          "</p>\n\t" +
          icons +
          "\n\t\t</div>\n\t</div>";
      } else if (i === 1) {
        if (i === window.length - 1) {
          convertedHtml +=
            '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' +
            convertMd(window[1], dictional) +
            "\n\t\t</div>";
        } else {
          convertedHtml +=
            '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' +
            convertMd(window[1], dictional) +
            "\n\t\t</div>";
        }
      } else if (i === window.length - 1) {
        convertedHtml +=
          '\n\t\t<div class="window window-end">\n\t\t' +
          convertMd(window[i], dictional) +
          "\n\t\t</div>";
      } else {
        convertedHtml +=
          '\n\t\t<div class="window">\n\t\t' +
          convertMd(window[i], dictional) +
          "\n\t\t</div>";
      }
    }

    convertedHtml += "\n\t</div>";
    } else {
        
  icons = icons.replace(/sabilog_pagenum/g, pagenum);
      if (k === 0) {
        for (var i = 0; i < window.length; i++) {
          if (i === 0) {
            convertedHtml +=
              '\n\t<div class="toppage">\n\t\t<div class="art-header">\n\t\t' +
              '<div class="toppageImage" style="background-image: url(' +
              imageurl +
              ');"></div>\n\t\t<h1>' +
              headertitle +
              "</h1>\n\t\t<p>" +
              headersent +
              "</p>\n\t" +
              icons +
              "\n\t\t</div>\n\t</div>";
          } else if (i === 1) {
            if (i === window.length - 1) {
              convertedHtml +=
                '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' +
                convertMd(window[1], dictional) +
                "\n\t\t</div>";
            } else {
              convertedHtml +=
                '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' +
                convertMd(window[1], dictional) +
                "\n\t\t</div>";
            }
          } else if (i === window.length - 1) {
            convertedHtml +=
              '\n\t\t<div class="window window-end">\n\t\t' +
              convertMd(window[i], dictional) +
              "\n\t\t</div>";
          } else {
            convertedHtml +=
              '\n\t\t<div class="window">\n\t\t' +
              convertMd(window[i], dictional) +
              "\n\t\t</div>";
          }
        }
      } else {
        convertedHtml +=
          '\n\t<div class="toppage">\n\t\t<div class="art-header">\n\t\t' +
          '<div class="toppageImage" style="background-image: url(' +
          imageurl +
          ');"></div>\n\t\t<h1>' +
          headertitle +
          "</h1>\n\t\t<p>" +
          headersent +
          "</p>\n\t" +
          icons +
          "\n\t\t</div>\n\t</div>";
        for (var i = 0; i < window.length; i++) {
          if (i === 0) {
            if (i === window.length - 1) {
              convertedHtml +=
                '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' +
                convertMd(window[0], dictional) +
                "\n\t\t</div>";
            } else {
              convertedHtml +=
                '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' +
                convertMd(window[0], dictional) +
                "\n\t\t</div>";
            }
          } else if (i === window.length - 1) {
            convertedHtml +=
              '\n\t\t<div class="window window-end">\n\t\t' +
              convertMd(window[i], dictional) +
              "\n\t\t</div>";
          } else {
            convertedHtml +=
              '\n\t\t<div class="window">\n\t\t' +
              convertMd(window[i], dictional) +
              "\n\t\t</div>";
          }
        }
      }
      
    convertedHtml += "\n\t</div>";
  }
  return ex.headerContent+convertedHtml+ex.footerContent;
}