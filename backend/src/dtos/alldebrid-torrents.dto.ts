export type AlldebridTorrentsDto = {
    data: {
        magnets: AllDebridTorrent[]
    }
}

export type AllDebridTorrent = {
    id: number;
    filename: string;
    size: number;
    hash: string;
    //TODO: change this by an enum
    status: string;
    statusCode: number;
    downloaded: number;
    uploaded: number;
    seeders: number;
    downloadSpeed: number;
    processingPerc: number;
    uploadSpeed: number;
    uploadDate: number;
    completionDate: number;
    links: [
        {
            link: string;
            filename: string;
            size: number;
            files: [
                {
                    n: string;
                }
            ]
        }
    ],
    type: string;
    notified: boolean;
    version: number;
}
