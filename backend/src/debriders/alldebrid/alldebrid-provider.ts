import {Uptobox, UptoboxFileCode} from '../../storage/uptobox/uptobox';
import {Debrider} from '../debrider';
import got from 'got';

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


export class AllDebrid implements Debrider {

  async getUptoboxLink(magnetId: number): Promise<UptoboxLink> {
    try {
      const response = await got(`https://api.alldebrid.com/v4/magnet/status?agent=lazyker&apikey=abswtHHkX4v0cKE2P0Qd&id=${magnetId}`, { json: true })

      const body = response.body as GetMagnetStatusDto;

      return new UptoboxLink(body.data.magnets.links[0].link);
    } catch(error) {
      console.log(error.message);
    }
  }

  async addMagnetLink(magnetLink: string, user: any): Promise<any> {
    try {
      const response = await got(`https://api.alldebrid.com/v4/magnet/upload?agent=lazyker&apikey=abswtHHkX4v0cKE2P0Qd&magnets[]=${magnetLink}`, { json: true })

      const body = response.body as AddMagnetDto;

      // When torrent is ready, add it to uptobox right away
      // For the moment everything is done here, but it should be decoupled at maximum
      if (body.data.magnets[0].ready) {
        const uptoboxLink = await this.getUptoboxLink(body.data.magnets[0].id);

        const uptobox = new Uptobox();
        const newFileCode = await uptobox.addFile(uptoboxLink.getFileCode(), { uptobox: { token: '9108d29c0ab88cdbb4964790106469921394u' } });

        console.log(newFileCode.code);
      }

      // TODO: type the return body, and handle errors
      return body;

    } catch(error) {
      console.log(error.message);
    }
  }

}
