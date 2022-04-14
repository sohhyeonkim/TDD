const uploadSingleImg = (req, res) => {
  return res.json({
    isUploaded: true,
  });
};

module.exports = {
  uploadSingleImg,
};
