import got from 'got';
import {Database} from '../../database/database';
import {DebriderEnum} from '../../database/debrider-enum';
import {TorrentInDebriderInfos} from '../../entities/torrent-in-debrider-infos';
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
class UptoboxLink extends String {
  url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }

  getFileCode(): UptoboxFileCode {
    const code = this.url.replace('https://uptobox.com/','');
    return new UptoboxFileCode(code);
  }
}

// TODO extract in value object
class FileName extends String {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}



export class AllDebrid implements IDebrider {

  async getUptoboxLink(magnetId: number): Promise<UptoboxLink> {
    try {

      // TODO: we should take the user api key

      const response = await got(`https://api.alldebrid.com/v4/magnet/status?agent=lazyker&apikey=abswtHHkX4v0cKE2P0Qd&id=${magnetId}`, { json: true })

      const body = response.body as GetMagnetStatusDto;

      return new UptoboxLink(body.data.magnets.links[0].link);
    } catch(error) {
      console.log(error.message);
    }
  }

  async addMagnetLink(magnetLink: string, user: User): Promise<TorrentInDebriderInfos> {
    try {

      // TODO: we should take the user api key

      const response = await got(`https://api.alldebrid.com/v4/magnet/upload?agent=lazyker&apikey=abswtHHkX4v0cKE2P0Qd&magnets[]=${magnetLink}`, { json: true })

      const body = response.body as AddMagnetDto;

      return new TorrentInDebriderInfos(body.data.magnets[0].id, body.data.magnets[0].ready);

    } catch(error) {
      console.log(error.message);
    }
  }

  static async disconnect(user: User): Promise<void> {
    await Database.removeDebrider(user, DebriderEnum.ALLDEBRID);
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

      await Database.storeAlldebridApiKey(user, DebriderEnum.ALLDEBRID, apiKey);

      return apiKey;

    } catch(error) {
      console.error(error.message);
    }
  }

}
