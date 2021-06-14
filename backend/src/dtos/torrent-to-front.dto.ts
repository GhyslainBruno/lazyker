export type TorrentToFrontDTO = {
    filename: string;
    // TODO: change that to an enum
    status: string;
    // Maybe use a value object for this property
    id: string;
    // Between 0 to 100
    progress: number;
}
