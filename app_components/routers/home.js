

async function home(req, res) {
  const { route_name } = res.user;

  if (route_name === "/" || route_name === "Home") {
    res.render("g01_comp_mn");
    res.end();
  }
}

module.exports = home;
