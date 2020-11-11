require('babel-polyfill');
require('babel-plugin-transform-runtime');

const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';
const WHITE_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-white.svg';
const BLACK_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-black.svg';
const ROCKET_ICON = 'rocket.png';

const API_KEY = '5b78ab18393c29272dc25f6772ae72bf';

let approvedKeyResultsSet = new Set();

function setBadges (t, flag){

    if (flag !== null) {
        t.card('id').get('id').then(id => (flag)?
            approvedKeyResultsSet.add(id) : null);

        return t.card('members').get('members').then(members => {
            return {
                text: (flag) ? 'APPROVED ' + members.length : 'INVALID -1',
                color: (flag) ? 'green' : 'red'
            }
        })
    }
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
                        let splitTo = cardDesc.split("to")[1].split(" ")[1].split(",");
                        return /\d/.test(splitFrom) && /\d/.test(splitTo[0])
                            && /\d/.test(splitTo[1]) && /\d/.test(splitTo[2]);
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
        .then(function () {
            return [{
                text: "Most Voted Key Results",
                callback: function (t, opts) {
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

async function apiRequest(url, method) {

    try {
        const response = await fetch('https://api.trello.com/1/' + url, {
            method: method
        });
        return await response.json();
    }
    catch (error) {
        console.error(error);
    }
}

async function getAboveCards(okrList, TOKEN) {

    const cards = await apiRequest('lists/' + okrList + '/cards?key=' + API_KEY + '&token=' + TOKEN, 'GET');

    const i = cards.map(function(card) {return card.name; }).indexOf("#OKR");

    return cards.slice(0, i).filter(card => approvedKeyResultsSet.has(card.id));
}

async function createPBList(okrBoard, TOKEN) {

    const lists = await apiRequest('boards/' + okrBoard + '/lists?key=' + API_KEY + '&token=' + TOKEN, 'GET');

    let i = 0;
    while (i < lists.length) {
        if (lists[i].name === "Product Backlog") {
            return lists[i].id;
        }
        i++;
    }

    const list = await apiRequest('lists?key=' + API_KEY + '&token=' + TOKEN
        + '&name=Product Backlog&idBoard=' + okrBoard, 'POST');

    return list.id;
}

async function createLabel(cardName, colorIndex, okrBoard, TOKEN) {

    const labels = await apiRequest('boards/' + okrBoard + '/labels?key=' + API_KEY + '&token=' + TOKEN, 'GET');

    let i = 0;
    while (i < labels.length) {
        if (labels[i].name === cardName.substr(1)) {
            return labels[i].id;
        }
        i++;
    }

    const labelColors = ['yellow', 'purple', 'blue', 'red', 'green', 'orange', 'black', 'sky', 'pink', 'lime'];

    const label = await apiRequest('labels?key=' + API_KEY + '&token=' + TOKEN + '&name=' + cardName.substr(1)
        + '&color=' + labelColors[colorIndex] + '&idBoard=' + okrBoard, 'POST');

    return label.id;
}

function splitCardDesc(desc) {

    desc = desc.toLowerCase();
    let firstNumber = parseFloat(desc.split("from")[1].split("to")[0]);
    let secondNumbers = desc.split("to")[1].split(" ")[1].split(",").map(parseFloat);

    secondNumbers = secondNumbers.sort(function(a,b) {
        return (secondNumbers[0] > firstNumber)? a - b : b - a;
    });

    return secondNumbers.map(function(secondNumber) {return "From " + firstNumber + " to " + secondNumber});
}


async function createChecklist(idCard, krDesc, TOKEN) {

    const checklist = await apiRequest('checklists?key=' + API_KEY + '&token=' + TOKEN
        + '&idCard=' + idCard + '&name=Progress', 'POST');

    for (const partialKR of splitCardDesc(krDesc)) {
        await apiRequest('checklists/' + checklist.id + '/checkItems?key=' + API_KEY
            + '&token=' + TOKEN + '&name=' + partialKR, 'POST');
    }
}

async function createCards(aboveCards, pbList, okrBoard, TOKEN) {

    let colorIndex = 0;

    for (const card of aboveCards) {

        const label = await createLabel(card.name, colorIndex, okrBoard, TOKEN);

        const pbCards = await apiRequest('lists/' + pbList + '/cards?key=' + API_KEY
            + '&token=' + TOKEN, 'GET');

        let i = 0;
        let found = false;
        while (!found && i < pbCards.length) {
            found = pbCards[i].name === card.desc.split("from")[0];
            i++;
        }

        if (!found) {
            const newCard = await apiRequest('cards?key=' + API_KEY + '&token=' + TOKEN + '&name='
                + card.desc.split("from")[0] + '&idList=' + pbList + '&idLabels=' + [label], 'POST');

            colorIndex++;

            await createChecklist(newCard.id, card.desc, TOKEN);
        }
    }
}

async function createOKR (t, token) {

    let TOKEN = token;
    const okrCard = t.getContext().card;

    const okrListRequest = await apiRequest('cards/' + okrCard + '/list?key=' + API_KEY + '&token=' + TOKEN);
    const okrList = okrListRequest.id;

    let aboveCards = await getAboveCards(okrList, TOKEN);

    let pbList = await createPBList(t.getContext().board, TOKEN);

    await createCards(aboveCards, pbList, t.getContext().board, TOKEN);
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
}


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
                            dark: ROCKET_ICON,
                            light: ROCKET_ICON
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
