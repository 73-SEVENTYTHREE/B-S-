module.exports = function (n) {
    const arr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let ans = '';
    for(let i = 0; i < n; i++){
        let rand = Math.floor((Math.random()*62));
        ans += arr[rand];
    }
    return ans;
}