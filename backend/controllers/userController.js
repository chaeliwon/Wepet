exports.login = (req, res) => {
  // 로그인 로직
  let { userEmail, userPw } = req.body;

  console.log(userEmail);
};

exports.join = (req, res) => {
  // 회원 가입 로직
};

exports.update = (req, res) => {
  // 회원 정보 수정 로직
};

exports.delete = (req, res) => {
  // 회원 정보 삭제 로직
};
