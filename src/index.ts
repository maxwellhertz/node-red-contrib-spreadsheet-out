const fs = require('fs');
const path = require('path');
const XLSX = require("xlsx");

module.exports = function (RED: any) {
    function jsonToSheetNode(config: any) {
        RED.nodes.createNode(this, config);
        this.filePath = config.filePath;
        this.sheetName = config.sheetName || "Sheet 1";

        const node = this;
        node.on("input", function (msg: any) {
            const payload = msg.payload;
            node.warn(`Received payload: ${JSON.stringify(payload)}`);
            try {
                const data = typeof payload === "object" ? payload : JSON.parse(payload);
                if (!Array.isArray(data)) {
                    throw new Error("Payload is not an array");
                }
                
                const filePath = node.filePath;
                fs.mkdirSync(path.dirname(filePath), { recursive: true });

                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, node.sheetName);
                XLSX.writeFile(workbook, filePath);
                node.warn(`Created ${filePath}`);
            } catch (e) {
                node.error(e, msg);
            }
        });
    }
    RED.nodes.registerType("json-to-sheet", jsonToSheetNode);
}