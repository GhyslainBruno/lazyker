import {Debrider} from '../debrider';
import got from 'got';

export class AllDebrid implements Debrider {

  async addMagnetLink(magnetLink: string, user: any): Promise<any> {

    try {
      const result = await got(`https://api.alldebrid.com/v4/magnet/upload?agent=lazyker&apikey=abswtHHkX4v0cKE2P0Qd&magnets[]=${magnetLink}`)

      console.log(result.body);

      return result;
    } catch(error) {
      console.log(error.message);
    }

  }

}
