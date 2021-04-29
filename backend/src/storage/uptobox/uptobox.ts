import got from 'got';
import {MovieInfos, TorrentId} from '../../debriders/debrider';
import {IStorage} from '../i-storage';

export class UptoboxFileCode extends String {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export class UptoboxFolderId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

interface UptoboxAddFileToAccountDto {
  statusCode: number;
  message: string;
  data: {
    file_code: string;
  }
}

interface UptoboxFolderInfos {
  statusCode: number;
  message: string;
  data: {
    path: string;
    folderTree: [
      {
        fld_id: number;
        fullPath: string;
      }
      ],
    pageCount: number;
    files: [];
    folders: [];
    currentFolder: {
      fld_id: number;
      usr_id: number;
      fld_parent_id: number;
      fld_descr: string;
      fld_name: string;
      fld_password: null;
      subFolderLimitReached: boolean;
      name: string;
      hash: string;
      fileCount: number;
      totalFileSize: number;
    },
    totalFileSize: number;
    totalFileCount: number;
  }
}

export class Uptobox implements IStorage {

  async addFile(fileCode: UptoboxFileCode, user: any): Promise<UptoboxFileCode> {
    try {
      const response  = await got(`https://uptobox.com/api/user/file/alias?token=${user.uptobox.token}&file_code=${fileCode}`, { json: true });
      const body = response.body as UptoboxAddFileToAccountDto;
      return new UptoboxFileCode(body.data.file_code);
    } catch(error) {
      console.log(error.message);
    }
  }

  async createMovieFolder(movieInfos: MovieInfos, user: any): Promise<UptoboxFolderId> {
    try {
      const moviesFolderPath = '//medias/movies';
      const newFolderName = `${movieInfos.title}`;

      // TODO: retrieve the path for movies from user's data in database
      await got.put(`https://uptobox.com/api/user/files?token=${user.uptobox.token}&path=${moviesFolderPath}&name=${newFolderName}`, { json: true });
      return await this.getFolderId(moviesFolderPath + '/' + newFolderName, user);
    } catch(error) {
      console.log(error.message);
    }
  }

  async getFolderId(path: string, user: any): Promise<UptoboxFolderId> {
    try {
      const response = await got(`https://uptobox.com/api/user/files?token=${user.uptobox.token}&path=${path}&limit=1`, { json: true });
      const folderInfos = response.body as UptoboxFolderInfos;
      return new UptoboxFolderId(folderInfos.data.currentFolder.fld_id);
    } catch(error) {
      console.log(error.message);
    }
  }

  async moveFile(fileCode: UptoboxFileCode, destinationFolderId: UptoboxFolderId, user: any): Promise<any> {
    try {

      // TODO: retrieve the path for movies from user's data in database
      const result = await got.patch(`https://uptobox.com/api/user/files?token=${user.uptobox.token}&file_codes=${fileCode.code}&destination_fld_id=${destinationFolderId.id}&action=move`, { json: true });

      console.log(result.body);
    } catch(error) {
      console.log(error.message);
    }
  }

  async addTorrent(torrentId:TorrentId, user:any): Promise<any> {

  }

}
