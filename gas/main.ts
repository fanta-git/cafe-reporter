const ROWS = ['id', 'video_id', 'title', 'artist_id', 'artist_name', 'start_time', 'msec_duration', 'published_at', 'request_user_ids', 'created_at', 'updated_at', 'reasons', 'thumbnail', 'new_fav_user_ids', 'baseinfo', 'colors', 'presenter_user_ids', 'belt_message', 'now_message', 'rotate_action', 'bpm', 'display_playlist_link'] as const;
const STRING_FORMAT_ROWS = ['request_user_ids', 'new_fav_user_ids', 'presenter_user_ids'] as const;

function test() {
    const response = UrlFetchApp.fetch("https://cafeapi.kiite.jp/api/cafe/timetable?limit=100");
    if (response.getResponseCode() !== 200) throw Error(response.getResponseCode() + " Error");
    const json = JSON.parse(response.getContentText()) as any[];

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();

    const lastRow = sheet.getLastRow();

    const lastId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() : 0;
    const timetableDiff = json.filter(v => v.id > lastId).reverse();
    if (timetableDiff.length === 0) return;

    const writeData = timetableDiff.map(v => ROWS.map(k =>
        convertString[k](v[k])
    ));

    for (const key of STRING_FORMAT_ROWS) {
        sheet.getRange(lastRow + 1, ROWS.indexOf(key), writeData.length, 1).setNumberFormat('@');
    }

    sheet.getRange(lastRow + 1, 1, writeData.length, writeData[0].length).setValues(writeData);
}

const convertString: Record<typeof ROWS[number], (v: any) => string> = {
    id: v => String(v),
    video_id: v => String(v),
    title: v => String(v),
    artist_id: v => String(v),
    artist_name: v => String(v),
    start_time: v => String(v),
    msec_duration: v => String(v),
    published_at: v => String(v),
    request_user_ids: v => String(v),
    created_at: v => String(v),
    updated_at: v => String(v),
    reasons: v => String(v),
    thumbnail: v => String(v),
    new_fav_user_ids: v => String(v),
    baseinfo: v => String(v),
    colors: v => String(v),
    presenter_user_ids: v => String(v),
    belt_message: v => String(v),
    now_message: v => String(v),
    rotate_action: v => String(v),
    bpm: v => String(v),
    display_playlist_link: v => String(v)
};
