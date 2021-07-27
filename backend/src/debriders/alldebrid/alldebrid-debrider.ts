import got from 'got';
import {Database} from '../../database/database';
import {DebridersEnum} from '../../entities/debriders.enum';
import {AlldebridTorrentsDto} from '../../dtos/alldebrid-torrents.dto';
import {TorrentFromFrontDto} from '../../dtos/torrent-from-front.dto';
import {TorrentToFrontDTO} from '../../dtos/torrent-to-front.dto';
import {TorrentInDebriderInfos} from '../../entities/torrent-in-debrider-infos';
import {TorrentStatusEnum} from '../../entities/torrent-status.enum';
import {User} from '../../entities/user';
import {UptoboxFileCode} from '../../storage/uptobox/uptobox';
import {IDebrider} from '../i-debrider';

interface AddMagnetDto {
  status: string;
  data: {
    magnets: [
      {
        magnet: string,
        hash: string
        name: string,
        filename_original: string,
        size: number,
        ready: boolean,
        id: number
      }
    ]
  }
}

interface CreatePinDto {
  status: string;
  data: {
    pin: string;
    check: string;
    expires_in: number;
    user_url: string;
    base_url: string;
    check_url: string;
  }
}

interface CheckPinStatusDto {
  status: string;
  data: {
    apikey: string;
    activated: boolean;
    expires_in: number;
  }
}

interface GetMagnetStatusDto {
  status: string;
  data: {
    magnets: MagnetStatusDto;
  }
}

interface MagnetStatusDto {
  id: number;
  filename: string;
  size: number;
  hash: string
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
  links: LinkMagnetDto[];
}

interface LinkMagnetDto {
  link: string;
  filename: string;
  size: number;
  files: [
    {
      n: FileName
    }
  ]
}

// TODO extract in value object
class UptoboxLink {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  getFileCode(): UptoboxFileCode {
    const code = this.url.replace('https://uptobox.com/','');
    return new UptoboxFileCode(code);
  }
}

// TODO extract in value object
class FileName {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}



export class AllDebrid implements IDebrider {

  async getUptoboxLink(magnetId: number, user: User): Promise<UptoboxLink> {
    try {

      // TODO: we should take the user api key

      const response = await got(`https://api.alldebrid.com/v4/magnet/status?agent=lazyker&apikey=${user.settings.debriders.alldebrid.apiKey}&id=${magnetId}`, { json: true })

      const body = response.body as GetMagnetStatusDto;

      return new UptoboxLink(body.data.magnets.links[0].link);
    } catch(error) {
      console.log(error.message);
    }
  }

  async addMagnetLink(magnetLink: string, user: User): Promise<TorrentInDebriderInfos> {
    try {

      // TODO: we should take the user api key

      const response = await got(`https://api.alldebrid.com/v4/magnet/upload?agent=lazyker&apikey=${user.settings.debriders.alldebrid.apiKey}&magnets[]=${magnetLink}`, { json: true })

      const body = response.body as AddMagnetDto;

      return new TorrentInDebriderInfos(body.data.magnets[0].id, body.data.magnets[0].ready);

    } catch(error) {
      console.log(error.message);
    }
  }

  static async listTorrents(user: User): Promise<TorrentToFrontDTO[]> {

    try {
      const apikey = await Database.getAlldebridApiKey(user);

      const response = await got(`https://api.alldebrid.com/v4/magnet/status?agent=lazyker&apikey=${apikey}`, { json: true });

      const alldebridTorrents = response.body as AlldebridTorrentsDto;

      return alldebridTorrents.data.magnets.map(alldebridTorrent => {

        let status: TorrentStatusEnum;

        switch(alldebridTorrent.statusCode) {
          case 0: {
            status = TorrentStatusEnum.QUEUED;
            break;
          }
          case 1: {
            status = TorrentStatusEnum.DOWNLOADING;
            break;
          }
          case 2: {
            status = TorrentStatusEnum.DOWNLOADING;
            break;
          }
          case 3: {
            status = TorrentStatusEnum.DOWNLOADING;
            break;
          }
          case 4: {
            status = TorrentStatusEnum.DOWNLOADED;
            break;
          }
          case 5: {
            status = TorrentStatusEnum.ERROR;
            break;
          }
          case 6: {
            status = TorrentStatusEnum.ERROR;
            break;
          }
          case 7: {
            status = TorrentStatusEnum.ERROR;
            break;
          }
          case 8: {
            status = TorrentStatusEnum.ERROR;
            break;
          }
          case 9: {
            status = TorrentStatusEnum.ERROR;
            break;
          }
          case 10: {
            status = TorrentStatusEnum.ERROR;
            break;
          }
          case 11: {
            status = TorrentStatusEnum.ERROR;
            break;
          }
        }

        return {
          filename: alldebridTorrent.filename,
          status: status,
          id: alldebridTorrent.id.toString(),
          progress: (alldebridTorrent.size/alldebridTorrent.downloaded)*100
        } as TorrentToFrontDTO
      });

    } catch(error) {
      console.log(error.message);
    }
  }

  static async deleteTorrent(user: User, torrentId: string): Promise<void> {
    try {
      const apikey = await Database.getAlldebridApiKey(user);
      await got(`https://api.alldebrid.com/v4/magnet/delete?agent=lazyker&apikey=${apikey}&id=${torrentId}`, { json: true });
    } catch(error) {
      throw new Error('Error in alldebrid-debrider -> ' + error.message);
    }
  }

  static async disconnect(user: User): Promise<void> {
    await Database.removeDebrider(user, DebridersEnum.ALLDEBRID);
  }

  static async getPinCode(): Promise<CreatePinDto> {
    try {

      // Get a fresh new pin
      const response = await got(`https://api.alldebrid.com/v4/pin/get?agent=lazyker`, { json: true })

      return response.body as CreatePinDto;

    } catch(error) {
      console.error(error.message);
    }
  }

  static async checkPinCodeStatus(user: User, pin: string, check: string): Promise<CheckPinStatusDto> {
    try {

      // Check status of a particular pin code
      const response = await got(`https://api.alldebrid.com/v4/pin/check?agent=lazyker&check=${check}&pin=${pin}`, { json: true })

      const pinStatus = response.body as CheckPinStatusDto;

      if (pinStatus.data.activated) {
        await this.storeAlldebridToken(user, pinStatus.data.apikey);
      }

      return pinStatus;

    } catch(error) {
      console.error(error.message);
    }
  }

  static async storeAlldebridToken(user: User, apiKey: string): Promise<string> {
    try {

      await Database.storeAlldebridApiKey(user, DebridersEnum.ALLDEBRID, apiKey);

      return apiKey;

    } catch(error) {
      console.error(error.message);
    }
  }

}
