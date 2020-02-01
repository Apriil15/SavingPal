// 0~9 A~Z (0, 1, I, O 扣掉)

const genInvitationCode = () => {
    const arr = [
        'A',
        'H',
        'V',
        'E',
        '8',
        'S',
        '2',
        'D',
        'Z',
        'X',
        '9',
        'C',
        '7',
        'P',
        '5',
        'I',
        'K',
        '3',
        'M',
        'J',
        'U',
        'F',
        'R',
        '4',
        'W',
        'Y',
        'L',
        'T',
        'N',
        '6',
        'B',
        'G',
        'Q'
    ];
    let invitationCode = '';
    for (let i = 0; i < 6; i++) {
        invitationCode += arr[Math.floor(Math.random() * 33)];
    }
    return invitationCode;
};

module.exports = {
    genInvitationCode
};
