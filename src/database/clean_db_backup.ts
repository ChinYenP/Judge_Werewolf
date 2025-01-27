//Usage (replace <>): node clean_db_backup.js <n: unsigned int>
//Function: Delete all backup files except n most recent files.

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

let n: number = 10;
if (process.argv.length === 3) {
    n = parseInt(process.argv[2] ?? "10");
}
if (isNaN(n) || n < 0) {
    console.error('Invalid value for n. It must be a positive integer.');
    process.exit(1); // Exit the process with an error code
}

const directory_path: string = process.env.DBBACKUPFOLDER;

async function readAndProcessFiles() {
    // Read the directory contents
    const file_arr: string[] = await fs.promises.readdir(directory_path);

    const filePromises: Promise<{ file_path: string, modification_time: Date }>[] = file_arr.map(async (file) => {
        const filePath: string = path.join(directory_path, file);
        const stats = await fs.promises.stat(filePath);
        return ({file_path: filePath, modification_time: stats.mtime});
    })

    // Wait for all promises to resolve and process the data
    const files_data: { file_path: string, modification_time: Date }[] = await Promise.all(filePromises);

    //Sort oldest first, recent last
    files_data.sort((file1,file2) => file1.modification_time.getTime() - file2.modification_time.getTime());

    files_data.splice(files_data.length - n, files_data.length + 1);

    // Delete the files
    for (const file of files_data) {
        try {
            console.log(`Deleting file: ${file.file_path}`);
            await fs.promises.unlink(file.file_path);
        } catch (err) {
            console.error(`Error deleting file ${file.file_path}:`, err);
        }
    }
}

await readAndProcessFiles();