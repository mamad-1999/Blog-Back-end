import fs from 'fs';

const fileDelete = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};

export default fileDelete;
