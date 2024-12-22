exports.getUser = async (req, res) => {
  return res.json({ success: true, data: ["user A", "user B"] });
};
