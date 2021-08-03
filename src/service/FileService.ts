import DocumentPicker from "react-native-document-picker";
import {postFormData} from "../utils/Utils";
import {FileJob, FileJobStatus} from "../utils/Types";

const AsyncLock = require('async-lock');

const RNFS = require('react-native-fs');

export class FileService
{
    // index: jobId
    private fileJobs: FileJob[] = null;
    private readonly uploadURL: string = null;
    private readonly asyncLock = null;

    constructor(uploadURL: string)
    {
        this.fileJobs = [];
        this.uploadURL = uploadURL;
        this.asyncLock = new AsyncLock();
    }

    public async pickAndUpload(getFileDetails: (jobId: number, filename: string, fileType: string) => void): Promise<string>
    {
        console.log(this.asyncLock);
        try {
            const file = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });
            console.log(`[Log]  File picked: URI: ${file.uri}, Type: ${file.type}, Name: ${file.name}, Size: ${file.size}`);

            let formData = new FormData();
            // @ts-ignore
            formData.append('file', file);

            let jobId: number = null;
            this.asyncLock.acquire('write_fileJobs', () => {
                jobId = this.fileJobs.length;
                this.fileJobs.push({
                    status: FileJobStatus.progressing,
                    totalBytes: file.size,
                    bytesSent: 0,
                });
                getFileDetails(jobId, file.name, file.type);
            });

            const URL = this.uploadURL;
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    this.fileJobs[jobId].totalBytes = progressEvent.total;
                    this.fileJobs[jobId].bytesSent = progressEvent.loaded;
                    console.log('[Log]  File uploading ... ' + (progressEvent.loaded / progressEvent.total * 100 | 0) + '%');
                }
            }

            const result = await postFormData(URL, formData, config);
            if (result.data && result.data.status === 'OK') {
                console.log(`[Log]  File uploaded, path = ${result.data.path}`);
                this.fileJobs[jobId].status = FileJobStatus.completed;
                return result.data.path;
            } else {
                console.error('[Error]  Fail to upload file');
                this.fileJobs[jobId].status = FileJobStatus.failed;
                return Promise.reject('Fail to upload file');
            }

        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.warn('[File]  User cancelled file picker');
            } else {
                console.error('[Error]  Fail to upload file', err);
                return Promise.reject('Fail to upload file');
            }
        }
    }

    public async download(fromURL: string, savePath: string)
    {
        const downloadOpts = {
            fromUrl: fromURL,          // URL to download file from
            toFile: savePath,           // Local filesystem path to save the file to
            // headers?: Headers;        // An object of headers to be passed to the server
            // background?: boolean;     // Continue the download in the background after the app terminates (iOS only)
            // discretionary?: boolean;  // Allow the OS to control the timing and speed of the download to improve perceived performance  (iOS only)
            // cacheable?: boolean;      // Whether the download can be stored in the shared NSURLCache (iOS only, defaults to true)
            // progressInterval?: number;
            // progressDivider?: number;
            // begin?: (res: DownloadBeginCallbackResult) => void;
            // progress?: (res: DownloadProgressCallbackResult) => void;
            // resumable?: () => void;    // only supported on iOS yet
            // connectionTimeout?: number // only supported on Android yet
            // readTimeout?: number       // supported on Android and iOS
            // backgroundTimeout?: number // Maximum time (in milliseconds) to download an entire resource (iOS only, useful for timing out background downloads)
        };
        RNFS.downloadFile(downloadOpts);
    }
}