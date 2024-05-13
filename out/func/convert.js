"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeUpdateFile = exports.makeDownloadFile = exports.makeDisplay = exports.convertMd = void 0;
const ex = require("../extension");
const dic = require("../text/dictional");
// Markdownのコンバート
function convertMd(code) {
    // 正規表現パターンを定義
    var pattern_h1 = /^#\s+([\s\S]*?)$/;
    var pattern_h2 = /^##\s+([\s\S]*?)$/;
    var pattern_label = /^\-p\s+([\s\S]*?)$/;
    var pattern_bold = /\*\*([\s\S]*?)\*\*\s*/g;
    var pattern_italic = /\*([\s\S]*?)\*\s*/g;
    var pattern_link = /\[([\s\S]*?)\]\(([\s\S]*?)\)\s*/g;
    var pattern_content = /^\-\s([\s\S]*?)$/;
    var pattern_code = /^```([\s\S]*?)```$/m;
    var pattern_decomemo = /^\-mc([\s\S]*?)「([\s\S]*?)」$/;
    var pattern_memo = /^\-m([\s\S]*?)「([\s\S]*?)」$/;
    var pattern_baloon = /^\-t([\s\S]*?)「([\s\S]*?)」$/;
    var pattern_image = /^\!https\:\/\/res\.cloudinary\.com([\s\S]*?)$/;
    const window_str = code.split("\n\n");
    var complish_str = "";
    let how_time_p = [];
    // <p>かどうかの配列
    for (var j = 0; j < window_str.length; j++) {
        if (pattern_h1.test(window_str[j]) === false &&
            pattern_h2.test(window_str[j]) === false &&
            pattern_decomemo.test(window_str[j]) === false &&
            pattern_memo.test(window_str[j]) === false &&
            pattern_baloon.test(window_str[j]) === false &&
            pattern_label.test(window_str[j]) === false &&
            pattern_image.test(window_str[j]) === false &&
            pattern_content.test(window_str[j]) === false &&
            window_str[j] !== "") {
            how_time_p[j] = true;
        }
        else {
            how_time_p[j] = false;
        }
    }
    // windowごとにhtml化
    for (var k = 1; k < window_str.length; k++) {
        // 最後が空白のとき終了
        if (k === window_str.length - 1 && window_str[k] === "") {
            return complish_str;
        }
        // ヘッダー（##）の変換
        if (pattern_h2.test(window_str[k])) {
            var match = pattern_h2.exec(window_str[k]);
            if (match !== null) {
                complish_str += "\n\t\t<h2>" + match[1] + "</h2>\n";
            }
        }
        // ヘッダー（#）の変換
        else if (pattern_h1.test(window_str[k])) {
            var match = pattern_h1.exec(window_str[k]);
            if (match !== null) {
                complish_str += "\n\t\t<h1>" + match[1] + "</h1>\n";
            }
        }
        // コード（```コード```）の変換
        else if (pattern_code.test(window_str[k])) {
            const lines = pattern_code.exec(window_str[k]);
            if (lines !== null) {
                const title = lines[1].split("\n")[0];
                var program = lines[1].split("\n").slice(1).join("\n");
                // 記号の変換
                program = program.replace(/\&/gm, "&amp;");
                program = program.replace(/\</gm, "&lt;");
                program = program.replace(/\>/gm, "&gt;");
                program = program.replace(/\"/gm, "&quot;");
                program = program.replace(/\'/gm, "&apos;");
                program = program.replace(/\n/gm, "<br>");
                // 改行用記号
                program = program.replace(/sabilog.space/gm, "");
                complish_str +=
                    '\n\t\t<pre class="code ' +
                        title +
                        '"><code>' +
                        program +
                        "</code></pre>";
            }
            else {
                complish_str += '\n\t\t<pre class="code"><code>\n<br>\n</code></pre>\n';
            }
        }
        // 波線メモ（-mcタイトル「コンテンツ」）の変換
        else if (pattern_decomemo.test(window_str[k])) {
            var match = pattern_decomemo.exec(window_str[k]);
            if (match !== null) {
                complish_str +=
                    '\n\t\t<div class="art-memo">\n\t\t\t<h2>' +
                        match[1] +
                        '</h2>\n\t\t\t<p class="memo-text">' +
                        match[2].split("\n").join("\<br\>") +
                        "</p>\n\t\t</div>\n";
            }
        }
        // メモ（-mタイトル「コンテンツ」）の変換
        else if (pattern_memo.test(window_str[k])) {
            var match = pattern_memo.exec(window_str[k]);
            if (match !== null) {
                complish_str +=
                    '\n\t\t<div class="art-memo">\n\t\t\t<h2>' +
                        match[1] +
                        "</h2>\n\t\t\t<p>" +
                        match[2].split("\n").join("<br>") +
                        "</p>\n\t\t</div>\n";
            }
        }
        // 吹き出し（-t名前「コンテンツ」）の変換
        else if (pattern_baloon.test(window_str[k])) {
            var match = pattern_baloon.exec(window_str[k]);
            if (match !== null) {
                complish_str +=
                    '\n\t\t<div class="balloon-set-box">\n\t\t\t<div class="icon-box">\n\t\t\t<img src="' +
                        dic.Icons[match[1].trim()] +
                        '" class="icon">\n\t\t\t<p>' +
                        match[1] +
                        '</p>\n\t\t\t</div>\n\t\t<div class="balloon">\n\t\t\t<p>' +
                        match[2].split("\n").join("<br>") +
                        "</p>\n\t\t\t</div>\n\t\t</div>\n";
            }
        }
        // 付箋見出し（-p 見出し）の変換
        else if (pattern_label.test(window_str[k])) {
            complish_str +=
                '\n\t\t<p><strong class="p-str">' +
                    window_str[k].substring(3) +
                    "</strong></p>\n";
        }
        // 画像の変換
        else if (pattern_image.test(window_str[k])) {
            complish_str +=
                '\n\t\t<img src="' +
                    window_str[k].substring(1) +
                    '" class="art-image" />\n';
        }
        // 項目（- コンテンツ）の変換
        else if (pattern_content.test(window_str[k])) {
            const contents_str = pattern_content.exec(window_str[k]);
            if (contents_str != null) {
                var contents_list = contents_str[0].split(/\s*\-\s/);
                // 項目が1つ
                if (contents_list.length - 1 === 1) {
                    complish_str +=
                        "\n\t\t<ul>\n\t\t\t<li>" + contents_list[1] + "</li>\n\t\t\t</ul>\n";
                }
                // 項目が2つ以上
                else {
                    for (var j = 1; j < contents_list.length; j++) {
                        if (j === 1) {
                            complish_str +=
                                "\n\t\t<ul>\n\t\t\t<li>" + contents_list[j] + "</li>\n\t\t\t<ul>";
                        }
                        else {
                            complish_str += "\n\t\t\t\t<li>" + contents_list[j] + "</li>";
                        }
                    }
                    complish_str += "\n\t\t\t</ul>\n\t\t</ul>\n";
                }
            }
        }
        // その他の変換
        else {
            var sentence = window_str[k];
            // 強調（**テキスト**）の変換
            sentence = sentence.replace(pattern_bold, "<strong>$1</strong>");
            // 斜体（*テキスト*）の変換
            sentence = sentence.replace(pattern_italic, "<em>$1 </em>");
            // リンク（[テキスト](URL)）の変換
            sentence = sentence.replace(pattern_link, '<a href="$2">$1</a>');
            // 前の内容が<p>だったかどうか
            if (k !== 1 && how_time_p[k - 1] === false) {
                complish_str += "\n\t\t<p>" + sentence;
            }
            else {
                complish_str += "\n\t\t" + sentence;
            }
            // 次の内容が<p>かどうか
            if (k !== window_str.length && how_time_p[k + 1] === true && window_str[k + 1] !== "") {
                complish_str += "\n\t\t<br>";
            }
            else {
                complish_str += "</p>\n";
            }
        }
    }
    return complish_str;
}
exports.convertMd = convertMd;
function makeDisplay(mark) {
    var convertedHtml = "";
    var markdown = mark.document.getText();
    const pages = markdown.split("--p");
    const titleWindow = pages[0].split("---")[0];
    for (var k = 0; k < pages.length; k++) {
        const window = pages[k].split("---"); // 「---」で文章を区切る
        if (k === 0) {
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
                }
                else if (i === 1) {
                    if (i === window.length - 1) {
                        convertedHtml +=
                            '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' +
                                convertMd(window[1]) +
                                "\n\t\t</div>";
                    }
                    else {
                        convertedHtml +=
                            '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' +
                                convertMd(window[1]) +
                                "\n\t\t</div>";
                    }
                }
                else if (i === window.length - 1) {
                    convertedHtml +=
                        '\n\t\t<div class="window window-end">\n\t\t' +
                            convertMd(window[i]) +
                            "\n\t\t</div>";
                }
                else {
                    convertedHtml +=
                        '\n\t\t<div class="window">\n\t\t' + convertMd(window[i]) + "\n\t\t</div>";
                }
            }
        }
        else {
            for (var i = 0; i < window.length; i++) {
                if (i === 0) {
                    if (i === window.length - 1) {
                        convertedHtml +=
                            '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' +
                                convertMd(window[0]) +
                                "\n\t\t</div>";
                    }
                    else {
                        convertedHtml +=
                            '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' +
                                convertMd(window[0]) +
                                "\n\t\t</div>";
                    }
                }
                else if (i === window.length - 1) {
                    convertedHtml +=
                        '\n\t\t<div class="window window-end">\n\t\t' +
                            convertMd(window[i]) +
                            "\n\t\t</div>";
                }
                else {
                    convertedHtml +=
                        '\n\t\t<div class="window">\n\t\t' +
                            convertMd(window[i]) +
                            "\n\t\t</div>";
                }
            }
        }
        convertedHtml += "\n\t</div>";
    }
    return convertedHtml;
}
exports.makeDisplay = makeDisplay;
function makeDownloadFile(pages, k, pageKey, artnum, pagenum, headertitle, headersent, imageurl, archivesent, maxpage, nextpages) {
    var convertedHtml = "";
    var header = ex.headerContent.split("sabilog_title").join(headertitle);
    header = header.split("sabilog_sent").join(archivesent);
    header = header.split("sabilog_imgurl").join(imageurl);
    var icons = ex.topIconContent.split("sabilog_sent").join(archivesent);
    icons = icons.split("sabilog_artnum").join(artnum);
    const window = pages.split("---"); // 「---」で文章を区切る
    if (pageKey === 1) {
        icons = icons.split("sabilog_pagenum");
        icons = icons.join("");
        for (var i = 0; i < window.length; i++) {
            if (i === 0) {
                convertedHtml +=
                    '\n<div class="toppage">' +
                        '\n\t<div class="art-header">' +
                        '\n\t\t<div class="toppageImage" style="background-image: url(' +
                        imageurl +
                        ');"></div>\n\t\t<h1>' +
                        headertitle +
                        "</h1>\n\t\t<p>" +
                        headersent +
                        "</p>\n" +
                        icons +
                        "\n\t</div>\n</div>\n";
            }
            else if (i === 1) {
                if (i === window.length - 1) {
                    convertedHtml +=
                        '\n<div class="headline">' +
                            '\n\n\t<div class="top-window window-end">\n' +
                            convertMd(window[1]) +
                            "\n\t</div>";
                }
                else {
                    convertedHtml +=
                        '\n<div class="headline">' +
                            '\n\n\t<div class="top-window">\n' +
                            convertMd(window[1]) +
                            "\n\t</div>";
                }
            }
            else if (i === window.length - 1) {
                convertedHtml +=
                    '\n\t<div class="window window-end">\n' +
                        convertMd(window[i]) +
                        "\n\t</div>";
            }
            else {
                convertedHtml +=
                    '\n\t<div class="window">\n' +
                        convertMd(window[i]) +
                        "\n\t</div>";
            }
        }
        convertedHtml += "\n\t</div>";
    }
    else {
        icons = icons.split("sabilog_pagenum");
        icons = icons.join(pagenum);
        if (k === 0) {
            var top_next = ex.topnextContent;
            var down_next = "";
            // top_nextの設定
            top_next = top_next.split("sabilog_previnv").join("page-inv");
            top_next = top_next.split("sabilog_prevurl").join("");
            top_next = top_next.split("sabilog_nextinv").join("");
            top_next = top_next
                .split("sabilog_nexturl")
                .join('href="./ho-0' + `${artnum}` + "-" + `${k + 2}` + '.html"');
            top_next = top_next.split("sabilog_prevnom").join(`${k}`);
            top_next = top_next.split("sabilog_nownom").join(`${k + 1}`);
            top_next = top_next.split("sabilog_nextnom").join(`${k + 2}`);
            // down_nextの設定
            down_next = ex.downnextContent;
            down_next = down_next
                .split("sabilog_nexturl")
                .join("./ho-0" + `${artnum}` + "-" + `${k + 2}` + ".html");
            var nextpage_sp = nextpages.split("---");
            nextpage_sp = nextpage_sp[0].split("\n\n");
            var down_text_num = -1;
            down_text_num = nextpage_sp.findIndex((number) => number.includes("-p"));
            if (down_text_num !== -1) {
                const down_text_list = nextpage_sp[down_text_num].substring(3);
                down_next = down_next
                    .split("sabilog_nexttitle")
                    .join(down_text_list);
            }
            else {
                down_text_num = nextpage_sp.findIndex((number) => number.includes("##"));
                const down_text_list = nextpage_sp[down_text_num].substring(3);
                down_next = down_next
                    .split("sabilog_nexttitle")
                    .join(down_text_list);
            }
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
                }
                else if (i === 1) {
                    if (i === window.length - 1) {
                        convertedHtml +=
                            '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' + top_next + "\n\t\t" +
                                convertMd(window[1]) + "\n\t\t" + down_next +
                                "\n\t\t</div>";
                    }
                    else {
                        convertedHtml +=
                            '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' + top_next +
                                convertMd(window[1]) +
                                "\n\t\t</div>";
                    }
                }
                else if (i === window.length - 1) {
                    convertedHtml +=
                        '\n\t\t<div class="window window-end">\n\t\t' +
                            convertMd(window[i]) + "\n\t\t" + down_next +
                            "\n\t\t</div>";
                }
                else {
                    convertedHtml +=
                        '\n\t\t<div class="window">\n\t\t' +
                            convertMd(window[i]) +
                            "\n\t\t</div>";
                }
            }
        }
        else {
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
                var top_next = ex.topnextContent;
                var down_next = "";
                // top_nextの設定
                top_next = top_next.split("sabilog_previnv").join("");
                top_next = top_next
                    .split("sabilog_prevurl")
                    .join('href="./ho-0' + `${artnum}` + "-" + `${k - 1}` + '.html"');
                if (k === maxpage - 1) {
                    top_next = top_next.split("sabilog_nextinv").join("page-inv");
                    top_next = top_next.split("sabilog_nexturl").join("");
                }
                else {
                    top_next = top_next.split("sabilog_nextinv").join("");
                    top_next = top_next
                        .split("sabilog_nexturl")
                        .join('href="./ho-0' + `${artnum}` + "-" + `${k + 2}` + '.html"');
                }
                top_next = top_next.split("sabilog_prevnom").join(`${k}`);
                top_next = top_next.split("sabilog_nownom").join(`${k + 1}`);
                top_next = top_next.split("sabilog_nextnom").join(`${k + 2}`);
                // down_nextの設定
                if (k !== maxpage - 1) {
                    down_next = ex.downnextContent;
                    down_next = down_next
                        .split("sabilog_nexturl")
                        .join("./ho-0" + `${artnum}` + "-" + `${k + 2}` + ".html");
                    var nextpage_sp = nextpages.split("---");
                    nextpage_sp = nextpage_sp[0].split("\n\n");
                    var down_text_num = -1;
                    down_text_num = nextpage_sp.findIndex((number) => number.includes("-p"));
                    if (down_text_num !== -1) {
                        const down_text_list = nextpage_sp[down_text_num].substring(3);
                        down_next = down_next
                            .split("sabilog_nexttitle")
                            .join(down_text_list);
                    }
                    else {
                        down_text_num = nextpage_sp.findIndex((number) => number.includes("##"));
                        const down_text_list = nextpage_sp[down_text_num].substring(3);
                        down_next = down_next
                            .split("sabilog_nexttitle")
                            .join(down_text_list);
                    }
                }
                if (i === 0) {
                    if (i === window.length - 1) {
                        convertedHtml +=
                            '\n\t<div class="headline">\n\t\t<div class="top-window window-end">\n\t\t' +
                                top_next + "\n\t\t" +
                                convertMd(window[0]) +
                                "\n\t\t" +
                                down_next +
                                "\n\t\t</div>";
                    }
                    else {
                        convertedHtml +=
                            '\n\t<div class="headline">\n\t\t<div class="top-window">\n\t\t' +
                                top_next + "\n" +
                                convertMd(window[0]) +
                                "\n\t\t</div>";
                    }
                }
                else if (i === window.length - 1) {
                    convertedHtml +=
                        '\n\t\t<div class="window window-end">\n\t\t' +
                            convertMd(window[i]) +
                            "\n\t\t" +
                            down_next +
                            "\n\t\t</div>";
                }
                else {
                    convertedHtml +=
                        '\n\t\t<div class="window">\n\t\t' +
                            convertMd(window[i]) +
                            "\n\t\t</div>";
                }
            }
        }
        convertedHtml += "\n\t</div>";
    }
    return header + convertedHtml + ex.footerContent;
}
exports.makeDownloadFile = makeDownloadFile;
function makeUpdateFile(mark) {
    // 正規表現パターンを定義
    var pattern_h1 = /^#\s+([\s\S]*?)$/;
    var pattern_h2 = /^##\s+([\s\S]*?)$/;
    var pattern_bolita = /\*\*\*([\s\S]*?)\*\*\*\s*/;
    var pattern_bold = /\*\*([\s\S]*?)\*\*\s*/;
    var pattern_italic = /\*([\s\S]*?)\*\s*/;
    var pattern_link = /\[([\s\S]*?)\]\(([\s\S]*?)\)\s*/;
    var pattern_content = /^\-\s([\s\S]*?)$/;
    var pattern_code = /^```([\s\S]*?)\n([\s\S]*?)```$/m;
    var pattern_image = /^\!https\:\/\/res\.cloudinary\.com([\s\S]*?)$/;
    var pattern_label = /^\-p\s([\s\S]*?)$/;
    var pattern_baloon = /^\-t([\s\S]*?)「([\s\S]*?)」$/;
    var pattern_decomemo = /^\-mc「([\s\S]*?)」$/;
    var pattern_memo = /^\-m「([\s\S]*?)」$/;
    var pattern_tag1 = /^\-tag1\s([\s\S]*?)$/;
    var pattern_tag2 = /^\-tag2\s([\s\S]*?)$/;
    var pattern_sent = /^\-sent\s([\s\S]*?)$/;
    var pattern_separate = /^\-\-\-$/;
    var pattern_newline = /^([\s\S]*?)\n*$/;
    const markdown = mark.document.getText();
    const pages = markdown.split("\n\n");
    var pagescript = [];
    for (var k = 1; k < pages.length; k++) {
        // 最後が空白のとき終了
        if (k === pages.length - 1 && pages[k] === "") {
            return pagescript;
        }
        // 区切り（---）の変換
        if (pattern_separate.test(pages[k])) {
            var match = pattern_separate.exec(pages[k]);
            if (match !== null) {
                pagescript.push({
                    type: "divider",
                    divider: {}
                });
            }
        }
        // ヘッダー（##）の変換
        else if (pattern_h2.test(pages[k])) {
            var match = pattern_h2.exec(pages[k]);
            if (match !== null) {
                pagescript.push({
                    object: "block",
                    heading_2: {
                        rich_text: [{ text: { content: match[1] } }],
                    },
                });
            }
        }
        // ヘッダー（#）の変換
        else if (pattern_h1.test(pages[k])) {
            var match = pattern_h1.exec(pages[k]);
            if (match !== null) {
                pagescript.push({
                    object: "block",
                    heading_1: {
                        rich_text: [{ text: { content: match[1] } }],
                    },
                });
            }
        }
        // コード（```コード```）の変換
        else if (pattern_code.test(pages[k])) {
            var match = pattern_code.exec(pages[k]);
            if (match !== null) {
                const code = match[2].slice(0, match[2].length - 2);
                pagescript.push({
                    object: "block",
                    code: {
                        language: match[1],
                        rich_text: [{ text: { content: code.split("sabilog\.space").join("") } }],
                    },
                });
            }
        }
        // 画像の変換
        else if (pattern_image.test(pages[k])) {
            pagescript.push({
                type: "image",
                image: {
                    type: "external",
                    external: {
                        url: pages[k].substring(1),
                    },
                },
            });
        }
        // 項目（- コンテンツ）の変換
        else if (pattern_content.test(pages[k])) {
            const contents_str = pattern_content.exec(pages[k]);
            if (contents_str !== null) {
                var contents_list = contents_str[1].split(/\n\s*\-\s/);
                // 項目が1つ
                if (contents_list.length === 1) {
                    pagescript.push({
                        object: "block",
                        type: 'bulleted_list_item',
                        bulleted_list_item: {
                            rich_text: [{ text: { content: contents_list[0] } }],
                        },
                    });
                }
                // 項目が2つ以上
                else {
                    var contents_parent = [];
                    var contents_children = [];
                    for (var j = 0; j < contents_list.length; j++) {
                        if (j === 0) {
                            contents_parent.push({ text: { content: contents_list[j] } });
                        }
                        else {
                            contents_children.push({
                                object: 'block',
                                type: 'bulleted_list_item',
                                bulleted_list_item: {
                                    rich_text: [{ text: { content: contents_list[j] } }],
                                }
                            });
                        }
                    }
                    pagescript.push({
                        object: "block",
                        type: 'bulleted_list_item',
                        bulleted_list_item: {
                            rich_text: contents_parent,
                            children: contents_children
                        },
                    });
                }
            }
        }
        // その他の変換
        else {
            var match_letter = pattern_newline.exec(pages[k]);
            if (match_letter !== null) {
                if (pattern_label.test(match_letter[1]) ||
                    pattern_baloon.test(match_letter[1]) ||
                    pattern_memo.test(match_letter[1]) ||
                    pattern_decomemo.test(match_letter[1]) ||
                    pattern_tag1.test(match_letter[1]) ||
                    pattern_tag2.test(match_letter[1]) ||
                    pattern_sent.test(match_letter[1])) {
                    pagescript.push({
                        object: "block",
                        paragraph: {
                            rich_text: [{ text: { content: match_letter[1] } }],
                        },
                    });
                }
                else {
                    const letters = match_letter[1].split(" ");
                    var text = [];
                    for (var i = 0; i < letters.length; i++) {
                        // 強調斜体（***テキスト***）の変換
                        if (pattern_bolita.test(letters[i])) {
                            var match = pattern_bolita.exec(letters[i]);
                            if (match !== null) {
                                text.push({
                                    text: {
                                        content: match[1]
                                    },
                                    annotations: {
                                        bold: true,
                                        italic: true
                                    }
                                });
                            }
                        }
                        // 強調（**テキスト**）の変換
                        else if (pattern_bold.test(letters[i])) {
                            var match = pattern_bold.exec(letters[i]);
                            if (match !== null) {
                                text.push({
                                    text: {
                                        content: match[1]
                                    },
                                    annotations: {
                                        bold: true,
                                    }
                                });
                            }
                        }
                        // 斜体（*テキスト*）の変換
                        else if (pattern_italic.test(letters[i])) {
                            var match = pattern_italic.exec(letters[i]);
                            if (match !== null) {
                                text.push({
                                    text: {
                                        content: match[1]
                                    },
                                    annotations: {
                                        italic: true,
                                    }
                                });
                            }
                        }
                        // リンク（[テキスト](URL)）の変換
                        else if (pattern_link.test(letters[i])) {
                            var match = pattern_link.exec(letters[i]);
                            if (match !== null) {
                                text.push({
                                    text: {
                                        content: match[1],
                                        link: { url: match[2] }
                                    },
                                    href: match[2]
                                });
                            }
                        }
                        else {
                            text.push({
                                text: {
                                    content: letters[i]
                                }
                            });
                        }
                    }
                    pagescript.push({
                        object: "block",
                        paragraph: {
                            rich_text: text,
                        },
                    });
                }
            }
        }
    }
    return pagescript;
}
exports.makeUpdateFile = makeUpdateFile;
//# sourceMappingURL=convert.js.map