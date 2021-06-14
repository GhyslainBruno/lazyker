import got from 'got';
import {MediaInfos} from '../../entities/media-infos';
import {TorrentInDebriderInfos} from '../../entities/torrent-in-debrider-infos';
import {User} from '../../entities/user';
import {IStorage} from '../i-storage';

export class UptoboxFileCode {
  code: string;

  constructor(code: string) {
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

interface UptoboxFolderDto {
  fld_id: string,
  fld_name: string,
  hash: string,
  name: string,
}

interface UptoboxFileDto {
  file_code: string,
  file_created: Date,
  file_descr: string,
  file_downloads: number,
  file_last_download: Date,
  file_name: string,
  file_password: string,
  file_public: boolean,
  file_size: number,
  id: number,
  last_stream: Date,
  nb_stream: number,
  transcoded: number,
}

interface UptoboxFilesListDto {
  data: {
    currentFolder: {
      fileCount: number,
      fld_id: string,
      fld_name: string,
      fld_parent_id: string,
      hash: string,
      name: string,
      totalFileSize: string,
    },
    folders: UptoboxFolderDto[],
    files: UptoboxFileDto[]
  }
}

interface UptoboxFolder {
  path: string;
  id: string;
  name: string;
}

interface UptoboxFile {
  code: string;
  name: string;
}

interface UptoboxFilesList {
  currentFolder: any,
  folders: UptoboxFolder[],
  files: UptoboxFile[],
}



export class Uptobox implements IStorage {

  async addFile(fileCode: UptoboxFileCode, user: User): Promise<UptoboxFileCode> {
    try {
      const response  = await got(`https://uptobox.com/api/user/file/alias?token=${user.settings.storage.uptobox.token}&file_code=${fileCode.code}`, { json: true });
      const body = response.body as UptoboxAddFileToAccountDto;
      if (!body.data.file_code) throw new Error('Uptobox error : no file code');
      return new UptoboxFileCode(body.data.file_code);
    } catch(error) {
      throw new Error('Error adding a file to uptobox -> ' + error.message);
    }
  }

  async createMovieFolder(movieInfos: MediaInfos, user: User): Promise<UptoboxFolderId> {
    try {
      const moviesFolderPath = user.settings.storage.uptobox.moviesFolder;
      const newFolderName = encodeURIComponent(`${movieInfos.title} (${movieInfos.year})`);
      await got.put(`https://uptobox.com/api/user/files?token=${user.settings.storage.uptobox.token}&path=${moviesFolderPath}&name=${newFolderName}`, { json: true });
      return await this.getFolderId(moviesFolderPath + '/' + newFolderName, user);
    } catch(error) {
      throw new Error('Error in uptobox controller : ' + error.message);
    }
  }

  async getFolderId(path: string, user: User): Promise<UptoboxFolderId> {
    try {
      const response = await got(`https://uptobox.com/api/user/files?token=${user.settings.storage.uptobox.token}&path=${path}&limit=1`, { json: true });
      const folderInfos = response.body as UptoboxFolderInfos;
      return new UptoboxFolderId(folderInfos.data.currentFolder.fld_id);
    } catch(error) {
      throw new Error('Error getting folder ID -> ' + error.message);
    }
  }

  async moveFile(fileCode: UptoboxFileCode, destinationFolderId: UptoboxFolderId, user: User): Promise<any> {
    try {
      return await got.patch(`https://uptobox.com/api/user/files?token=${user.settings.storage.uptobox.token}&file_codes=${fileCode.code}&destination_fld_id=${destinationFolderId.id}&action=move`, { json: true });
    } catch(error) {
      throw new Error('Error moving file -> ' + error.message);
    }
  }

  async renameFile(fileCode: UptoboxFileCode, newName: string, user: User): Promise<any> {
    try {
      return await got.patch(`https://uptobox.com/api/user/files?token=${user.settings.storage.uptobox.token}&file_code=${fileCode.code}&new_name=${newName}`, { json: true });
    } catch(error) {
      throw new Error('Error renaming file -> ' + error.message);
    }
  }

  async addTorrent(mediaInfos: MediaInfos, torrentInfos:TorrentInDebriderInfos, user:User): Promise<any> {

  }

  async listFiles(path: string, user: User): Promise<UptoboxFilesList> {
    try {
      const response = await got(`https://uptobox.com/api/user/files?token=${user.settings.storage.uptobox.token}&path=${path}&limit=50`, { json: true });
      const filesInfosDto = response.body as UptoboxFilesListDto;
      const filesInfosDtoData = filesInfosDto.data;

      return {
        currentFolder: filesInfosDtoData.currentFolder,
        folders: filesInfosDtoData.folders.map((folder: UptoboxFolderDto) => <UptoboxFolder>{ path: folder.fld_name, id: folder.fld_id, name: folder.name }),
        files: filesInfosDtoData.files.map((file: UptoboxFileDto) => <UptoboxFile>{ code: file.file_code, name: file.file_name }),
      } as UptoboxFilesList;

    } catch(error) {
      throw new Error('Error listing uptobox files -> ' + error.message);
    }
  }
}
