import {Database} from '../database/database';
import {AllDebrid} from '../debriders/alldebrid/alldebrid-debrider';
import {IDebrider} from '../debriders/i-debrider';
import {MediaInfos} from '../entities/media-infos';
import {TorrentInDebriderInfos} from '../entities/torrent-in-debrider-infos';
import {User} from '../entities/user';
import {IStorage} from './i-storage';
import {Uptobox} from './uptobox/uptobox';

export class Storage implements IStorage {
  debrider: IDebrider;
  storage: IStorage;
  user: User

  constructor(debriderType: new (...args: any[]) => any, storageType: new (...args: any[]) => any, user: User) {
    switch (storageType) {
      case Uptobox: {
        this.storage = new Uptobox();
        break;
      }

      default: {
        // Statement
        break;
      }
    }
    switch (debriderType) {
      case AllDebrid: {
        this.debrider = new AllDebrid();
        break;
      }

      default: {
        // Statement
        break;
      }
    }
    this.user = user;
  }

  async addTorrent(mediaInfos: MediaInfos, torrentInfos: TorrentInDebriderInfos, user: User): Promise<any> {

    try {
      // If the torrent is ready, add it automatically to storages
      if(this.storage instanceof Uptobox && this.debrider instanceof AllDebrid) {

        if (torrentInfos.isReady) {
          // Get the Uptobox link corresponding to the torrent file in Alldebrid
          const uptoboxLink = await this.debrider.getUptoboxLink(torrentInfos.id, user);

          // Add the media to the uptobox storages
          const fileCode = await this.storage.addFile(uptoboxLink.getFileCode(), user);

          // Create a new folder named that way : "title (year)"
          const folderId = await this.storage.createMovieFolder(mediaInfos, user);

          // Move the previously added torrent to the wanted location (which is inside the previously created folder)
          await this.storage.moveFile(fileCode, folderId, user);

          // Create a new file name to be used by the torrent added
          const newFileName = encodeURIComponent(mediaInfos.title + ' (' + mediaInfos.year + ')');

          // Rename the torrent
          await this.storage.renameFile(fileCode, newFileName, user);

          // If torrent is not ready yet, then add infos in database to be able to add it to storages when it's ready
        } else {

          // Adding in db torrent's information to be able to create a directory (for the download) with a proper name
          // (not only using torrent name for that)
          // await Database.store(user, `/torrentsDownloaded/${torrentInfos.id}`, {torrentInfos, mediaInfo: mediaInfos})

          await Database.storeDownloadedTorrentInDebrider(user, torrentInfos, mediaInfos);

        }

      }
    } catch(error) {
      throw new Error('Error in storages class -> ' + error.message);
    }
  }
}
