module.exports = function (store) {
    require("./executor")();
    require("./fs_utils")();
    require("./global")(store);
}