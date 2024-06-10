const dl=require("./download");
const ex = require("../extension");

export const getDatabase = async (databaseId: string) => {
  const response = await ex.notion.databases.query({
    database_id: databaseId || "",
    sort: {
      direction: "ascending",
      timestamp: "last_edited_time",
    },
  });
  console.log(response);
  return response;
};

// ブロックの読み込み
export const getBlock = async (pageId: string, nextCursor: string) => {
  var response;
  if (nextCursor === "") {
    response = await ex.notion.blocks.children.list({
      block_id: pageId,
    });
  } else {
    response = await ex.notion.blocks.children.list({
      block_id: pageId,
      start_cursor: nextCursor,
    });
  }
  return response;
};

export const pageIdDictionary: { [name: string]: string } = {};

export const getPageTitle = async (databeseId: string) => {
  const selectIDs:string[] = [];
  const selectTags: string[] = [];
  const database = await getDatabase(databeseId);
  for (var i = 0; i < database.results.length; i++) {
    const pagetitle: string = database.results[i].properties.名前.title[0].text.content;
    try {
      const pagetag: string = database.results[i].properties.タグ.multi_select[0].name;
      pageIdDictionary[pagetitle] = database.results[i].id.trim();
      selectIDs.push(pagetitle);
      selectTags.push(pagetag);
    }
    catch {
      pageIdDictionary[pagetitle] = database.results[i].id.trim();
      selectIDs.push(pagetitle);
      selectTags.push("none");
    }
  }
  console.log(selectIDs);
  return [selectIDs, selectTags];
};

export const getPagetext = async (pageId: string, pagetitle: string, filenumber: string, selectHo: boolean) => {
  var pagetext: string = "# " + pagetitle + "\n\n";

  var pageidnow = "";
  var key = 0;

  while (key === 0) {
    const block = await getBlock(pageId, pageidnow);
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
            if (
              block.results[i].paragraph.rich_text[j].annotations.bold ===
                true &&
              block.results[i].paragraph.rich_text[j].annotations.italic ===
                true
            ) {
              pagetext +=
                "***" +
                block.results[i].paragraph.rich_text[j].plain_text +
                "*** ";
            }

            // 本文(ボールド)
            else if (
              block.results[i].paragraph.rich_text[j].annotations.bold === true
            ) {
              pagetext +=
                "**" +
                block.results[i].paragraph.rich_text[j].plain_text +
                "** ";
            }

            // 本文(イタリック)
            else if (
              block.results[i].paragraph.rich_text[j].annotations.italic ===
              true
            ) {
              pagetext +=
                "*" + block.results[i].paragraph.rich_text[j].plain_text + "* ";
            }

            // 本文(数式)
            else if (
              block.results[i].paragraph.rich_text[j].type === "equation"
            ) {
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
                pagetext += text;
              }
            }
          }
          pagetext += "\n\n";
        }
      }

      // - リスト(has children)
      else if (
        block.results[i].bulleted_list_item !== undefined &&
        block.results[i].has_children === true
      ) {
        const list = await getBlock(block.results[i].id, "");
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
      else if (
        block.results[i].bulleted_list_item !== undefined &&
        block.results[i].has_children === false
      ) {
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
            await dl.downloadImage(
                block.results[i].image.file.url,
                "art-draft"
              )
              .then((secureUrl: string) => {
                pagetext += "!" + secureUrl + "\n\n";
              })
              .catch((error: any) => {
                console.error("エラー:", error);
              });
          }
          else {
            // notionで画像をダウンロード→cloudinaryにアップロード→urlを取得
            await dl.downloadImage(
                block.results[i].image.file.url,
                "art-draft"
              )
              .then((secureUrl: string) => {
                pagetext += "!" + secureUrl + "\n\n";
              })
              .catch((error: any) => {
                console.error("エラー:", error);
              });
          }
        } else if (block.results[i].image.type === "external") {
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
    } else {
      pageidnow = block.next_cursor;
    }
  }
  return pagetext.split("\n").slice(0, -3).join("\n");
};

export const createNotionPage = async (
  pageTitle:string,
  pageScript: string[],
  pageNumber: string,
  pageNameHo: boolean,
) => {
  const databaseId = ex.notionDatabaseID.replace(
    /(.{8})(.{4})(.{4})(.{4})(.{12})/,
    "$1-$2-$3-$4-$5"
  );
  try {
    // ページを検索
    const serchResponse = await ex.notion.search({
      query: pageTitle,
      filter: {
        value: "page",
        property: "object",
      },
    });

    // 検索結果を確認
    const pages = serchResponse.results;
    for (var i = 0; i < pages.length; i++) {
      const titleArray = pages[i].properties.名前.title;
      if (titleArray.length > 0 && titleArray[0].text.content === pageTitle) {
        const response = await ex.notion.pages.update({
          page_id: pages[i].id,
          archived: true,
        });
      }
    }

    var pageTag = "";
    if (pageNameHo) {
      pageTag="art";
    }
    else {
      pageTag="ura";
    }

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
    });
    
    for (var i = 0; i < pageScript.length / 100; i++){
      //配列範囲
      var pageScriptNew;
      if (i === ~~(pageScript.length/100)) {
        pageScriptNew = pageScript.slice(i*100, pageScript.length);
      }
      else {
        pageScriptNew = pageScript.slice(i * 100, i * 100 + 100);
      }
      // ページにブロックの追加
      await ex.notion.blocks.children.append({
        block_id: newPage.id,
        children: pageScriptNew
      });
    }
    console.log(`新しいページを作成しました: ${newPage.url}`);
  } catch (error) {
    console.error("エラー:", error);
  }
};