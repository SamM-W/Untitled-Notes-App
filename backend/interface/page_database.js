import database from "../database.js";
import { getUserNameOfId } from "./user_database.js";

var TYPE_NAME_MAP = {
    0: "text"
}

export async function getPageData(pageId) {
    var page = await database.promisedGet("SELECT * FROM pages WHERE id = ?", [pageId]);
    if (page == null) return null;
    var pageBlocks = await database.promisedAll(`SELECT "id", "position", "type" FROM page_blocks WHERE page_id = ? ORDER BY "position"`, [pageId]);
    
    for (var pageBlock of pageBlocks) {
        var type = TYPE_NAME_MAP[pageBlock.type];
        if (type != undefined) {
            var typeContent = await database.promisedGet(`SELECT * FROM page_blocks_additional_${type} WHERE block_id = ?`, [pageBlock.id]);    
            delete typeContent.block_id;
            if (typeContent != undefined)
                pageBlock.block_data = typeContent;
        }
        pageBlock.type = type;
    }

    page.owner_name = await getUserNameOfId(page.owner_id);
    page.blocks = pageBlocks ? pageBlocks : [];
    console.log(page);
    return page;
}
