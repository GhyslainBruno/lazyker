import {AllDebrid} from '../debriders/alldebrid/alldebrid-provider';
import {MovieInfos, TorrentId} from '../debriders/debrider';
import {IDebrider} from '../debriders/i-debrider';
import {IStorage} from './i-storage';
import {Uptobox} from './uptobox/uptobox';

export class Storage implements IStorage {
  debrider: IDebrider;
  storage: IStorage;
  user: any

  constructor(debriderType: new (...args: any[]) => any, storageType: new (...args: any[]) => any, user: any) {
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

  async addTorrent(torrentId: TorrentId, movieInfo: MovieInfos, user: any): Promise<any> {

    if(this.storage instanceof Uptobox && this.debrider instanceof AllDebrid && torrentId.isReady) {

      // Get the Uptobox link corresponding to the torrent file in Alldebrid
      const uptoboxLink = await this.debrider.getUptoboxLink(torrentId.id);

      // Add the media to the uptobox storage
      const fileCode = await this.storage.addFile(uptoboxLink.getFileCode(), { uptobox: { token: '9108d29c0ab88cdbb4964790106469921394u' } });

      // Create a new folder naming that way : "title (year)"
      const folderId = await this.storage.createMovieFolder(movieInfo, user);

      // Move the previously added torrent to the wanted location (which is inside the previously created folder)
      await this.storage.moveFile(fileCode, folderId, user);

    }
  }
}
