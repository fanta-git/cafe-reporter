function test() {
    const response = UrlFetchApp.fetch("https://cafeapi.kiite.jp/api/cafe/timetable?limit=100");
    if (response.getResponseCode() !== 200) throw Error(response.getResponseCode() + " Error");
    const json = JSON.parse(response.getContentText()) as any[];

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();

    const lastRow = sheet.getLastRow();

    const lastId = sheet.getRange(lastRow, 1).getValue();
    const timetableDiff = json.filter(v => v.id > lastId).reverse();

    const writeData = timetableDiff.map(v => Object.entries(v).map(([k, v]) => convertString[k](v)));
    sheet.getRange(lastRow, 9, writeData.length, 1).setNumberFormat('@');
    sheet.getRange(lastRow, 14, writeData.length, 1).setNumberFormat('@');
    sheet.getRange(lastRow, 1, writeData.length, writeData[0].length).setValues(writeData);
}

const convertString: Record<string, (v: any) => string> = {
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
