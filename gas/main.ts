import { snsSongs, timetableItem } from "./_types";

type arrEntries<T extends readonly any[]> = IterableIterator<[number, T[number]]>;

function main () {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const timetable = fetchApi("https://cafe.kiite.jp/api/cafe/timetable?limit=100").reverse() as timetableItem[];
    timetable.pop();

    const divided: Record<string, timetableItem[]> = {};
    for (const item of timetable) {
        const sheetName = formatSheetName(item.start_time);
        divided[sheetName] = divided[sheetName] ?? [];
        divided[sheetName].push(item);
    }

    for (const [sheetName, monthlyTimetable] of Object.entries(divided)) {
        const sheet = ss.getSheetByName(sheetName) ?? ss.insertSheet().setName(sheetName);

        const lastRow = sheet.getLastRow();
        if (lastRow === 0) {
            sheet.getRange(1, 1, 1, ROWS.length).setValues([[...ROWS]]);
        }
        const startRow = lastRow ? lastRow + 1 : 2;

        const lastId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() : 0;
        const timetableDiff = monthlyTimetable.filter(v => v.id > lastId).map(v => parseNest(v, "baseinfo"));
        if (timetableDiff.length === 0) return;

        const rotateUsers = fetchApi("https://cafe.kiite.jp/api/cafe/rotate_users?ids=" + timetableDiff.map(v => v.id).join(",")) as Record<number, number[] | undefined>;
        const kiiteSongData = fetchApi("https://cafe.kiite.jp/api/sns/songs?video_ids=" + timetableDiff.map(v => v.video_id).join(",")) as snsSongs;
        const songsDataArr = Array.from(Object.assign(kiiteSongData.songs, { length: timetableDiff.length }));
        const combinedTimetable = timetableDiff.map(v => ({
            ...v,
            rotate_users: rotateUsers[v.id] ?? null,
            fav_count: songsDataArr.find(song => song.video_id === v.video_id)?.fav_count ?? 0
        }));

        const writeData: (number | string)[][] = combinedTimetable.map(v => ROWS.map(k => {
            return CONVERT_FUNC[ROWS_FORMAT[k]](v[k]);
        }));

        for (const [index, key] of ROWS.entries() as arrEntries<typeof ROWS>) {
            const formatStr = FORMAT_TYPES[ROWS_FORMAT[key]];
            sheet.getRange(startRow, index + 1, writeData.length, 1).setNumberFormat(formatStr);
        }

        sheet.getRange(startRow, 1, writeData.length, writeData[0].length).setValues(writeData);
    }
}

function fetchApi (url: string) {
    const response = UrlFetchApp.fetch(url);
    if (response.getResponseCode() !== 200) throw Error(response.getResponseCode() + " Error");
    const json = JSON.parse(response.getContentText());
    if (json == null) throw Error("APIの取得に失敗しました");

    return json;
}

function formatSheetName (dataStr: string)  {
    const date = new Date(dataStr);
    const yy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    return `timetable_${yy}_${mm}`;
}

function nullableToStr (val: any) {
    if (val == null) return "null";
    const str = String(val);
    if (/^_*null$/.test(str)) return "_" + str;
    return str;
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
    "rotate_users",
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
    "display_playlist_link",
    "fav_count"
] as const;

const ROWS_FORMAT = {
    id: "id",
    video_id: "string",
    title: "string",
    artist_id: "id",
    artist_name: "string",
    start_time: "date",
    msec_duration: "number",
    published_at: "date",
    request_user_ids: "list",
    created_at: "date",
    updated_at: "date",
    reasons: "json",
    thumbnail: "string",
    new_fav_user_ids: "list",
    rotate_users: "list",
    "baseinfo.video_id": "string",
    "baseinfo.title": "string",
    "baseinfo.first_retrieve": "date",
    "baseinfo.description": "string",
    "baseinfo.genre": "string",
    "baseinfo.length": "length",
    "baseinfo.tags": "list",
    "baseinfo.thumbnail_url": "string",
    "baseinfo.view_counter": "number",
    "baseinfo.comment_num": "number",
    "baseinfo.mylist_counter": "number",
    "baseinfo.embeddable": "number",
    "baseinfo.no_live_play": "number",
    "baseinfo.user_id": "id",
    "baseinfo.user_icon_url": "string",
    "baseinfo.user_nickname": "string",
    colors: "list",
    presenter_user_ids: "list",
    belt_message: "string",
    now_message: "string",
    rotate_action: "string",
    bpm: "number",
    display_playlist_link: "string",
    fav_count: "number"
} as const;

const FORMAT_TYPES = {
    string: "@",
    id: "0",
    number: "#,##0",
    length: "m:ss",
    list: "@",
    date: "yyyy-MM-dd h:mm:ss.000",
    json: "@"
} as const;

const CONVERT_FUNC = {
    string: nullableToStr,
    id: (v: any) => Number(v ?? -1),
    number: (v: any) => Number(v ?? 0),
    length: (v: any) => ["00", ...String(v ?? "0:00").split(":")].slice(-3).map(v => v.padStart(2, "0")).join(":"),
    list: (v: any) => v?.join?.(" ") ?? "null",
    date: (v: any) => v.split("+")[0],
    json: (v: any) => JSON.stringify(v)
} as const;
