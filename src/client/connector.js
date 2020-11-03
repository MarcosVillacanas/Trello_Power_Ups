const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

let setBadges = function(flag){
    if (flag === null) {
        return null;
    }
    return {
        text: (flag)? 'APPROVED' : 'INVALID',
        color: (flag)? 'green' : 'red'
    };
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
                return {
                    title: 'OKR Management Tool Info' + t.getContext().board,
                    icon: GRAY_ICON, // Must be a gray icon, colored icons not allowed.
                    content: {
                        type: 'iframe',
                        url: t.signUrl('./card-back-section.html'),
                        height: 750 // Max height is 1500
                    }
                };
            }
            return null;
        });
}

window.TrelloPowerUp.initialize({
    'card-back-section': function(t){
        return printCardBackDescription(t);
    },
    'card-badges': function(t) {
        return checkName(t).then(nameFlag => checkDesc(t, nameFlag).then(flag => setBadges(flag)));
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

