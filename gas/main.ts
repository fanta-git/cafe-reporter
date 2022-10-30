import { timetableItem } from "./_types";

type arrEntries<T extends readonly any[]> = IterableIterator<[number, T[number]]>;

function main () {
    const response = UrlFetchApp.fetch("https://cafeapi.kiite.jp/api/cafe/timetable?limit=100");
    if (response.getResponseCode() !== 200) throw Error(response.getResponseCode() + " Error");
    const json = JSON.parse(response.getContentText()) as timetableItem[];
    if (json == null) throw Error("APIの取得に失敗しました");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();

    const lastRow = sheet.getLastRow();

    const lastId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() : 0;
    const timetableDiff = json.filter(v => v.id > lastId).reverse();
    if (timetableDiff.length === 0) return;

    const writeData = timetableDiff.map(v => ROWS.map(k => {
        return CONVERT_FUNC[ROWS_FORMAT[k]](v[k])
    }));

    for (const [index, key] of ROWS.entries() as arrEntries<typeof ROWS>) {
        const formatStr = FORMAT_TYPES[ROWS_FORMAT[key]];
        // sheet.getRange(lastRow + 1, index + 1, writeData.length, 1).setNumberFormat(formatStr);
        sheet.getRange(2, index + 1, lastRow - 1 + writeData.length, 1).setNumberFormat(formatStr);
    }

    sheet.getRange(lastRow + 1, 1, writeData.length, writeData[0].length).setValues(writeData);
}

const ROWS = ["id", "video_id", "title", "artist_id", "artist_name", "start_time", "msec_duration", "published_at", "request_user_ids", "created_at", "updated_at", "reasons", "thumbnail", "new_fav_user_ids", "baseinfo", "colors", "presenter_user_ids", "belt_message", "now_message", "rotate_action", "bpm", "display_playlist_link"] as const;
const ROWS_FORMAT = {
    id: "id",
    video_id: "string",
    title: "string",
    artist_id: "id",
    artist_name: "string",
    start_time: "string",
    msec_duration: "number",
    published_at: "string",
    request_user_ids: "string",
    created_at: "string",
    updated_at: "string",
    reasons: "string",
    thumbnail: "string",
    new_fav_user_ids: "string",
    baseinfo: "string",
    colors: "string",
    presenter_user_ids: "string",
    belt_message: "string",
    now_message: "string",
    rotate_action: "string",
    bpm: "number",
    display_playlist_link: "string"
} as const;

const FORMAT_TYPES = {
    string: "@",
    id: "0",
    number: "#,##0"
} as const;

const CONVERT_FUNC = {
    string: (v: any) => String(v ?? ""),
    id: (v: any) => Number(v ?? -1),
    number: (v: any) => Number(v ?? -1)
} as const;
