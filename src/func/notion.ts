const ex = require("../extension");

export const getDatabase = async (databaseId: string) => {
  const response = await ex.notion.databases.query({
    database_id: databaseId || "",
  });
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

export const pageIdDictionary = {};

export const getPageTitle = async (databeseId: string) => {
  var selectIDs = [];
  const database = await getDatabase(databeseId);
  for (var i = 0; i < database.results.length; i++) {
    const pagetitle = database.results[i].properties.名前.title[0].text.content;
    pageIdDictionary[pagetitle] = database.results[i].id.trim();
    selectIDs.push(pagetitle);
  }
  return selectIDs;
};

export const getPagetext = async (pageId: string, pagetitle: string) => {
  var pagetext: string = "# " + pagetitle + "\n\n";

  var pageidnow = "";
  var key = 0;

  while (key === 0) {
      const block = await getBlock(pageId, pageidnow);
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
        if (block.results[i].paragraph.rich_text.length === 0) {
          pagetext += "\n\n";
        }

        // 本文(ボールド)
        else if (
          block.results[i].paragraph.rich_text[0].annotations.bold === true
        ) {
          pagetext +=
            "**" +
            block.results[i].paragraph.rich_text[0].plain_text +
            "**\n\n";
        }

        // 本文(イタリック)
        else if (
          block.results[i].paragraph.rich_text[0].annotations.italic === true
        ) {
          pagetext +=
            "*" + block.results[i].paragraph.rich_text[0].plain_text + "*\n\n";
        }

        // 本文(数式)
        else if (block.results[i].paragraph.rich_text[0].type === "equation") {
          pagetext +=
            "$" + block.results[i].paragraph.rich_text[0].plain_text + "$\n\n";
        }

        // ノーマル
        else {
          pagetext +=
            block.results[i].paragraph.rich_text[0].plain_text + "\n\n";
        }
      }

      // - リスト(has children)
      else if (
        block.results[i].bulleted_list_item !== undefined &&
        block.results[i].has_children === true
      ) {
        const list = await getBlock(block.results[i].id,"");
        pagetext +=
          "- " +
          block.results[i].bulleted_list_item.rich_text[0].plain_text +
          "\n";
        for (var j = 0; j < list.results.length; j++) {
          pagetext +=
            "  - " +
            list.results[j].bulleted_list_item.rich_text[0].plain_text +
            "\n";
        }
      }

      // - リスト(not has children)
      else if (
        block.results[i].bulleted_list_item !== undefined &&
        block.results[i].has_children === false
      ) {
        pagetext +=
          "- " +
          block.results[i].bulleted_list_item.rich_text[0].plain_text +
          "\n";
      }

      // ```コード```
      else if (block.results[i].code !== undefined) {
        pagetext +=
          "```" +
          block.results[i].code.language +
          "\n" +
          block.results[i].code.rich_text[0].plain_text +
          "\n```\n\n";
      }

      // !画像url
      else if (block.results[i].image !== undefined) {
        pagetext += "!" + block.results[i].image.external.url + "\n\n";
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
  return pagetext;
};
