'use strict';

/**
 * Module dependencies
 */

// Public node modules.
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { PayloadTooLargeError } = require('@strapi/utils').errors;

const UPLOADS_FOLDER_NAME = 'uploads';

module.exports = {
  init({ sizeLimit = 1000000 } = {}) {
    const verifySize = file => {
      if (file.size > sizeLimit) {
        throw new PayloadTooLargeError();
      }
    };

    // Ensure uploads folder exists
    const uploadPath = path.resolve(strapi.dirs.public, UPLOADS_FOLDER_NAME);
    try {
      fse.ensureDirSync(uploadPath);
    } catch (e) {
      throw new Error(
        `The upload folder (${uploadPath}) doesn't exist. Please make sure it exists.`
      );
    }

    return {
      upload(file) {
        verifySize(file);

        return new Promise((resolve, reject) => {
          // write file in public/assets folder
          fs.writeFile(path.join(uploadPath, `${file.hash}${file.ext}`), file.buffer, err => {
            if (err) {
              return reject(err);
            }

            file.url = `/${UPLOADS_FOLDER_NAME}/${file.hash}${file.ext}`;

            resolve();
          });
        });
      },
      delete(file) {
        return new Promise((resolve, reject) => {
          const filePath = path.join(uploadPath, `${file.hash}${file.ext}`);

          if (!fs.existsSync(filePath)) {
            return resolve("File doesn't exist");
          }

          // remove file from public/assets folder
          fs.unlink(filePath, err => {
            if (err) {
              return reject(err);
            }

            resolve();
          });
        });
      },
    };
  },
};
