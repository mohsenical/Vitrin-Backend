const multer = require("multer");
const fs = require("fs");
const path = require("path");

exports.multerStorage = (destination, dynamicMedia = false) => {

  // if (!fs.existsSync(destination)) {
  //   fs.mkdirSync(destination, { recursive: true });
  // }

  const storage = multer.diskStorage({

    destination: function (req, file, cb) {
      // cb(null, destination);

      let uploadPath = destination;

      if (dynamicMedia) {
        if (file.mimetype.startsWith("image/")) {
          uploadPath = path.join(destination, "image")
        } else if (file.mimetype.startsWith("video/")) {
          uploadPath = path.join(destination, "video")
        } else {
          return cb(new Error("Only image or video files are allowed !!"))
        }
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath)
    },

    filename: function (req, file, cb) {
      const imageFile = file.originalname.split(".");
      const extName = imageFile.pop();
      const fileName = imageFile.join(".");

      cb(null, `${fileName}-${Date.now()}.${extName}`);
    },

  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 512_000_000 },
  });

  return upload;
};
