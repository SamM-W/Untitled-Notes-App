import { getPageData } from "../../../backend/interface/page_database.js";
import { getOpenSessionPageData } from "../websocket/editor.js";
import { addAuthorisedHandler, assertFieldFormat } from "./rest_api.js";

export function buildPageApi() {
    addAuthorisedHandler("get_page", async function (req, userId) {
        var failedAssertionResponse = assertFieldFormat(req.body,
            ["pageId"],
            [/[0-9]+/]
        );
        if (failedAssertionResponse) return failedAssertionResponse;
        return {
            status: "success",
            content: getOpenSessionPageData(req.body.pageId) || await getPageData(req.body.pageId)
        }
    });
}