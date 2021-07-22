// SQL语句封裝
const user = {
    queryByUsername: 'SELECT * FROM user WHERE username=?',
    insertUser:'INSERT INTO user (username, password, email) VALUES (?, ?, ?)',
    queryByEmail: 'SELECT * FROM user WHERE email=?',
    updatePassword: 'UPDATE user SET password=? WHERE `email`=?',
    queryDevice: 'SELECT deviceName, isOnline, deviceID from device where ownerName=?'

};

const device = {
    insertMessage : 'INSERT INTO message (content, deviceID, topic) VALUES (?, ?, ?)',
    createDevice: 'insert into device (deviceID, deviceName, ownerName) values (?, ?, ?)',
    queryDevice: 'select * from device where deviceID=?',
    setOnline: 'UPDATE device SET isOnline=1 WHERE deviceID=?',
    setOffline: 'UPDATE device SET isOnline=0 WHERE deviceID=?',
    alterDeviceName: 'UPDATE device SET deviceName=? WHERE deviceID=?',
    deleteDevice: "delete from device where deviceID=?"
}

const message = {
    'queryMessageByDeviceID': 'select * from message where deviceID=?'
}
module.exports = {user, device, message};