const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

let setBadges = function(t, flag){
    if (flag === null) {
        return null;
    }

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
            if (name.startsWith("#ACTIVATE_OKR")) {
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

let sortVotes = function (aVotes, bVotes) {
    console.log(aVotes, "    ", bVotes);
    if (aVotes > bVotes) {
        return 1;
    } else if (bVotes > aVotes) {
        return -1;
    }
    return 0;
}

window.TrelloPowerUp.initialize({
    'card-back-section': function(t){
        return printCardBackDescription(t);
    },
    'card-badges': function(t) {
        return checkName(t).then(nameFlag => checkDesc(t, nameFlag).then(flag => setBadges(t, flag)));
    },
    'list-sorters': function (t) {
        return t.list('name', 'id')
            .then(function (list) {
                return [{
                    text: "Most Voted Key Results",
                    callback: function (t, opts) {
                        // Trello will call this if the user clicks on this sort
                        // opts.cards contains all card objects in the list
                        let sortedCards = opts.cards.sort(
                            function(a,b) {
                                if (a.members.length > b.members.length) {
                                    return -1;
                                } else if (b.members.length > a.members.length) {
                                    return 1;
                                }
                                return 0;
                            });

                        return {
                            sortedIds: sortedCards.map(function (c) { return c.id; })
                        };
                    }
                }];
            });
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

