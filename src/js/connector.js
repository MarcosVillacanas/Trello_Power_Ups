var GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

let setBadges = function(t){
    return t.card('name')
        .get('name')
        .then(function(cardName){
            console.log('We just loaded the card name for fun: ' + cardName);
            return [{
                // Dynamic badges can have their function rerun
                // after a set number of seconds defined by refresh.
                // Minimum of 10 seconds.
                dynamic: function(){
                    // we could also return a Promise that resolves to
                    // this as well if we needed to do something async first
                    return {
                        text: 'Dynamic ' + (Math.random() * 100).toFixed(0).toString(),
                        icon: './images/icon.svg',
                        color: 'green',
                        refresh: 10 // in seconds
                    };
                }
            }, {
                // It's best to use static badges unless you need your
                // badges to refresh.
                // You can mix and match between static and dynamic
                text: 'Static',
                icon: GRAY_ICON, // for card front badges only
                color: null
            }];
        });
}

let readDesc = function(t){
    return t.card('desc')
        .get('desc')
        .then(function(cardDesc){
            console.log('Card desc: ' + cardDesc);
        });
}

window.TrelloPowerUp.initialize({
    'card-badges': function(t, options){
        return [
            setBadges(t)
        ,
            readDesc(t)
        ]
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

