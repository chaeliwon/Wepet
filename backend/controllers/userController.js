exports.login = (req, res) => {
  // 로그인 로직
};

exports.join = (req, res) => {
  // 회원 가입 로직
  let { email, pw, nick } = req.body;
  let sql = `INSERT INTO user_info (user_email, user_pw, user_nick) values (?, ?, ?)`;
};

exports.update = (req, res) => {
  // 회원 정보 수정 로직
};

exports.delete = (req, res) => {
  // 회원 정보 삭제 로직
};
