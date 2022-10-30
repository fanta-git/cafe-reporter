export type timetableItem = {
    id: number,
    video_id: string,
    title: string,
    artist_id: number,
    artist_name: string,
    start_time: string,
    msec_duration: number,
    published_at: string,
    request_user_ids: number[],
    created_at: string,
    updated_at: string,
    reasons: ({
        type: 'priority_playlist',
        user_id: number,
        list_title: string,
        list_id: string
    } | {
        type: 'add_playlist',
        user_id: number,
        list_id: number
    } | {
        type: 'favorite',
        user_id: number
    })[],
    thumbnail: string,
    new_fav_user_ids: number[] | null,
    baseinfo: {
        video_id: string,
        title: string,
        first_retrieve: string,
        description: string,
        genre: string,
        length: string,
        tags: string[],
        thumbnail_url: string,
        view_counter: string,
        comment_num: string,
        mylist_counter: string,
        embeddable: string,
        no_live_play: string,
        user_id: string,
        user_icon_url: string,
        user_nickname: string
    },
    colors: `#${string}`[],
    presenter_user_ids: number[] | null,
    belt_message: string | null,
    now_message: string | null,
    rotate_action: string | null,
    bpm: number,
    display_playlist_link: boolean
};
