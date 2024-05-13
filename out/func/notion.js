"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotionPage = exports.getPagetext = exports.getPageTitle = exports.pageIdDictionary = exports.getBlock = exports.getDatabase = void 0;
const dl = require("./download");
const ex = require("../extension");
const getDatabase = async (databaseId) => {
    const response = await ex.notion.databases.query({
        database_id: databaseId || "",
        sort: {
            direction: "ascending",
            timestamp: "last_edited_time",
        },
    });
    return response;
};
exports.getDatabase = getDatabase;
// ブロックの読み込み
const getBlock = async (pageId, nextCursor) => {
    var response;
    if (nextCursor === "") {
        response = await ex.notion.blocks.children.list({
            block_id: pageId,
        });
    }
    else {
        response = await ex.notion.blocks.children.list({
            block_id: pageId,
            start_cursor: nextCursor,
        });
    }
    return response;
};
exports.getBlock = getBlock;
exports.pageIdDictionary = {};
const getPageTitle = async (databeseId) => {
    var selectIDs = [];
    const database = await (0, exports.getDatabase)(databeseId);
    for (var i = 0; i < database.results.length; i++) {
        const pagetitle = database.results[i].properties.名前.title[0].text.content;
        exports.pageIdDictionary[pagetitle] = database.results[i].id.trim();
        selectIDs.push(pagetitle);
    }
    return selectIDs;
};
exports.getPageTitle = getPageTitle;
const getPagetext = async (pageId, pagetitle, filenumber, selectHo) => {
    var pagetext = "# " + pagetitle + "\n\n";
    var pageidnow = "";
    var key = 0;
    while (key === 0) {
        const block = await (0, exports.getBlock)(pageId, pageidnow);
        console.log(block);
        for (var i = 0; i < block.results.length; i++) {
            // # タイトル
            if (block.results[i].heading_1 !== undefined) {
                pagetext +=
                    "# " + block.results[i].heading_1.rich_text[0].plain_text + "\n\n";
            }
            // ## 見出し
            else if (block.results[i].heading_2 !== undefined) {
                pagetext +=
                    "## " + block.results[i].heading_2.rich_text[0].plain_text + "\n\n";
            }
            // 本文
            else if (block.results[i].paragraph !== undefined) {
                // 改行
                if (block.results[i].paragraph.rich_text.length <= 0) {
                    pagetext += "\n";
                }
                else {
                    for (var j = 0; j < block.results[i].paragraph.rich_text.length; j++) {
                        // 本文(ボールドイタリック)
                        if (block.results[i].paragraph.rich_text[j].annotations.bold ===
                            true &&
                            block.results[i].paragraph.rich_text[j].annotations.italic ===
                                true) {
                            pagetext +=
                                "***" +
                                    block.results[i].paragraph.rich_text[j].plain_text +
                                    "*** ";
                        }
                        // 本文(ボールド)
                        else if (block.results[i].paragraph.rich_text[j].annotations.bold === true) {
                            pagetext +=
                                "**" +
                                    block.results[i].paragraph.rich_text[j].plain_text +
                                    "** ";
                        }
                        // 本文(イタリック)
                        else if (block.results[i].paragraph.rich_text[j].annotations.italic ===
                            true) {
                            pagetext +=
                                "*" + block.results[i].paragraph.rich_text[j].plain_text + "* ";
                        }
                        // 本文(数式)
                        else if (block.results[i].paragraph.rich_text[j].type === "equation") {
                            pagetext +=
                                "$" + block.results[i].paragraph.rich_text[j].plain_text + "$ ";
                        }
                        // url
                        else {
                            if (block.results[i].paragraph.rich_text[j].href !== null) {
                                pagetext +=
                                    "[" +
                                        block.results[i].paragraph.rich_text[j].plain_text +
                                        "](" +
                                        block.results[i].paragraph.rich_text[j].href +
                                        ") ";
                            }
                            // ノーマル
                            else {
                                var text = block.results[i].paragraph.rich_text[j].plain_text;
                                text = text.split("<").join("&lt;");
                                text = text.split(">").join("&gt;");
                                text = text.split("—p").join("\-\-p");
                            }
                        }
                    }
                    pagetext += text + "\n\n";
                }
            }
            // - リスト(has children)
            else if (block.results[i].bulleted_list_item !== undefined &&
                block.results[i].has_children === true) {
                const list = await (0, exports.getBlock)(block.results[i].id, "");
                pagetext +=
                    "- " +
                        block.results[i].bulleted_list_item.rich_text[0].plain_text +
                        "\n";
                for (var j = 0; j < list.results.length; j++) {
                    pagetext +=
                        "    - " +
                            list.results[j].bulleted_list_item.rich_text[0].plain_text +
                            "\n";
                }
                pagetext += "\n";
            }
            // - リスト(not has children)
            else if (block.results[i].bulleted_list_item !== undefined &&
                block.results[i].has_children === false) {
                pagetext +=
                    "- " +
                        block.results[i].bulleted_list_item.rich_text[0].plain_text +
                        "\n\n";
            }
            // ```コード```
            else if (block.results[i].code !== undefined) {
                pagetext +=
                    "```" +
                        block.results[i].code.language +
                        "\n" +
                        block.results[i].code.rich_text[0].plain_text.split("\n\n").join("\nsabilog\.space\n") +
                        "\n```\n\n";
            }
            // !画像url
            else if (block.results[i].image !== undefined) {
                if (block.results[i].image.type === "file") {
                    if (selectHo) {
                        // notionで画像をダウンロード→cloudinaryにアップロード→urlを取得
                        await dl.downloadImage(block.results[i].image.file.url, "art-" + filenumber)
                            .then((secureUrl) => {
                            pagetext += "!" + secureUrl + "\n\n";
                        })
                            .catch((error) => {
                            console.error("エラー:", error);
                        });
                    }
                    else {
                        // notionで画像をダウンロード→cloudinaryにアップロード→urlを取得
                        await dl.downloadImage(block.results[i].image.file.url, "ur-" + filenumber)
                            .then((secureUrl) => {
                            pagetext += "!" + secureUrl + "\n\n";
                        })
                            .catch((error) => {
                            console.error("エラー:", error);
                        });
                    }
                }
                else if (block.results[i].image.type === "external") {
                    pagetext += "!" + block.results[i].image.external.url.split(" ").join("%20") + "\n\n";
                }
            }
            // ---ページ区切り
            else if (block.results[i].divider !== undefined) {
                pagetext += "---\n\n";
            }
        }
        if (block.next_cursor === null) {
            key += 1;
        }
        else {
            pageidnow = block.next_cursor;
        }
    }
    return pagetext.split("\n").slice(0, -3).join("\n");
};
exports.getPagetext = getPagetext;
const createNotionPage = async (pageTitle, pageScript, pageNumber, pageNameHo) => {
    const databaseId = ex.notionDatabaseID.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
    try {
        // ページを検索
        const searchResults = await ex.notion.search({
            query: pageTitle,
            filter: {
                value: "page",
                property: "object",
            },
        });
        // ページの削除
        if (searchResults.results.length > 0) {
            const pageId = searchResults.results[0].id;
            const response = await ex.notion.pages.update({
                page_id: pageId,
                archived: true,
            });
        }
        var pageTag = "";
        if (pageNameHo) {
            pageTag = "art";
        }
        else {
            pageTag = "ura";
        }
        // ページの作成
        const newPage = await ex.notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            properties: {
                名前: {
                    title: [
                        {
                            text: {
                                content: pageTitle,
                            },
                        },
                    ]
                },
                タグ: {
                    multi_select: [
                        {
                            name: pageNumber
                        },
                        {
                            name: pageTag
                        }
                    ]
                }
            },
            children: pageScript,
        });
        console.log(`新しいページを作成しました: ${newPage.url}`);
    }
    catch (error) {
        console.error("エラー:", error);
    }
};
exports.createNotionPage = createNotionPage;
//# sourceMappingURL=notion.js.map