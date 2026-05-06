
const login = async (req, res) => {
  res.redirect('index');
}

const RegisterStore = async (req, res) => {
  let resp = { status: false, message: 'Oops Samething went wrong?', data: null }
  return res.render("page-register", { layout: false, message: resp });
}

const logout = async (req, res) => {
  res.clearCookie('token');
  res.redirect('page-login');
};

module.exports = { RegisterStore, login, logout }
