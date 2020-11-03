const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

let setBadges = function(flag){
    return {
        text: (flag)? 'APPROVED' : 'INVALID',
        color: (flag)? 'green' : 'red'
    };
}

let checkDesc = function(t){
    return t.card('desc')
        .get('desc')
        .then(function(cardDesc){
            if (cardDesc) {
                try {
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

window.TrelloPowerUp.initialize({
    'card-back-section': function(t){
        console.log("3");
        return {
            title: 'OKR Management Tool Info',
            content: {
                type: 'iframe',
                url: t.signUrl('../html/info.html'),
                height: 230 // Max height is 1500
            }
        };
    },
    'card-badges': function(t) {
        return checkDesc(t).then(flag => setBadges(flag));
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

