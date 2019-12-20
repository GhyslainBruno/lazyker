import React from "react";

const torrents = ({torrents}) => (
    <div>
        {torrents.map(torrent => {
            return(
                <div>
                    {torrent.title}
                </div>
            )
        })}
    </div>
);