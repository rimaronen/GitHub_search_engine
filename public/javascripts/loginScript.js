
(function () {

    document.addEventListener('DOMContentLoaded', event => {

        // init error message while typing new username or password
        document.addEventListener('input', function () {
            document.getElementById('error').innerText = "";

        });
    });
})();


