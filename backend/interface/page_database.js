import database from "../database.js";
import { getUserNameOfId } from "./user_database.js";

var TYPES = [
    [ "text", [ "text_content" ] ],
    [ "header", [ "text_content" ] ],
    [ "flashcards", [ "flashcard_pack_id" ] ],
]
var TYPE_TO_ID_MAP = {};
var TYPE_BY_ID_MAP = {};
var TYPE_COLUMNS = {};
for (var id = 0; id < TYPES.length; id++) {
    var name = TYPES[id][0];
    var properties = TYPES[id][1];

    TYPE_TO_ID_MAP[name] = id;
    TYPE_BY_ID_MAP[id] = name;
    TYPE_COLUMNS[id] = properties;
}

export async function getPageData(pageId) {
    var page = await database.promisedGet("SELECT * FROM pages WHERE id = ?", [pageId]);
    if (page == null) return null;
    var pageBlocks = await database.promisedAll(`SELECT "id", "position", "type" FROM page_blocks WHERE page_id = ? ORDER BY "position"`, [pageId]);
    
    for (var pageBlock of pageBlocks) {
        delete pageBlock.position;
        var type = TYPE_BY_ID_MAP[pageBlock.type];
        if (type != undefined) {
            var typeContent = await database.promisedGet(`SELECT * FROM page_blocks_additional_${type} WHERE block_id = ? AND page_id = ?`, [pageBlock.id, pageId]);    

            delete typeContent.page_id;
            delete typeContent.block_id;
            
            if (typeContent != undefined)
                pageBlock.block_data = typeContent;
        }
        pageBlock.type = type;
    }

    page.owner_name = await getUserNameOfId(page.owner_id);
    page.blocks = pageBlocks ? pageBlocks : [];
    return page;
}

//Saves blocks and name, ownership isn't transfered
export async function savePageData(pageData) {
    database.promisedRun(
        "UPDATE pages SET name = ? WHERE id = ?",
        [pageData.name, pageData.id]
    );

    for (var i = 0; i < pageData.blocks.length; i++) {
        var block = pageData.blocks[i];
        var type_id = TYPE_TO_ID_MAP[block.type];
        if (type_id == undefined) {
            console.log("Recived corrupt block id, dropping", block.type);
            continue;
        }

        await database.promisedRun(
            "INSERT OR REPLACE INTO page_blocks (page_id, id, position, type) VALUES (?, ?, ?, ?)",
            [pageData.id, block.id, i, type_id]
        );
    
        if (type_id != -1) {
            var typeKeys = "";
            var typeValueTemplate = "";
            var typeValue = [];
    
            for (var column of TYPE_COLUMNS[type_id]) {
                typeKeys += `, ${column}`;
                typeValueTemplate += ", ?";
                typeValue.push(block.block_data[column] || "null");
            }
    
            await database.promisedRun(
                `INSERT OR REPLACE INTO page_blocks_additional_${block.type} (page_id, block_id${typeKeys}) VALUES (?, ?${typeValueTemplate})`,
                [pageData.id, block.id, ...typeValue]
            );
        }
    }
    console.log("Serialised page successfully");
}
