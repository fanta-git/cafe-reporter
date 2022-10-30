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
    if (lastRow === 0) {
        sheet.getRange(1, 1, 1, ROWS.length).setValues([[...ROWS]]);
    }
    const startRow = lastRow ? lastRow + 1 : 2;

    const lastId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() : 0;
    const timetableDiff = json.filter(v => v.id > lastId).reverse().map(v => parseNest(v, "baseinfo"));
    if (timetableDiff.length === 0) return;

    const writeData: (number | string)[][] = timetableDiff.map(v => ROWS.map(k => {
        return CONVERT_FUNC[ROWS_FORMAT[k]](v[k]);
    }));

    for (const [index, key] of ROWS.entries() as arrEntries<typeof ROWS>) {
        const formatStr = FORMAT_TYPES[ROWS_FORMAT[key]];
        // sheet.getRange(startRow, index + 1, writeData.length, 1).setNumberFormat(formatStr);
        sheet.getRange(2, index + 1, startRow - 2 + writeData.length, 1).setNumberFormat(formatStr);
    }

    sheet.getRange(startRow, 1, writeData.length, writeData[0].length).setValues(writeData);
}

type Join<K, P> = K extends string | number ? P extends string | number ? `${K}.${P}` : never : never
type UnJoin<K> = K extends `${any}.${infer U}` ? U : never;

type Parse<T extends Record<string | number, any>, V extends keyof T> =
    T extends { [K in V]: { [K in infer U]: any} }
        ? T & { [K in Join<V, U>]: T[V][UnJoin<K>] }
        : never;

function parseNest <T extends Record<string | number, any>, K extends keyof T> (obj: T, key: K): Parse<T, K>;
function parseNest (obj: any, key: any) {
    const entries = Object.entries(obj[key]).map(([k, v]) => [`${key}.${k}`, v]);
    return ({ ...obj, ...Object.fromEntries(entries) });
}

const ROWS = [
    "id",
    "video_id",
    "title",
    "artist_id",
    "artist_name",
    "start_time",
    "msec_duration",
    "published_at",
    "request_user_ids",
    "created_at",
    "updated_at",
    "reasons",
    "thumbnail",
    "new_fav_user_ids",
    "baseinfo.video_id",
    "baseinfo.title",
    "baseinfo.first_retrieve",
    "baseinfo.description",
    "baseinfo.genre",
    "baseinfo.length",
    "baseinfo.tags",
    "baseinfo.thumbnail_url",
    "baseinfo.view_counter",
    "baseinfo.comment_num",
    "baseinfo.mylist_counter",
    "baseinfo.embeddable",
    "baseinfo.no_live_play",
    "baseinfo.user_id",
    "baseinfo.user_icon_url",
    "baseinfo.user_nickname",
    "colors",
    "presenter_user_ids",
    "belt_message",
    "now_message",
    "rotate_action",
    "bpm",
    "display_playlist_link"
] as const;

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
    "baseinfo.video_id": "string",
    "baseinfo.title": "string",
    "baseinfo.first_retrieve": "string",
    "baseinfo.description": "string",
    "baseinfo.genre": "string",
    "baseinfo.length": "length",
    "baseinfo.tags": "string",
    "baseinfo.thumbnail_url": "string",
    "baseinfo.view_counter": "number",
    "baseinfo.comment_num": "number",
    "baseinfo.mylist_counter": "number",
    "baseinfo.embeddable": "number",
    "baseinfo.no_live_play": "number",
    "baseinfo.user_id": "id",
    "baseinfo.user_icon_url": "string",
    "baseinfo.user_nickname": "string",
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
    number: "#,##0",
    length: "m:ss"
} as const;

const CONVERT_FUNC = {
    string: (v: any) => String(v ?? "__null__"),
    id: (v: any) => Number(v ?? -1),
    number: (v: any) => Number(v ?? -1),
    length: (v: any) => ["00", ...String(v ?? "0:00").split(":")].slice(-3).map(v => v.padStart(2, "0")).join(":")
} as const;
