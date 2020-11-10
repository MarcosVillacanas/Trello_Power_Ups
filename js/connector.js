require('babel-polyfill');
require('babel-plugin-transform-runtime');

const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';
const WHITE_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';
const BLACK_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-black.svg';


let approvedKeyResultsSet = new Set();

function setBadges (t, flag){
    if (flag === null) {
        return null;
    }

    t.card('id').get('id').then(id => (flag)?
        approvedKeyResultsSet.add(id) : null);

    return t.card('members').get('members').then(members => {
        return {
            text: (flag) ? 'APPROVED ' + members.length : 'INVALID -1',
            color: (flag) ? 'green' : 'red'
        }
    })
}

function checkDesc (t, nameFlag) {
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

function checkName (t) {
    return t.card('name')
        .get('name')
        .then(function(cardName){
            cardName = cardName.toUpperCase();
            return (cardName.startsWith("#KR"));
        });
}

function printCardBackDescription (t) {
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

function sortKeyResultsAux (a, b) {
    a.name = a.name.toUpperCase();
    b.name = b.name.toUpperCase();
    if (a.name === "#OKR") {
        return -1;
    }
    else if (b.name === "#OKR") {
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
    return -1;
}

function sortKeyResults (t) {
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
        return list.id;
    }
    catch (error) {
        console.error(error);
    }
}

async function getAboveCards(okrList, API_KEY, TOKEN) {
    try {
        const response = await fetch('https://api.trello.com/1/lists/'
            + okrList + '/cards?key=' + API_KEY + '&token=' + TOKEN, {
            method: 'GET'
        });
        const cards = await response.json();

        let i = 0;
        while (cards[i].name !== "#OKR") {
            if (!approvedKeyResultsSet.has(cards[i].id)) {
                console.log("bad key result")
            }
            i++;
        }
        return cards.slice(0, i);
    }
    catch (error) {
        console.error(error);
    }
}

async function createPBList(okrBoard, API_KEY, TOKEN) {
    try {
        const response = await fetch('https://api.trello.com/1/boards/'
            + okrBoard + '/lists?key=' + API_KEY + '&token=' + TOKEN, {
            method: 'GET'
        });
        const lists = await response.json();

        let i = 0;
        let found = false;
        while (!found && i < lists.length) {
            found = lists[i].name === "Product Backlog";
            i++;
        }

        if (found) {
            return lists[i].id;
        }

        const responsePost = await fetch('https://api.trello.com/1/lists?key=' + API_KEY
            + '&token=' + TOKEN + '&name=Product Backlog&idBoard=' + okrBoard , {
            method: 'POST'
        });
        const list = await responsePost.json();
        return list.id;
    }
    catch (error) {
        console.error(error);
    }
}

function splitCardDesc(desc) {
    desc = desc.toLowerCase();
    let firstNumber = desc.split("from")[1].split("to")[0].match(/\d/g).join("");
    let secondNumber = desc.split("to")[1].split(" ")[1].match(/\d/g).join("");
    console.log(firstNumber, " ", secondNumber)
}

async function createLabel(cardName, colorIndex, okrBoard, API_KEY, TOKEN) {

    const labelColors = ['yellow', 'purple', 'blue', 'red', 'green', 'orange', 'black', 'sky', 'pink', 'lime'];

    const response = await fetch('https://api.trello.com/1/boards/'
        + okrBoard + '/labels?key=' + API_KEY + '&token=' + TOKEN, {
        method: 'GET'
    });
    const labels = await response.json();

    let i = 0;
    let found = false;
    while (!found && i < labels.length) {
        found = labels[i].name === cardName;
        i++;
    }

    if (found) {
        return labels[i].id;
    }

    const responsePost = await fetch('https://api.trello.com/1/labels?key=' + API_KEY
        + '&token=' + TOKEN + '&name=' + cardName.substr(1) + '&color=' + labelColors[colorIndex]
        + '&idBoard=' + okrBoard, {
        method: 'POST'
    });
    const label = await responsePost.json();
    return label.id;


}

async function createCards(aboveCards, pbList, okrBoard, API_KEY, TOKEN) {

    let colorIndex = 0;

    for (const card of aboveCards) {
        try {
            const label = await createLabel(card.name, colorIndex, okrBoard, API_KEY, TOKEN);

            const response = await fetch('https://api.trello.com/1/lists/'
                + pbList + '/cards?key=' + API_KEY + '&token=' + TOKEN, {
                method: 'GET'
            });
            const pbCards = await response.json();

            let i = 0;
            let found = false;
            while (!found && i < pbCards.length) {
                found = pbCards[i].name === card.name;
                i++;
            }

            if (!found) {
                await fetch('https://api.trello.com/1/cards?key=' + API_KEY
                    + '&token=' + TOKEN + '&name=' + card.desc + '&idList=' + okrBoard
                    + '&idLabels=' + [label], {
                    method: 'POST'
                });
                colorIndex++;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}

async function createOKR (t, token) {
    let API_KEY = '5b78ab18393c29272dc25f6772ae72bf';
    let TOKEN = token;
    let okrCard = t.getContext().card;

    // acceder a mi columna

    let okrList = await getOKRList(okrCard, API_KEY, TOKEN);

    // leer las tarjetas que están por encima de OKR

    let aboveCards = await getAboveCards(okrList, API_KEY, TOKEN);

    // crear una lista llamada Product Backlog

    let pbList = await createPBList(t.getContext().board, API_KEY, TOKEN);

    // por cada una, crear una etiqueta, una tarjeta en PB
    // por cada tarjeta nueva en PB, un checklist con tres elementos

    await createCards(aboveCards, pbList, t.getContext().board, API_KEY, TOKEN);
}

function goOKR (t) {
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


function authorizeMe(context) {
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

