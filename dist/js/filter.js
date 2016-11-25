function angularFilter(App) {

    App.filter('toTenThousand', [() => {
        return (num) => {
            if(!num) return;
            return num >= 10000 ? num / 10000 + '万' : num;
        }
    }]);
}

module.exports = angularFilter;
