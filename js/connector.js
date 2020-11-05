const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';
const WHITE_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';
const BLACK_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-black.svg';


let approvedKeyResultsSet = new Set();
let invalidKeyResultsSet = new Set();

let setBadges = function(t, flag){
    if (flag === null) {
        return null;
    }

    t.card('id').get('id').then(id => (flag)?
        approvedKeyResultsSet.add(id) : invalidKeyResultsSet.add(id));

    return t.card('members').get('members').then(members => {
        return {
            text: (flag) ? 'APPROVED ' + members.length : 'INVALID -1',
            color: (flag) ? 'green' : 'red'
        }
    })
}

let checkDesc = function(t, nameFlag) {
    if (nameFlag) {
        return t.card('desc')
            .get('desc')
            .then(function(cardDesc){
                if (cardDesc) {
                    try {
                        cardDesc = cardDesc.toLowerCase();
                        let splitFrom = cardDesc.split("from")[1].split("to")[0];
                        let splitTo = cardDesc.split("to")[1].split(" ")[1];
                        return /\d/.test(splitFrom) && /\d/.test(splitTo);
                    }
                    catch (e) {
                        console.log('Invalid description: ' + e)
                        return false
                    }
                }
                return false;
            });
    }
    return null;
}

let checkName = function(t) {
    return t.card('name')
        .get('name')
        .then(function(cardName){
            cardName = cardName.toUpperCase();
            return (cardName.startsWith("#KR"));
        });
}

let printCardBackDescription = function(t) {
    return t.card('name')
        .get('name')
        .then(function(name) {
            name = name.toUpperCase();
            if (name.startsWith("#OKR")) {
                t.set('card', 'private', 'votes', '100000');
                return {
                    title: 'Board ID: ' + t.getContext().board,
                    icon: GRAY_ICON, // Must be a gray icon, colored icons not allowed.
                    content: {
                        type: 'iframe',
                        url: t.signUrl('https://www.publicdomainpictures.net/pictures/320000/velka/background-image.png'),
                        height: 200 // Max height is 1500
                    }
                };
            }
            return null;
        });
}

let sortKeyResultsAux = function (a, b) {
    a.name = a.name.toUpperCase();
    b.name = b.name.toUpperCase();
    if (a.name === "#OKR") {
        return -1;
    }
    else if (b.name === "#OKR") {
        return 1;
    }
    else if (invalidKeyResultsSet.has(b.id)) {
        return -1;
    }
    else if (invalidKeyResultsSet.has(a.id)) {
        return 1;
    }
    if (approvedKeyResultsSet.has(a.id) && approvedKeyResultsSet.has(b.id)) {
        if (a.members.length > b.members.length) {
            return -1;
        } else if (b.members.length > a.members.length) {
            return 1;
        }
        return 0;
    }
    else if (approvedKeyResultsSet.has(a.id)) {
        return -1;
    }
    else if (approvedKeyResultsSet.has(b.id)) {
        return 1;
    }
    return 0;
}

let sortKeyResults = function (t) {
    return t.list('name', 'id')
        .then(function (list) {
            return [{
                text: "Most Voted Key Results",
                callback: function (t, opts) {
                    // Trello will call this if the user clicks on this sort
                    // opts.cards contains all card objects in the list
                    let sortedCards = opts.cards.sort(
                        function(a,b) {
                           return sortKeyResultsAux(a, b);
                        });

                    return {
                        sortedIds: sortedCards.map(function (c) { return c.id; })
                    };
                }
            }];
        });
}


async function getOKRList(okrCard, API_KEY, TOKEN) {
    try {
        const response = await fetch('https://api.trello.com/1/cards/'
            + okrCard + '/list?key=' + API_KEY + '&token=' + TOKEN, {
            method: 'GET'
        });
        const list = await response.json();
        return list;
    }
    catch (error) {
        console.error(error);
    }
}


function createOKR (t, token) {
    let API_KEY = '5b78ab18393c29272dc25f6772ae72bf';
    let TOKEN = token;
    let okrCard = t.getContext().card;

    // acceder a mi columna

    let OKRList = getOKRList(okrCard, API_KEY, TOKEN);
    console.log(OKRList);

    // leer las tarjetas que están por encima de OKR
    // crear una lista llamada Product Backlog
    // por cada una, crear una etiqueta, una tarjeta en PB
    // por cada tarjeta nueva en PB, un checklist con tres elementos
}

let goOKR = function (t) {
    return t.popup({
        type: 'confirm',
        title: 'Go OKR!',
        message: 'Are you sure on creating an OKR plan from this list with the above Key Results?',
        confirmText: 'Yes, please go OKR',
        onConfirm: () => t.getRestApi().getToken()
            .then(token => createOKR(t, token)),
        confirmStyle: 'primary',
        cancelText: 'Not yet, let me check my KR',
        onCancel: function (context) { context.closePopup(); }
    })
};


let authorizeMe = function (context) {
    return context.popup({
        title: 'Authorize Me',
        args: { apiKey: '5b78ab18393c29272dc25f6772ae72bf' }, // Pass in API key to the iframe
        url: './authorize.html', // Check out public/authorize.html to see how to ask a user to auth
        height: 140,
    });
}


window.TrelloPowerUp.initialize({
    'card-back-section': function(t){
        return printCardBackDescription(t);
    },
    'card-badges': function(t) {
        return checkName(t).then(nameFlag => checkDesc(t, nameFlag).then(flag => setBadges(t, flag)));
    },
    'list-sorters': function (t) {
        return sortKeyResults(t);
    },
    'card-buttons': function(t) {
        return t.getRestApi().isAuthorized()
            .then(isAuthorized => {
                if (isAuthorized) {
                    return {
                        icon: {
                            dark: WHITE_ICON,
                            light: BLACK_ICON
                        },
                        text: 'Go OKR!',
                        callback: function (context) { // function to run on click
                            return goOKR(context);
                        }
                    };
                } else {
                    return {
                        icon: {
                            dark: WHITE_ICON,
                            light: BLACK_ICON
                        },
                        text: 'Authorize me!',
                        callback: function (context) { // function to run on click
                            return authorizeMe(context);
                        }
                    };
                }
            });
    }
}, {
    appKey: '5b78ab18393c29272dc25f6772ae72bf',
    appName: 'Weather'
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

