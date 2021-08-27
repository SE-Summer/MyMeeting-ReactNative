import DocumentPicker, {DocumentPickerResponse} from "react-native-document-picker";
import {FileInfo, FileJobStatus} from "../utils/Types";
import {
    DownloadBeginCallbackResult,
    DownloadProgressCallbackResult,
    DownloadResult,
    UploadProgressCallbackResult
} from "react-native-fs";
import {fileUploadURL, serviceConfig} from "../ServiceConfig";
import {config_key} from "../Constants"
import getPath from '@flyerhq/react-native-android-uri-path'
import {Platform} from "react-native";

const RNFS = require('react-native-fs');

export class FileService
{

    constructor() {}

    public getDefaultDownloadPath()
    {
        return RNFS.DownloadDirectoryPath;
    }

    public getBundlePath()
    {
        if (Platform.OS == 'android') {
            return RNFS.DocumentDirectoryPath;
        } else if (Platform.OS == 'ios') {
            return RNFS.MainBundlePath;
        } else {
            return null;
        }
    }

    public getPathByURI(uri: string): string
    {
        let realPath = null;
        if (Platform.OS == 'android') {
            realPath = getPath(uri);
        } else if (Platform.OS == 'ios') {
            const split = uri.split('/');
            const name = split.pop();
            const inbox = split.pop();
            realPath = `${RNFS.TemporaryDirectoryPath}${inbox}/${name}`;
        } else {
            console.error('[Error]  Fail to convert URI to realPath: Platform not supported');
            throw Error('Fail to convert URI to realPath: Platform not supported');
        }
        console.log(`[Log]  File path converted: ${realPath}`);
        return realPath;
    }

    public async pickFile(): Promise<FileInfo>
    {
        const picked = await DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles],
        });
        console.log(`[Log]  File picked: URI: ${picked.uri}, Type: ${picked.type}, Name: ${picked.name}, Size: ${picked.size}`);

        let path = null;

        try {
            path = this.getPathByURI(picked.uri);
        } catch (err) {
            return Promise.reject('Fail to convert URI to realPath');
        }

        return {
            name: picked.name,
            path: path,
            size: picked.size,
            type: picked.type,
            uri: picked.uri,
        };
    }

    public async uploadFile(file: FileInfo, _onUploadProgress: (bytesSent: number, totalBytes: number) => void): Promise<string>
    {
        try {
            const uploadFileItem = {
                name: 'file',
                filename: file.name,
                filepath: file.path,
                filetype: 'multipart/form-data',
            };

            const uploadFileOptions = {
                toUrl: fileUploadURL(config_key.token),
                files: [uploadFileItem],
                headers: {
                    // 'Content-Type': 'multipart/form-data',
                },
                method: 'POST',
                progress: (res: UploadProgressCallbackResult) => {
                    _onUploadProgress(res.totalBytesSent, res.totalBytesExpectedToSend);
                    console.log('[Log]  File uploading ... ' + (res.totalBytesSent / res.totalBytesExpectedToSend * 100 | 0) + '%');
                },
            };

            const { jobId, promise } = RNFS.uploadFiles(uploadFileOptions);
            const result = await promise;
            const response = JSON.parse(result.body);

            if (result.statusCode == 200 && response.status == 'OK' && response.path) {
                console.log(`[Log]  File updated to path = ${response.path}`);
                return `${serviceConfig.serverURL}${response.path}`;
            } else {
                console.error('[Error]  Fail to upload file');
                return Promise.reject('Fail to upload file');
            }
        } catch (err) {
            if(err.description == "cancelled") {
                console.warn('[File]  User cancelled the upload');
            } else {
                console.error('[Error]  Fail to upload file', JSON.stringify(err));
                return Promise.reject('Fail to upload file');
            }
        }
    }

    public async download(fromURL: string, savePath: string,
                          _onDownloadProgress: (bytesSent: number, totalBytes: number) => void,
                          setFileJobStatus: (fileJobStatus: FileJobStatus) => void): Promise<void>
    {
        try {
            const downloadOpts = {
                fromUrl: fromURL,
                toFile: savePath,
                progressInterval: 800,
                begin: (res: DownloadBeginCallbackResult) => {
                    _onDownloadProgress(0, res.contentLength);
                    setFileJobStatus(res.statusCode == 200 ? FileJobStatus.progressing : FileJobStatus.failed);
                    console.log('[Log]  File download begins, jobId = ' + res.jobId);
                },
                progress: (res: DownloadProgressCallbackResult) => {
                    _onDownloadProgress(res.bytesWritten, res.contentLength);
                    console.log('[Log]  File downloading ... ' + (res.bytesWritten / res.contentLength * 100 | 0) + '%');
                },
            };
            const { jobId, promise } = RNFS.downloadFile(downloadOpts);
            const result: DownloadResult = await promise;

            if (result.statusCode == 200) {
                setFileJobStatus(FileJobStatus.completed);
                console.log('[Log]  File downloaded to path = ' + savePath);
            } else {
                setFileJobStatus(FileJobStatus.failed);
                console.error('[Error]  Fail to download file');
                return Promise.reject('Fail to download file');
            }

        } catch (err) {
            if(err.description == "cancelled") {
                console.warn('[File]  User cancelled the download');
            } else {
                console.error('[Error]  Fail to download file', JSON.stringify(err));
                return Promise.reject('Fail to download file');
            }
        }
    }
}
