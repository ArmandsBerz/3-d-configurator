// eslint-disable-next-line import/prefer-default-export

export const playerPosition = {
    infield: {
        glove: ['openBack'],
        web: [
            'modTrap',
            'i',
            'h',
            'onePiece',
            'framedModTrap',
            'basket',
            'singlePostLace',
            'singlePost',
        ],
        size: ['11"', '11.25"', '11.5"', '11.75"', '12"', '12.25"'],
    },
    outfield: {
        glove: ['openBack', 'closeBack'],
        web: [
            'modTrap',
            'h',
            'framedModTrap',
            'lacedH',
            'trap',
        ],
        size: ['12"', '12.25"', '12.5"', '12.75"', '13"'],
    },
    pitcher: {
        glove: ['openBack', 'closeBack'],
        web: [
            'modTrap',
            'onePiece',
            'twoPiece',
            'dualHinge',
            'framedModTrap',
            'closedV',
            'basket',
            'basketLace',
            'sealing',
            'laceSealing',
        ],
        size: ['11.25"', '11.5"', '11.75"', '12"', '12.25"', '12.5"'],
    },
    'first base': {
        glove: ['firstBase'],
        web: [
            'twoPieceFB',
            'postFB',
        ],
        size: ['12"', '12.25"', '12.5"', '12.75"', '13"'],
    },
    catcher: {
        glove: ['catchers'],
        web: ['twoPieceCM'],
        size: ['32"', '32.5"', '33"', '33.5"', '34"'],
    },
};

export const configBuild = {
    'Glove Leather': ['Japanese Kip', 'US Steerhide'],
    Position: ['infield', 'outfield', 'pitcher', 'catcher', 'first base'],
    // Size: ['11"', '11.25"', '11.5"', '11.75"', '12"'],
    Size: playerPosition.infield.size,
    'Hand Opening Size': ['adult', 'youth'],
    Stiffness: ['stiff', 'standard', 'soft'],
    'Throwing Hand': ['right hand', 'left hand'],
};
