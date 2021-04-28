import got from 'got';
import {Storage} from '../storage';

export class UptoboxFileCode extends String {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

interface UptoboxAddFileToAccountDto {
  statusCode: number;
  message: string;
  data: {
    file_code: string;
  }
}

export class Uptobox implements Storage {

  async addFile(fileCode: UptoboxFileCode, user: any): Promise<UptoboxFileCode> {
    try {
      const response  = await got(`https://uptobox.com/api/user/file/alias?token=${user.uptobox.token}&file_code=${fileCode}`, { json: true });

      const body = response.body as UptoboxAddFileToAccountDto;

      return new UptoboxFileCode(body.data.file_code);
    } catch(error) {
      console.log(error.message);
    }
  }

}
